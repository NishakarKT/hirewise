import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// @mui
import { Grid, Dialog, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// constants
import { FILE_UPLOAD_ENDPOINT, JOB_APPLY_ENDPOINT } from '../../../constants/endpoints';
// contexts
import AppContext from '../../../contexts/AppContext';
// components
import JobCard from './JobCard';

JobList.propTypes = {
  jobs: PropTypes.array.isRequired,
};

export default function JobList({ jobs, isAdmin, ...other }) {
  const { user } = useContext(AppContext);
  const [job, setJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setJob(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fileNames = [];
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      const fileName = `${user.email}-${job.name}-${index + 1}.${file.name.split('.').pop()}`;
      const newFile = new File([file], fileName, { type: file.type });
      formData.append('files', newFile);
      fileNames.push(fileName);
    });
    setIsLoading(true);
    try {
      axios
        .post(FILE_UPLOAD_ENDPOINT, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          const payload = { file: fileNames.length ? fileNames[0] : '', jobId: job._id, userId: user._id };
          axios
            .post(JOB_APPLY_ENDPOINT, payload)
            .then((res) => {
              console.log(res.data);
              setIsLoading(false);
              handleClose();
            })
            .catch((err) => {
              console.log(err);
              setIsLoading(false);
              handleClose();
            });
        })
        .catch((err) => {
          console.log(err);
          handleClose();
          setIsLoading(false);
        });
    } catch (err) {
      console.log(err);
      handleClose();
      setIsLoading(false);
    }
  };

  return (
    <Grid container spacing={3} {...other}>
      {jobs.map((job) => (
        <Grid key={job?.id} item xs={12} sm={6} md={4}>
          <JobCard job={job} isAdmin={isAdmin} setJob={setJob} />
        </Grid>
      ))}
      <Dialog keepMounted open={Boolean(job)} onClose={handleClose} aria-describedby="alert-dialog-slide-description">
        <DialogTitle color="primary">{job?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">{job?.desc}</DialogContentText>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              Application Form
            </Typography>
            <Grid container spacing={2} py={2}>
              <Grid item xs={12}>
                <TextField label="Email" disabled defaultValue={user?.email} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">Upload Resume / CV</Typography>
                <input required id="cv" type="file" onChange={(e) => setFiles(e.target.files)} accept='application/pdf'  />
              </Grid>
            </Grid>
            <LoadingButton loading={isLoading} fullWidth type="submit" variant="contained">
              Submit
            </LoadingButton>
          </form>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
