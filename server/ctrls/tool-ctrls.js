export const rankCvs = async (req, res) => {
  try {
    const { files } = req.body;
    res.status(200).send({ files });
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};
