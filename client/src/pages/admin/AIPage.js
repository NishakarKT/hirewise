import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// constants
import { COMPANY } from '../../constants/vars';
import { API_CV_JD_EVAL_ENDPOINT, FILE_UPLOAD_ENDPOINT, JOB_GET_ENDPOINT } from '../../constants/endpoints';
// contexts
import AppContext from '../../contexts/AppContext';
// components
import Scrollbar from '../../components/scrollbar';
// sections
import { UserListHead } from '../../sections/@dashboard/user';
import { getMemorySize } from '../../utils/misc';

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'size', label: 'Size', alignRight: false },
];

export default function ApplicationsPage() {
  const filesRef = useRef(null);
  const { user } = useContext(AppContext);
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState([]);
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(0);
  const [resultsPage, setResultsPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [resultsRowsPerPage, setResultsRowsPerPage] = useState(5);
  const [isRanking, setIsRanking] = useState(false);
  const [job, setJob] = useState(null);
  const [jobs, setJobs] = useState([]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = resumes.map((row) => row.name);
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

  const handleResultsChangePage = (event, newPage) => {
    setResultsPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleChangeResultsRowsPerPage = (event) => {
    setResultsPage(0);
    setResultsRowsPerPage(parseInt(event.target.value, 10));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - resumes.length) : 0;

  const isNotFound = !resumes.length;

  const handleCVs = () => {
    const selectedResumes = resumes.filter((row) => selected.includes(row.name));
    const cvs = [];
    selectedResumes.forEach((resume) => {
      const file = resume.file;
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        cvs.push({ cv: text, jd: jobs.find((j) => j._id === job)?.desc });
        if (cvs.length === selectedResumes.length) {
          console.log(cvs);
          // cvs.forEach(({ cv, jd }) => {
          //   axios
          //     .post(API_CV_JD_EVAL_ENDPOINT, { CV: cv, JD: jd })
          //     .then((res) => console.log(res.data))
          //     .catch((err) => console.log(err));
          // });
        }
      };
      reader.readAsText(file);
    });
    // setIsRanking(true);
    // axios
    //   .post(API_CV_JD_EVAL_ENDPOINT, { files: fileNames, desc: jobs.find((j) => j._id === job)?.desc })
    //   .then((res) => {
    //     console.log(res.data);
    //     const { files } = res.data;
    //     const results = [];
    //     resumes.forEach((resume) => {
    //       if (files.find((file) => file.includes(resume.name))) results.push(resume);
    //     });
    //     setResults(results);
    //     setIsRanking(false);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     setIsRanking(false);
    //   });
  };

  useEffect(() => {
    axios
      .get(JOB_GET_ENDPOINT)
      .then((res) => {
        if (res.data.length) {
          setJobs(res.data);
          setJob(res.data[0]._id);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (files.length) {
      const resumes = [];
      Array.from(files).forEach((file) => {
        resumes.push({
          name: file.name,
          type: file.type,
          size: file.size,
          file,
        });
      });
      setSelected([]);
      setResumes(resumes);
    }
  }, [files]);

  return (
    <>
      <Helmet>
        <title> Artificial Intelligence | {COMPANY} </title>
      </Helmet>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt={5} mb={2}>
          <Typography variant="h4" gutterBottom>
            Resume Ranking
          </Typography>
          <Stack direction="row" spacing={1}>
            <input
              ref={filesRef}
              style={{ display: 'none' }}
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              accept=".txt,.pdf,.docx"
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              {job ? (
                <Select variant="standard" sx={{ minWidth: 200 }} value={job} onChange={(e) => setJob(e.target.value)}>
                  {jobs.map((job) => (
                    <MenuItem value={job._id}>{job.name}</MenuItem>
                  ))}
                </Select>
              ) : null}
              <Button variant="outlined" onClick={() => filesRef.current?.click()}>
                Upload
              </Button>
            </Stack>
          </Stack>
        </Stack>
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  headLabel={TABLE_HEAD}
                  rowCount={resumes.length}
                  numSelected={selected.length}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {resumes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const selectedResume = selected.indexOf(row.name) !== -1;
                    return (
                      <TableRow
                        hover
                        key={row._id + row.job?._id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selectedResume}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedResume} onChange={(event) => handleClick(event, row.name)} />
                        </TableCell>
                        <TableCell align="left">{row.name}</TableCell>
                        <TableCell align="left">{row.type}</TableCell>
                        <TableCell align="left">{getMemorySize(row.size)}</TableCell>
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
                            No Resumes Loaded
                          </Typography>
                          <Typography variant="body2">Upload resumes to rank them.</Typography>
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
            count={resumes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          <Stack direction="row" justifyContent="flex-end" p={2}>
            <LoadingButton disabled={!selected.length} variant="contained" loading={isRanking} onClick={handleCVs}>
              Rank Resumes
            </LoadingButton>
          </Stack>
        </Card>
        {results.length ? (
          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={5} mb={2}>
            <Typography variant="h4" gutterBottom>
              Results
            </Typography>
          </Stack>
        ) : null}
        {results.length ? (
          <Card>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    hideCheck
                    headLabel={TABLE_HEAD}
                    rowCount={results.length}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {results
                      .slice(resultsPage * resultsRowsPerPage, resultsPage * resultsRowsPerPage + resultsRowsPerPage)
                      .map((row) => (
                        <TableRow hover key={row._id + row.job?._id} tabIndex={-1} role="checkbox">
                          <TableCell align="left">{row.name}</TableCell>
                          <TableCell align="left">{row.type}</TableCell>
                          <TableCell align="left">{getMemorySize(row.size)}</TableCell>
                        </TableRow>
                      ))}
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
                              No Resumes Loaded
                            </Typography>
                            <Typography variant="body2">Upload resumes to rank them.</Typography>
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
              onPageChange={handleResultsChangePage}
              onRowsPerPageChange={handleChangeResultsRowsPerPage}
            />
          </Card>
        ) : null}
      </Container>
    </>
  );
}
