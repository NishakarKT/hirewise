import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { sentenceCase } from 'change-case';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
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
} from '@mui/material';
import { Close } from '@mui/icons-material';
// constants
import { COMPANY } from '../../constants/vars';
import { INTERVIEW_GET_ENDPOINT, JOB_GET_APPLIS_ENDPOINT } from '../../constants/endpoints';
// contexts
import AppContext from '../../contexts/AppContext';
// components
import Label from '../../components/label';
import Scrollbar from '../../components/scrollbar';
// sections
import { Interview } from '../../sections/@dashboard/interviews';
import { UserListHead } from '../../sections/@dashboard/user';

const TABLE_HEAD = [
  { id: 'role', label: "Job's Role", alignRight: false },
  { id: 'status', label: "Job's Status", alignRight: false },
  { id: 'deadline', label: "Job's Deadline", alignRight: false },
  { id: 'link', label: 'Link', alignRight: false },
  { id: 'result', label: 'Result', alignRight: false },
];

export default function ApplicationsPage() {
  const [interview, setInterview] = useState(null);
  const [applis, setApplis] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const { user } = useContext(AppContext);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = interviews.map(() => user?._id || '');
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - interviews.length) : 0;

  const isNotFound = !interviews.length;

  useEffect(() => {
    if (user?.email) {
      axios
        .get(INTERVIEW_GET_ENDPOINT, { params: { userId: user?._id } })
        .then((res) => setInterviews(res.data))
        .catch((err) => console.log(err));
      axios
        .get(JOB_GET_APPLIS_ENDPOINT, { params: { userId: user?._id } })
        .then((res) => setApplis(res.data))
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
        </Stack>
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  hideCheck
                  headLabel={TABLE_HEAD}
                  rowCount={interviews.length}
                  numSelected={selected.length}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {interviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const selectedUser = selected.indexOf(user?._id) !== -1;
                    return (
                      <TableRow
                        hover
                        key={row._id + row.job?._id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selectedUser}
                      >
                        <TableCell>{row.job?.name}</TableCell>
                        <TableCell>
                          <Label color={(row.job?.status === 'Not Available' && 'error') || 'success'}>
                            {sentenceCase(row.job?.status || 'Available')}
                          </Label>
                        </TableCell>
                        <TableCell>{row.job?.deadline}</TableCell>
                        <TableCell>
                          <Label
                            sx={{
                              color: 'white',
                              backgroundColor: row.job?.status === 'Not Available' ? 'lightgray' : 'primary.main',
                              cursor: row.job?.status === 'Not Available' ? 'default' : 'pointer',
                            }}
                            onClick={() =>
                              row.job?.status === 'Available'
                                ? setInterview({
                                    userId: user?._id,
                                    jobId: row.job?._id,
                                    cv: applis.find(
                                      (appli) => appli.user?._id === row.user?._id && appli.job?._id === row.job?._id
                                    )?.file,
                                    jd: applis.find(
                                      (appli) => appli.user?._id === row.user?._id && appli.job?._id === row.job?._id
                                    )?.job?.desc,
                                  })
                                : null
                            }
                          >
                            Link
                          </Label>
                        </TableCell>
                        <TableCell>
                          <Label
                            color={
                              row.status === 'pending' ||   row.status === 'completed' ? 'warning' : row.status === 'accepted' ? 'success' : 'error'
                            }
                          >
                            {row.status}
                          </Label>
                        </TableCell>{' '}
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

        <Dialog open={Boolean(interview)} onClose={() => {}}>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="primary">
                Virtual Interview
              </Typography>
              <Close sx={{ cursor: 'pointer' }} onClick={() => setInterview(null)} />
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ overflowX: 'hidden' }}>
            {interview ? <Interview interview={interview} /> : null}
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}
