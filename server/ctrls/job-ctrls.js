import mongoose from "mongoose";
import { Job, JobAppli, User } from "../models.js";

export const getJobs = (req, res) => {
  try {
    const query = req.query;
    Job.find(query, (err, jobs) => {
      if (err) return res.status(500).send({ error: err || "Something went wrong" });
      res.status(200).send(jobs.reverse());
    });
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const newJob = (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const job = new Job(data);
    job.save((err, job) => {
      if (err) return res.status(500).send({ error: err || "Something went wrong" });
      res.status(201).send({ data: job });
    });
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const applyJob = (req, res) => {
  try {
    const { userId, jobId, file } = req.body;
    const jobAppli = new JobAppli({ jobId, userId, file });
    jobAppli.save((err, jobAppli) => {
      if (err) return res.status(500).send({ error: err || "Something went wrong" });
      res.status(201).send({ data: jobAppli });
    });
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const getApplis = (req, res) => {
  try {
    const query = req.query;
    // get job applis, and for each array fetch user from userId and job from jobId and combine them
    JobAppli.find(query, (err, applis) => {
      if (err) return res.status(500).send({ error: err || "Something went wrong" });
      User.find({}, (err, users) => {
        if (err) return res.status(500).send({ error: err || "Something went wrong" });
        Job.find({}, (err, jobs) => {
          if (err) return res.status(500).send({ error: err || "Something went wrong" });
          const data = applis.map((appli) => {
            const user = users.find((user) => user._id.toString() === appli.userId.toString());
            const job = jobs.find((job) => job._id.toString() === appli.jobId.toString());
            return { ...appli._doc, user, job };
          });
          res.status(200).send(data);
        });
      });
    });
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};
