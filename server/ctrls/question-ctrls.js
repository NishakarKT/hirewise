import fs from "fs";
import fetch from "node-fetch";
import { API_CV_QUESTIONS_ENDPOINT, API_JD_QUESTIONS_ENDPOINT } from "../constants/endpoints.js";

export const getQuestionCV = async (req, res) => {
  try {
    const { userId, userName, jobId, answer, value } = req.query;
    const cvText = fs.readFileSync("media/" + value, 'utf-8');
    const response = await fetch(API_CV_QUESTIONS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_ID: userId + jobId, userId: userName, user_name: userName, user_query: answer, CV: cvText }),
    });
    const data = await response.json();
    res.status(200).send(data);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: err.message || "Something went wrong" });
  }
};

export const getQuestionJD = async (req, res) => {
  try {
    const { userId, userName, jobId, answer, value } = req.query;
    const response = await fetch(API_JD_QUESTIONS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_ID: userId + jobId, userId: userName, user_name: userName, user_query: answer, Job_Desc: value }),
    });
    const data = await response.json();
    res.status(200).send(data);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: err.message || "Something went wrong" });
  }
};
