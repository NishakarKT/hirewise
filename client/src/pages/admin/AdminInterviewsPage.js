import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// constants
import { COMPANY } from '../../constants/vars';
import { INTERVIEW_GET_ENDPOINT, ADMIN_MASS_MAIL_ENDPOINT, INTERVIEW_UPDATE_ENDPOINT } from '../../constants/endpoints';
// contexts
import AppContext from '../../contexts/AppContext';
// components
import Scrollbar from '../../components/scrollbar';
// sections
import { UserListHead } from '../../sections/@dashboard/user';

const TABLE_HEAD = [
  { id: 'name', label: "User's Name", alignRight: false },
  { id: 'email', label: "User's Email", alignRight: false },
  { id: 'role', label: "Job's Role", alignRight: false },
  { id: 'status', label: "Job's Status", alignRight: false },
];

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const { user } = useContext(AppContext);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [mailOptions, setMailOptions] = useState(false);
  const [isMailing, setIsMailing] = useState(false);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = interviews.map((row) => `${row.job?._id || ''}$$${row.user?._id || ''}`);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, value) => {
    const selectedIndex = selected.indexOf(value);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, value);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleMails = (e) => {
    e.preventDefault();
    const form = e.target;
    const subject = form.subject.value;
    const message = form.message.value;
    const mailIds = interviews
      .filter((row) => selected.includes(`${row.jobId || ''}$$${row.userId || ''}`))
      .map((row) => row.user?.email);
    setIsMailing(true);
    axios
      .post(ADMIN_MASS_MAIL_ENDPOINT, { mailIds, subject, message })
      .then((res) => {
        console.log(res.data);
        setIsMailing(false);
        setMailOptions(false);
        setSelected([]);
      })
      .catch((err) => {
        console.log(err);
        setIsMailing(false);
        setMailOptions(false);
      });
  };

  const handleStatusChange = (e, _id) => {
    const status = e.target.value;
    setInterviews(interviews.map((interview) => (interview._id === _id ? { ...interview, status } : interview)));
    axios
      .patch(INTERVIEW_UPDATE_ENDPOINT, { query: { _id }, edits: { status } })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - interviews.length) : 0;

  const isNotFound = !interviews.length;

  useEffect(() => {
    if (user && user.role === 'admin') {
      axios
        .get(INTERVIEW_GET_ENDPOINT, { params: {} })
        .then((res) => setInterviews(res.data))
        .catch((err) => console.log(err));
    }
  }, [user]);

  return (
    <>
      <Helmet>
        <title> Interviews | {COMPANY} </title>
      </Helmet>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Interviews
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button disabled={!selected.length} variant="outlined" onClick={() => setMailOptions(true)}>
              Mail Applicants
            </Button>
          </Stack>
        </Stack>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  headLabel={TABLE_HEAD}
                  rowCount={interviews.length}
                  numSelected={selected.length}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {interviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const selectedUser = selected.indexOf(`${row.job?._id || ''}$$${row.user?._id || ''}`) !== -1;
                    return (
                      <TableRow
                        hover
                        key={row._id + row.job?._id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selectedUser}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUser}
                            onChange={(event) => handleClick(event, `${row.job?._id || ''}$$${row.user?._id || ''}`)}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={''} alt={row.user.name || row.user.email || 'User'} />
                            <Typography variant="subtitle2" noWrap>
                              {row.user?.name || 'User'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{row.user?.email}</TableCell>
                        <TableCell align="left">{row.job?.name}</TableCell>
                        <TableCell align="left">
                          <Select
                            fullWidth
                            variant="standard"
                            value={row.status || 'pending'}
                            onChange={(e) => handleStatusChange(e, row._id)}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="accepted">Accepted</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </TableCell>
                        {/* <TableCell align="left">
                          <Label color={((!row.status || row.status === 'pending') && 'error') || 'success'}>
                            {sentenceCase(row.status || 'pending')}
                          </Label>
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>
                          <Typography variant="body2">
                            No results found ...
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={interviews.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
        <Dialog open={mailOptions} onClose={() => setMailOptions(false)}>
          <DialogTitle>Mail Content</DialogTitle>
          <DialogContent>
            <form onSubmit={handleMails}>
              <Grid container spacing={2} pt={1}>
                <Grid item xs={12}>
                  <TextField fullWidth required name="subject" label="Subject" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth required name="message" label="Message" multiline rows={4} />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Button fullWidth variant="contained" color="error" onClick={() => setMailOptions(false)}>
                      Cancel
                    </Button>
                    <LoadingButton loading={isMailing} fullWidth type="submit" color="primary" variant="contained">
                      Send
                    </LoadingButton>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}
