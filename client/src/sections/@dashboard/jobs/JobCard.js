import React from 'react';
import PropTypes from 'prop-types';
// @mui
import { Box, Card, Typography, Stack, Button } from '@mui/material';
// components
import Label from '../../../components/label';

JobCard.propTypes = {
  product: PropTypes.object,
};

export default function JobCard({ job, setJob, isAdmin }){
  return (
    <Card>
      <Box sx={{ pt: 3, position: 'relative' }}>
        {job?.status && (
          <Label
            variant="filled"
            color={(job?.status === 'Not Available' && 'error') || 'primary'}
            sx={{
              zIndex: 9,
              top: 16,
              right: 16,
              position: 'absolute',
              textTransform: 'uppercase',
            }}
          >
            {job?.status}
          </Label>
        )}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography color="primary" variant="subtitle2">
          {job?.name}
        </Typography>

        <Typography variant="body2">{job?.desc}</Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography color="primary" variant="subtitle1">
            {job?.ctc}
          </Typography>
          <Typography color="error" variant="subtitle1">
            {job?.deadline}
          </Typography>
        </Stack>

        {!isAdmin ? <Button variant="contained" onClick={() => setJob(job)}>
          Apply
        </Button> : null}
      </Stack>
    </Card>
  );
};