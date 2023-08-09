export const uploadFiles = (req, res) => {
    if (req.files.length)
        res.status(201).send({ message: 'files uploaded' });
    else
        res.status(500).send({ message: 'files not uploaded' });
}