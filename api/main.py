from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Iterable, AsyncGenerator, AsyncIterable
import json
import openai
import time
import os
import ast
import Axis_prompts
import re
import pandas as pd
#from tika import parser
import textstat

openai.api_key = "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"
app = FastAPI()


class CompletionRequest(BaseModel):
    user_id: str
    JD_id: str = None
    CV: str = None
    JD: str = None
    quiz_id:str = None
    user_query: str = None
    
class CompletionGenerator:
    def generate_chat_completion(prompt: str,query: str) -> str:
        completion = openai.ChatCompletion.create(
          model="gpt-3.5-turbo",
          temperature = 0,
          max_tokens=256,
          messages=[
            {"role": "assistant", "content": prompt},
            {"role": "user", "content": query}
          ]
        )
        output = completion.choices[0].message["content"]
        return output

    def generate_completion(prompt: str) -> str:
        completion = openai.Completion.create(
          model="text-davinci-003",
          temperature = 0.7,
          max_tokens=256,
          prompt=prompt
        )
        output=completion.choices[0]['text']
        return output

class CV_database(CompletionGenerator):
    def __init__(self, user_id: str):
        self.CV = None
        self.CV_new = None
        self.rating_section = None

    def reformat_CV(CV):
        CV_info = {}
        fields = Axis_prompts.fields()
        for section in fields:
            CV_conversion_prompt = Axis_prompts.CV_converter_template(CV,section)
            formated_CV = CompletionGenerator.generate_chat_completion(prompt=CV_conversion_prompt,query="")
            CV_info[section] =formated_CV
        return CV_info

    def calc_eval(rating_section):
        avg_score_lst = []
        total_score = 0
        no_of_params = 0
        for key, value in rating_section.items():
            avg_section_score = (value['Clarity and Conciseness']['Score']*0.2 + value['Relevance']['Score']*0.5 + value['Depth of Experience']['Score']*0.3)
            total_score = total_score + avg_section_score
            no_of_params = no_of_params + 1
        avg_score = total_score/no_of_params
        return avg_score


    def eval_CV_JD(self, JD, CV):
        self.CV = CV
        self.CV_new = CV_database.reformat_CV(self.CV)
        print(self.CV,self.CV_new,JD)
        rating_section = {}
        for section, section_content in self.CV_new.items():
            rating_prompt = Axis_prompts.rating_template(JD,section,section_content) 
            rating_string = CompletionGenerator.generate_chat_completion(prompt=rating_prompt,query="")
            rating_string.replace("\n", "").replace(" ", "")
            print(rating_string)
            rating_dictionary = ast.literal_eval(rating_string)
            rating_section[section] = rating_dictionary
        self.rating_section = rating_section
        rating = CV_database.calc_eval(self.rating_section)
        return(rating)

class QuestionHandler:
    def __init__(self, user_id, doc_type):
        self.query = None
        self.username = None
        self.output = None
        self.history = None
        self.user_id = user_id
        self.prev = None
        self.question = None
        self.list_topic = None
        self.result = None
        self.doc = None
        self.doc_type = doc_type  # 'CV' or 'JD'

    def results(self):
        Question_Temp = "-You have to extract the question from the following text. Just extract the question."
        try:
            print(self.prev)
            question = CompletionGenerator.generate_chat_completion(prompt=Question_Temp, query=self.prev)
            self.question = question
        except:
            pass
        Result_Template = f"""
        You are given a response of a candidate  as an input and the question is at the bottom. Your job is to tell wether that question was solved correctly or not.
        You will have to give a score between 1-10 on the basis of correctness of answer on the basis of INSTRUCTIONS below:
        [INSTRUCTIONS]
        -You have the both Question and Answer you have to score on a scale of 1-10 where 1 being the worst or completly incorrect and 10 being the completly correct answer.
        -Question is at the bottom. Judge to best of your ability.
        -Just give the score and nothing else. You will only display the score and nothing else.

        Question:{self.question}
        """
        try:
            if(self.output != None):
                self.result = CompletionGenerator.generate_chat_completion(prompt=Result_Template, query=self.query)
                print("###############################")
                print(self.result)
                print("################################")
        except:
            pass
        pass

    def run_summary(self):
        temp = Axis_prompts.summary_template(self.history, self.question, self.query, self.result)
        output = CompletionGenerator.generate_completion(prompt = temp)
        self.history = output
        print(output)
        return output

    def response(self, query, doc):
        self.doc = doc
        if(query == ""):
            self.history = self.run_summary()
            doc_keyword_prompt = Axis_prompts.keyword_prompt(self.doc_type)
            print(doc_keyword_prompt)
            print(self.doc)
            list_topic = CompletionGenerator.generate_chat_completion(prompt = doc_keyword_prompt, query = self.doc)
            print(list_topic)
            self.list_topic = list_topic
        self.query = query
        template = Axis_prompts.QuestionsPrompt(self.doc_type, self.list_topic, self.history)
        output = CompletionGenerator.generate_chat_completion(prompt = template, query = query)
        self.output = output
        if(query != ""):
            self.results()
            self.history = self.run_summary()
        self.prev = output
        print(self.prev)
        return output

