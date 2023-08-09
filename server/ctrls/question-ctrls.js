const questions = ["How are you?", "What is your name?", "What is your favorite color?", "What is your favorite food?", "What is your favorite animal?", "What is your favorite movie?"];

export const getQuestions = async (req, res) => {
  try {
    const { jobId, answer } = req.params;
    return res.status(200).json([questions[Math.floor(Math.random() * questions.length)]]);
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};
