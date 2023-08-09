import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Grid, Button, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// constants
import { COMPANY } from '../../constants/vars';
import { JOB_NEW_ENDPOINT, JOB_GET_ENDPOINT, ADMIN_SUGGEST_DESC_ENDPOINT } from '../../constants/endpoints';
// components
import { JobList } from '../../sections/@dashboard/jobs';

export default function AdminJobsPage() {
  const formRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState('');

  const handleNewJob = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formRef.current));
    setIsUploading(true);
    axios
      .post(JOB_NEW_ENDPOINT, data)
      .then((res) => {
        setJobs([data, ...jobs]);
        setIsUploading(false);
        e.target.reset();
      })
      .catch((err) => {
        console.log(err);
        setIsUploading(false);
      });
  };

  const handleSuggestedDescription = () => {
    const desc = formRef.current.desc.value;
    setIsSuggesting(true);
    axios
      .post(ADMIN_SUGGEST_DESC_ENDPOINT, { desc })
      .then((res) => {
        const suggestedDesc = res.data.desc;
        setSuggestedDescription(suggestedDesc);
        setIsSuggesting(false);
      })
      .catch((err) => {
        console.log(err);
        setIsSuggesting(false);
      });
  };

  useEffect(() => {
    axios
      .get(JOB_GET_ENDPOINT)
      .then((res) => {
        console.log(res.data);
        setJobs(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <Helmet>
        <title>Jobs | {COMPANY}</title>
      </Helmet>
      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          New Job
        </Typography>
        <form ref={formRef} onSubmit={handleNewJob}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required name="name" label="Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required name="status" label="Status" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required name="ctc" label="CTC" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required name="deadline" label="Deadilne" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                onBlur={() => handleSuggestedDescription()}
                required
                name="desc"
                label="Description"
                rows={4}
                multiline
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                value={suggestedDescription}
                label="Suggested Description"
                rows={4}
                multiline
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <LoadingButton
                  fullWidth
                  loading={isSuggesting}
                  color="error"
                  variant="contained"
                  onClick={() => formRef.current?.reset()}
                >
                  Clear
                </LoadingButton>
                <LoadingButton
                  type="submit"
                  fullWidth
                  loading={isSuggesting || isUploading}
                  color="primary"
                  variant="contained"
                >
                  Submit
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </form>
        <Typography variant="h4" sx={{ mb: 5, mt: 5 }}>
          Jobs
        </Typography>
        {jobs.length ? (
          <JobList isAdmin jobs={jobs} />
        ) : (
          <>
            <Typography color="text.secondary" variant="h4" align="center">
              No Jobs
            </Typography>
            <Typography color="text.secondary" variant="h6" align="center">
              Add jobs to see them here
            </Typography>
          </>
        )}
      </Container>
    </>
  );
}