class JDInput(BaseModel):
    jd_contents: str

class JDResult(BaseModel):
    overall_readability_score: float
    section_scores: dict
    final_score: float
    recommended_sections: dict

class JD_eval:
    def JD_evalution(JD):
        #Define the Prompt Template
        job_description_prompt = Axis_prompts.jd_description_template(JD)

        #Extract Section Headings from the JD
        required_sections = ['Job Title', 'Job Summary', 'Responsibilities', 'Requirements', 'Preferred Qualification', 'Company Overview', 'Benefits/Perks', 'Salary Range', 'Location', 'Contact Information']

        section_wts = {'Job Title':10, 'Job Summary':5, 'Responsibilities':10, 'Requirements':10, 'Preferred Qualification':10, 'Company Overview':8, 'Benefits/Perks':7, 'Salary Range':6, 'Location':5, 'Contact Information':5}

        result = CompletionGenerator.generate_chat_completion(prompt = job_description_prompt,query= "")
        sections = result.split(',')
        sections = [section.strip(' ') for section in sections]
        sections = [section.strip("'") for section in sections]
        sections = [section for section in sections if section in required_sections]

        section_scores = [section_wts[section] for section in sections]
        final_score = sum(section_scores)/sum(section_wts.values())

        # print(final_score)

        # Extract the Section Contents
        section_contents = dict()
        for section in sections:
            section_text = CompletionGenerator.generate_chat_completion(prompt = job_description_prompt, query=f"Extract and return the {section} of the job description? Return the section verbatim.")
            section_contents[section] = section_text

        # Calculate Readability Scores for each section
        section_scores = dict()
        for section in sections:
            readability_score = textstat.text_standard(section_contents[section], float_output=True)
            readability_score = readability_score - 12 if readability_score > 12 else 1
            section_scores[section] = readability_score


        # Calculate the overall Readability Score
        overall_readability_score = textstat.text_standard(JD, float_output=True)
        overall_readability_score = overall_readability_score - 12 if overall_readability_score > 12 else 1

        # Recommed the sections to be rewritten
        recommended_sections = dict()

        for section in sections:
            section_content = section_contents[section]
            job_description_prompt = Axis_prompts.jd_description_template(section_content)
            suggested_text = CompletionGenerator.generate_chat_completion(prompt = job_description_prompt, query=f"Given the contents of the section {section}, please suggest a better way to write the section which will make it more readable.")
            recommended_sections[section] = suggested_text

        return_dict = {
            'overall_readability_score': overall_readability_score,
            'section_scores': section_scores,
            'final_score': final_score,
            'recommended_sections': recommended_sections
        }
        return return_dict


CV_questions_generator = {}
CV_database_generator = {}
JD_database_generator = {}
JD_questions_generator = {}



@app.post("/Eval-CV")
def eval_CV(request: CompletionRequest):
    JD = request.JD
    CV = request.CV
    user_id = request.user_id
    CV_database_generator[user_id] = CV_database(user_id)
    CV_eval = CV_database_generator[user_id].eval_CV_JD(JD, CV)
    return JSONResponse({"data": CV_eval,"status": 200, "message": "CV evaluted successfully"})

@app.post("/Eval-JD")
def jd_eval(request: CompletionRequest):  
    JD = request.JD
    user_id = request.user_id
    return_dict = JD_eval.JD_evalution(JD)
    return JSONResponse({"data": return_dict,"status": 200, "message": "CV evaluted successfully"})

@app.post("/Question-CV")
def Question_CV(request: CompletionRequest):
    user_query=request.user_query
    user_id=request.user_id
    CV=request.CV
    quiz_id=request.quiz_id
    if quiz_id not in CV_questions_generator:
        CV_questions_generator[quiz_id] = QuestionHandler(user_id,"CV")
    if quiz_id not in CV_questions_generator:
        raise HTTPException(status_code=500, detail="Failed to create Quiz Bot.")
    output=CV_questions_generator[quiz_id].response(user_query,CV)
    # print(output)
    return JSONResponse({"data": {"output":output},"status": 200, "message": "Response successful"})
    

@app.post("/Question-JD")
def Question_JD(request: CompletionRequest):
    user_query=request.user_query
    user_id=request.user_id
    JD=request.JD
    quiz_id=request.quiz_id
    if quiz_id not in JD_questions_generator:
        JD_questions_generator[quiz_id] = QuestionHandler(user_id,"Job Description")
    if quiz_id not in JD_questions_generator:
        raise HTTPException(status_code=500, detail="Failed to create Quiz Bot.")
    output=JD_questions_generator[quiz_id].response(user_query,JD)
    # print(output)
    return JSONResponse({"data": {"output":output},"status": 200, "message": "Response successful"})
    
