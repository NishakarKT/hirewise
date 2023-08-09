import { User, Job, Interview } from "../models.js";

export const getInterviews = async (req, res) => {
  try {
    const query = req.query;
    const users = await User.find({});
    const jobs = await Job.find({});
    const interviews = await Interview.find(query);
    const newInterviews = [];
    interviews.forEach((interview) => {
      const user = users.find((user) => user._id.toString() === interview.userId.toString());
      const job = jobs.find((job) => job._id.toString() === interview.jobId.toString());
      newInterviews.push({ ...interview._doc, user, job });
    });
    res.status(200).send(newInterviews);
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const scheduleInterviews = async (req, res) => {
  try {
    const data = req.body;
    const interviews = data.map((d) => ({ ...d, status: "pending", responses: [] }));
    await Interview.insertMany(interviews);
    res.status(200).send("Interviews scheduled successfully");
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const submitInterview = async (req, res) => {
  try {
    const { userId, jobId, responses } = req.body;
    await Interview.findOneAndUpdate({ userId, jobId }, { status: "completed", responses });
    res.status(200).send("Interview submitted successfully");
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const updateInterview = async (req, res) => {
  try {
    const { query, edits } = req.body;
    await Interview.updateMany(query, edits);
    res.status(200).send("Interviews updated successfully");
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};
