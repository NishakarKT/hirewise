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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// constants
import { COMPANY } from '../../constants/vars';
import { FILE_UPLOAD_ENDPOINT, TOOL_RANK_CVS_ENDPOINT } from '../../constants/endpoints';
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
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isRanking, setIsRanking] = useState(false);

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

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - resumes.length) : 0;

  const isNotFound = !resumes.length;

  const handleCVs = () => {
    const selectedResumes = resumes.filter((row) => selected.includes(row.name));
    const files = new FormData();
    const fileNames = [];
    selectedResumes.forEach((resume) => {
      const fileName = `admin-${user?._id}-${resume.name}`;
      fileNames.push(fileName);
      const newFile = new File([resume.file], fileName, { type: resume.file.type });
      files.append('files', newFile);
    });
    setIsRanking(true);
    axios
      .post(FILE_UPLOAD_ENDPOINT, files, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        console.log(res);
        axios
          .post(TOOL_RANK_CVS_ENDPOINT, { files: fileNames })
          .then((res) => {
            const { files } = res.data;
            const results = [];
            resumes.forEach((resume) => {
              if (files.find(file => file.includes(resume.name))) results.push(resume);
            });
            setResults(results);
            setIsRanking(false);
          })
          .catch((err) => {
            console.log(err);
            setIsRanking(false);
          });
      })
      .catch((err) => {
        console.log(err);
        setIsRanking(false);
      });
  };

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
              accept="application/pdf"
            />
            <Button variant="outlined" onClick={() => filesRef.current?.click()}>
              Upload
            </Button>
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
        {results.length ? <Card>
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
                  {results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    return (
                      <TableRow
                        hover
                        key={row._id + row.job?._id}
                        tabIndex={-1}
                        role="checkbox"
                      >
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
            count={results.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card> : null}
      </Container>
    </>
  );
}
