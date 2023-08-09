import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { sentenceCase } from 'change-case';
// @mui
import {
  Card,
  Table,
  Stack,
  Button,
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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// constants
import { COMPANY } from '../../constants/vars';
import {
  JOB_GET_APPLIS_ENDPOINT,
  ADMIN_RANK_CVS_ENDPOINT,
  ADMIN_MASS_MAIL_ENDPOINT,
  INTERVIEW_SCHEDULE_ENDPOINT,
} from '../../constants/endpoints';
// contexts
import AppContext from '../../contexts/AppContext';
// components
import Label from '../../components/label';
import Scrollbar from '../../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../../sections/@dashboard/user';

const TABLE_HEAD = [
  { id: 'name', label: "User's Name", alignRight: false },
  { id: 'email', label: "User's Email", alignRight: false },
  { id: 'role', label: "Job's Role", alignRight: false },
  { id: 'status', label: "Job's Status", alignRight: false },
];

export default function ApplicationsPage() {
  const [applis, setApplis] = useState([]);
  const [results, setResults] = useState([]);
  const [mailOptions, setMailOptions] = useState(false);
  const { user } = useContext(AppContext);
  const [page, setPage] = useState(0);
  const [resultsPage, setResultsPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [resultsSelected, setResultsSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [resultsRowsPerPage, setResultsRowsPerPage] = useState(5);
  const [isRanking, setIsRanking] = useState(false);
  const [isMailing, setIsMailing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = applis.map((row) => `${row.job?._id || ''}$$${row.user?._id || ''}`);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleResultsSelectAllClick = (event) => {
    if (event.target.checked) {
      const newResultsSelecteds = results.map((row) => `${row.job?._id || ''}$$${row.user?._id || ''}`);
      setResultsSelected(newResultsSelecteds);
      return;
    }
    setResultsSelected([]);
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

  const handleResultsClick = (event, value) => {
    const resultsSelectedIndex = resultsSelected.indexOf(value);
    let newResultsSelected = [];
    if (resultsSelectedIndex === -1) {
      newResultsSelected = newResultsSelected.concat(resultsSelected, value);
    } else if (resultsSelectedIndex === 0) {
      newResultsSelected = newResultsSelected.concat(resultsSelected.slice(1));
    } else if (resultsSelectedIndex === resultsSelected.length - 1) {
      newResultsSelected = newResultsSelected.concat(resultsSelected.slice(0, -1));
    } else if (resultsSelectedIndex > 0) {
      newResultsSelected = newResultsSelected.concat(
        resultsSelected.slice(0, resultsSelectedIndex),
        resultsSelected.slice(resultsSelectedIndex + 1)
      );
    }
    setResultsSelected(newResultsSelected);
  };

  const handleChangePage = (event, newPage) => setPage(newPage)

  const handleChangeResultsPage = (event, resultsPage) => setResultsPage(resultsPage);

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleChangeResultsRowsPerPage = (event) => {
    setResultsPage(0);
    setResultsRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - applis.length) : 0;

  const isNotFound = !applis.length;

  const handleCVs = () => {
    const selectedApplis = applis.filter((appli) => selected.includes(`${appli.jobId || ''}$$${appli.userId || ''}`));
    const apps = selectedApplis.map((appli) => ({ userId: appli.userId, jobId: appli.jobId, file: appli.file }));
    setIsRanking(true);
    axios
      .post(ADMIN_RANK_CVS_ENDPOINT, { apps })
      .then((res) => {
        const rankedCvs = res.data;
        const rankedApplis = [];
        rankedCvs.forEach((rankedCv) => {
          const appli = selectedApplis.find((appli) => appli.userId === rankedCv.userId && appli.jobId === rankedCv.jobId);
          rankedApplis.push(appli);
        });
        setResults(rankedApplis);
        setIsRanking(false);
      })
      .catch((err) => {
        console.log(err);
        setIsRanking(false);
      });
  };

  const handleMails = (e) => {
    e.preventDefault();
    const form = e.target;
    const subject = form.subject.value;
    const message = form.message.value;
    const mailIds = applis.filter((row) => resultsSelected.includes(`${row.jobId || ''}$$${row.userId || ''}`)).map((row) => row.user?.email);
    setIsMailing(true);
    axios
      .post(ADMIN_MASS_MAIL_ENDPOINT, { mailIds, subject, message })
      .then((res) => {
        console.log(res.data);
        setIsMailing(false);
        setMailOptions(false);
        setResultsSelected([]);
      })
      .catch((err) => {
        console.log(err);
        setIsMailing(false);
        setMailOptions(false);
      });
  };

  const scheduleInterviews = () => {
    if (results.length) {
      setIsScheduling(true);
      const data = resultsSelected.map((d) => ({userId: d.split("$$")[1], jobId: d.split("$$")[0]}))
      axios
        .post(INTERVIEW_SCHEDULE_ENDPOINT, data)
        .then((res) => {
          console.log(res.data);
          setIsScheduling(false);
        })
        .catch((err) => {
          console.log(err);
          setIsScheduling(false);
        });
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      axios
        .get(JOB_GET_APPLIS_ENDPOINT, { params: {} })
        .then((res) => setApplis(res.data))
        .catch((err) => console.log(err));
    }
  }, [user]);

  return (
    <>
      <Helmet>
        <title> Applications | {COMPANY} </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Applications
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
            isRanking={isRanking}
            handleCVs={handleCVs}
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  headLabel={TABLE_HEAD}
                  rowCount={applis.length}
                  numSelected={selected.length}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {applis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                          <Label color={(row.job?.status === 'Not Available' && 'error') || 'success'}>
                            {sentenceCase(row.job?.status || 'Available')}
                          </Label>
                        </TableCell>
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
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
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
            count={applis.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {results.length ? (
          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={5} mb={2}>
            <Typography variant="h4" gutterBottom>
              Results
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button disabled={!resultsSelected.length} variant="outlined" onClick={() => setMailOptions(true)}>
                Mail Applicants
              </Button>
              <LoadingButton loading={isScheduling} disabled={!resultsSelected.length} variant="contained" onClick={() => scheduleInterviews()}>
                Schedule Interviews
              </LoadingButton>
            </Stack>
          </Stack>
        ) : null}

        {results.length ? (
          <Card sx={{ mb: 2 }}>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    headLabel={TABLE_HEAD}
                    rowCount={results.length}
                    numSelected={resultsSelected.length}
                    onSelectAllClick={handleResultsSelectAllClick}
                  />
                  <TableBody>
                    {results.slice(resultsPage * resultsRowsPerPage, resultsPage * resultsRowsPerPage + resultsRowsPerPage).map((row) => {
                      const selectedUser = resultsSelected.indexOf(`${row.job?._id || ''}$$${row.user?._id || ''}`) !== -1;
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
                              onChange={(event) =>
                                handleResultsClick(event, `${row.job?._id || ''}$$${row.user?._id || ''}`)
                              }
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
                            <Label color={(row.job?.status === 'Not Available' && 'error') || 'success'}>
                              {sentenceCase(row.job?.status || 'Available')}
                            </Label>
                          </TableCell>
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
                              No results found for &nbsp;
                              <strong>&quot;{filterName}&quot;</strong>.
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
            count={results.length}
            rowsPerPage={resultsRowsPerPage}
            page={resultsPage}
            onPageChange={handleChangeResultsPage}
            onRowsPerPageChange={handleChangeResultsRowsPerPage}
          />
          </Card>
        ) : null}

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
