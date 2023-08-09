import express from "express";
// services
import { upload } from "./services/file-services.js";
// controllers
import * as miscCtrls from "./ctrls/misc-ctrls.js";
import * as authCtrls from "./ctrls/auth-ctrls.js";
import * as jobCtrls from "./ctrls/job-ctrls.js";
import * as adminCtrls from "./ctrls/admin-ctrls.js";
import * as interviewCtrls from "./ctrls/interview-ctrls.js";
import * as questionCtrls from "./ctrls/question-ctrls.js";
import * as toolCtrls from "./ctrls/tool-ctrls.js";
import * as fileCtrls from "./ctrls/file-ctrls.js";

const Router = express.Router();

// misc rouets
Router.get("/", miscCtrls.index);
// Auth Routes
Router.post("/auth/in", authCtrls.signIn);
Router.post("/auth/token", authCtrls.token);
Router.post("/auth/otp-generate", authCtrls.otp_generate);
Router.post("/auth/otp-verify", authCtrls.otp_verify);
// Job Routes
Router.get("/job/get", jobCtrls.getJobs);
Router.post("/job/new", jobCtrls.newJob);
Router.post("/job/apply", jobCtrls.applyJob);
Router.get("/job/get-applis", jobCtrls.getApplis);
// Interview Routes
Router.get("/interview/get", interviewCtrls.getInterviews);
Router.post("/interview/schedule", interviewCtrls.scheduleInterviews);
Router.post("/interview/submit", interviewCtrls.submitInterview);
Router.patch("/interview/update", interviewCtrls.updateInterview);
// Question Routes
Router.get("/question/get", questionCtrls.getQuestions);
// Tools Routes
Router.post("/tool/rank-cvs", toolCtrls.rankCvs);
// Admin Routes
Router.post("/admin/rank-cvs", adminCtrls.rankCvs);
Router.post("/admin/mass-mail", adminCtrls.massMail);
Router.post("/admin/suggest-desc", adminCtrls.suggestDesc);
// File Routes
Router.post("/file/upload", upload.array("files"), fileCtrls.uploadFiles);

export default Router;
