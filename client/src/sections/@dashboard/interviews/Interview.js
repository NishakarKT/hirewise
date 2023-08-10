import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
// mui
import { Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Mic, MicOff, VolumeMute } from '@mui/icons-material';
// contexts
import AppContext from '../../../contexts/AppContext';
// constants
import {
  QUESTION_GET_CV_ENDPOINT,
  QUESTION_GET_JD_ENDPOINT,
  INTERVIEW_SUBMIT_ENDPOINT,
} from '../../../constants/endpoints';
import { VIDEOS_BOT_MP4 } from '../../../constants/videos';
// utils
import { clearExistingTimeouts } from '../../../utils/misc';
// vars
const TYPE_SPEED = 50;
const utterance = new SpeechSynthesisUtterance('');
utterance.lang = 'en-US';
utterance.rate = 1;
utterance.pitch = 1;
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices[4];
};
// eslint-disable-next-line new-cap
const Recognition = new window.webkitSpeechRecognition();
Recognition.lang = 'en-US';
Recognition.continuous = true;

const Interview = ({ interview }) => {
  const { user } = useContext(AppContext);
  const userRef = useRef(null);
  const botRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [displayQuestion, setDisplayQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [fetchingNext, setFetchingNext] = useState(false);
  const [isOver, setIsOver] = useState(false);

  utterance.onend = () => setIsBotSpeaking(false);

  const handleStart = () => {
    Recognition.start();
    setIsUserSpeaking(true);
  };

  const handleStop = () => {
    Recognition.stop();
    setIsUserSpeaking(false);
  };

  const handleResult = (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join('');
    handleStop();
    setAnswer(transcript);
  };

  const typeEffect = (text, setText) => {
    setText('');
    for (let i = 0; i < text.length; i += 1) setTimeout(() => setText((txt) => txt + text[i]), i * TYPE_SPEED);
  };

  const textToSpeech = (text) => {
    utterance.text = text;
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setFetchingNext(true);
    if (questions.length < 20)
      axios
        .get(questions.length < 10 ? QUESTION_GET_CV_ENDPOINT : QUESTION_GET_JD_ENDPOINT, {
          params: {
            userId: user._id,
            userName: user.name || 'User',
            jobId: interview.jobId,
            answer,
            value: questions.length < 10 ? interview.cv : interview.jd,
          },
        })
        .then((res) => {
          if (res.data.data?.output) {
            const question = res.data.data.output;
            clearExistingTimeouts();
            setQuestions((questions) => [...questions, { question, answer: '' }]);
            setQuestion(question);
            typeEffect(question, setDisplayQuestion);
            setIsBotSpeaking(true);
            setFetchingNext(false);
          } else {
            setQuestions([]);
            setQuestion('');
            setDisplayQuestion('');
            setIsBotSpeaking(false);
            setFetchingNext(false);
          }
        })
        .catch((err) => console.log(err));
    else {
      setQuestion("Thank you for your time. We'll get back to you soon.");
      typeEffect("Thank you for your time. We'll get back to you soon.", setDisplayQuestion);
      setIsBotSpeaking(true);
      setIsOver(true);
      setFetchingNext(false);
    }
  };

  const handleBot = () => {
    setIsBotSpeaking(true);
  };

  const handleSubmit = () => {
    axios
      .post(INTERVIEW_SUBMIT_ENDPOINT, { userId: interview.userId, jobId: interview.jobId, responses: questions })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    Recognition.addEventListener('result', handleResult);
    return () => Recognition.removeEventListener('result', handleResult);
  }, []);

  useEffect(() => {
    if (interview && questions.length < 20) {
      setFetchingNext(true);
      axios
        .get(questions.length < 10 ? QUESTION_GET_CV_ENDPOINT : QUESTION_GET_JD_ENDPOINT, {
          params: {
            userId: user._id,
            userName: user.name || 'User',
            jobId: interview.jobId,
            answer,
            value: questions.length < 10 ? interview.cv : interview.jd,
          },
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.data?.output) {
            const question = res.data.data.output;
            clearExistingTimeouts();
            setQuestions((questions) => [...questions, { question, answer: '' }]);
            setQuestion(question);
            typeEffect(question, setDisplayQuestion);
            setIsBotSpeaking(true);
            setFetchingNext(false);
          } else {
            setQuestions([]);
            setQuestion('');
            setDisplayQuestion('');
            setIsBotSpeaking(false);
            setFetchingNext(false);
          }
        })
        .catch((err) => console.log(err));
      // fetch user video
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          userRef.current.srcObject = stream;
          userRef.current.play();
        })
        .catch((err) => console.log(err));
    } else setQuestions([]);
  }, [interview]);

  useEffect(() => {
    setQuestions((questions) => questions.map((q, i) => (q.question === question ? { ...q, answer } : q)));
  }, [answer]);

  useEffect(() => {
    if (isBotSpeaking) {
      clearExistingTimeouts();
      typeEffect(question, setDisplayQuestion);
      textToSpeech(question);
      botRef.current.play();
      botRef.current.style.filter = 'brightness(1)';
    } else {
      botRef.current.pause();
      botRef.current.currentTime = 0;
      botRef.current.style.filter = 'brightness(0.5)';
    }
  }, [isBotSpeaking]);

  return (
    <Stack>
      <Typography variant="h6">{interview.job?.name}</Typography>
      <Stack sx={{ position: 'relative', width: '600px', minHeight: '300px' }}>
        <video
          ref={botRef}
          style={{
            position: 'absolute',
            zIndex: 0,
            width: 'calc(100% - 48px)',
            height: '100%',
            objectFit: 'cover',
            transition: 'filter 0.5s ease',
            filter: 'brightness(0.5)',
            borderRadius: '8px',
          }}
          src={VIDEOS_BOT_MP4}
          muted
          autoPlay
          loop
        />
        <video
          ref={userRef}
          style={{
            position: 'absolute',
            zIndex: 1,
            right: '48px',
            top: '0px',
            width: '150px',
            height: '150px',
            objectFit: 'cover',
          }}
          muted
          autoPlay
        />
        {!isBotSpeaking ? (
          <VolumeMute
            fontSize="large"
            sx={{ position: 'absolute', zIndex: 2, top: 16, left: 16, cursor: 'pointer', color: 'white' }}
            onClick={handleBot}
          />
        ) : null}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="flex-end"
          sx={{ zIndex: 1, width: 'calc(100% - 48px)', px: 8, height: '300px', pb: 2 }}
        >
          <Typography align="center" variant="h6" sx={{ color: 'white' }}>
            {displayQuestion}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <Typography variant="h6" color="text.secondary">
          Your Answer:
        </Typography>
        {isUserSpeaking ? (
          <Mic sx={{ cursor: 'pointer', color: 'text.secondary' }} onClick={handleStop} />
        ) : (
          <MicOff sx={{ cursor: 'pointer', color: 'text.secondary' }} onClick={handleStart} />
        )}
      </Stack>
      <TextField
        multiline
        fullWidth
        rows={4}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type / Speak your answer here ..."
        variant="outlined"
        sx={{ mt: 1 }}
      />
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }} spacing={1}>
        <LoadingButton
          disabled={!Boolean(question)}
          loading={fetchingNext}
          color="primary"
          variant="contained"
          onClick={() => (isOver ? handleSubmit() : handleNext())}
        >
          {isOver ? 'Submit' : 'Next'}
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default Interview;
