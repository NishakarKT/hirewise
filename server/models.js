import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    token: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    hashedOtp: { type: String, default: "", required: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const jobSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    desc: { type: String, default: "" },
    ctc: { type: String, default: "" },
    deadline: { type: String, default: "" },
    status: { type: String, default: "Available" },
  },
  { timestamps: true }
);

const jobAppliSchema = new mongoose.Schema(
  {
    jobId: { type: String, default: "" },
    userId: { type: String, default: "" },
    file: { type: String, default: "" },
  },
  { timestamps: true }
);

const interviewShema = new mongoose.Schema(
  {
    userId: { type: String, default: "" },
    jobId: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    responses: { type: Array, default: [] },
  },
  { timestamps: true }
);

export const Otp = new mongoose.model("otp", otpSchema);
export const User = new mongoose.model("user", userSchema);
export const Job = new mongoose.model("job", jobSchema);
export const JobAppli = new mongoose.model("jobAppli", jobAppliSchema);
export const Interview = new mongoose.model("interview", interviewShema);
