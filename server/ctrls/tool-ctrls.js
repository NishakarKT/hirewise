import fetch from "node-fetch";
import { API_CV_EVAL_ENDPOINT } from "../constants/endpoints.js";

export const rankCVs = async (req, res) => {
  try {
    const { cvs } = req.body;
    const results = [];
    cvs.forEach(async ({ cv, cvName, jd, userId }) => {
      const response = await fetch(API_CV_EVAL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ JD: jd, CV: cv, user_id: userId }),
      });
      const data = await response.json();
      results.push({ cvName, score: data.data });
      if (results.length === cvs.length) res.status(200).send(results);
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: err.message || "Something went wrong" });
  }
};
