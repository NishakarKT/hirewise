export const rankCVs = async (req, res) => {
  try {
    const { cvs, jd } = req.body;
    res.status(200).send({ cvs, jd });
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};
