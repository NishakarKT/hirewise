import React, { useRef, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Grid, Stack, TextField, Typography, CircularProgress, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// contexts
import AppContext from '../../contexts/AppContext';
// constants
import { COMPANY } from '../../constants/vars';
import { JOB_NEW_ENDPOINT, JOB_GET_ENDPOINT, ADMIN_SUGGEST_DESC_ENDPOINT } from '../../constants/endpoints';
// components
import { JobList } from '../../sections/@dashboard/jobs';

function CircularProgressWithLabel(props) {
  return (
    <Tooltip title={props.title}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">{`${Math.round(
            props.value
          )}%`}</Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}

export default function AdminJobsPage() {
  const { user } = useContext(AppContext);
  const formRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);
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
      .post(ADMIN_SUGGEST_DESC_ENDPOINT, { desc, userId: user?._id })
      .then((res) => {
        const data = res.data.data;
        console.log(data)
        let desc = '';
        Object.keys(data.recommended_sections).forEach((section) => {
          desc += `${section}\n`;
          desc += `${data.recommended_sections[section]}\n\n`;
        });
        setFinalScore(data.final_score);
        setReadabilityScore(data.overall_readability_score);
        setSuggestedDescription(desc);
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
              <TextField fullWidth required name="desc" label="Description" rows={4} multiline />
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
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <CircularProgressWithLabel
                    title="Final Score"
                    value={(finalScore * 100).toFixed(0)}
                    color={finalScore < 0.3 ? 'error' : finalScore < 0.6 ? 'warning' : 'success'}
                  />
                  <CircularProgressWithLabel
                    title="Readability Score"
                    value={(readabilityScore * 100).toFixed(0)}
                    color={readabilityScore < 0.3 ? 'error' : readabilityScore < 0.6 ? 'warning' : 'success'}
                  />
                </Stack>
                <Stack direction="row" justifyContent="flex-start" spacing={2}>
                  <LoadingButton
                    onClick={handleSuggestedDescription}
                    loading={isSuggesting}
                    color="primary"
                    variant="outlined"
                  >
                    Suggest
                  </LoadingButton>
                  <LoadingButton type="submit" loading={isUploading} color="primary" variant="contained">
                    Submit
                  </LoadingButton>
                </Stack>
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
