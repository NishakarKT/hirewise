import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// constants
import { COMPANY } from '../../constants/vars';
import { JOB_GET_ENDPOINT } from '../../constants/endpoints';
// components
import { JobList } from '../../sections/@dashboard/jobs';

export default function JobsPage() {    
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get(JOB_GET_ENDPOINT)
      .then((res) => {
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
          Jobs
        </Typography>
        {jobs.length ? (
          <JobList jobs={jobs} />
        ) : (
          <>
            <Typography color="text.secondary" variant="h4" align="center">
              No Jobs
            </Typography>
            <Typography color="text.secondary" variant="h6" align="center">
              Please check back later
            </Typography>
          </>
        )}
      </Container>
    </>
  );
}
