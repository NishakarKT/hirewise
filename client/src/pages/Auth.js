import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import validator from 'validator';
import { Helmet } from 'react-helmet';
// mui
import {
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Divider,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AccountCircle, Key, Login, LockOpen, Pix, StarBorder, Google } from '@mui/icons-material';
// firebase
import { auth, googleProvider } from '../firebase';
// contexts
import AppContext from '../contexts/AppContext';
// constants
import { COMPANY, COMPANY2 } from '../constants/vars';
import { HOME_ROUTE } from '../constants/routes';
import { AUTH_IN_ENDPOINT, AUTH_OTP_GENERATE_ENDPOINT, AUTH_OTP_VERIFY_ENDPOINT } from '../constants/endpoints';
import { VIDEOS_AUTH_MP4 } from '../constants/videos';

const AuthUser = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isGglLoading, setIsGglLoading] = useState(false);
  const [remMe, setRemMe] = useState(true);
  const [emailErr, setEmailErr] = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleGoogleAuth = () => {
    setIsGglLoading(true);
    auth
      .signInWithPopup(googleProvider)
      .then((res) => {
        const email = res.user.email;
        axios
          .post(AUTH_IN_ENDPOINT, { email })
          .then((res) => {
            const { user, token } = res.data;
            // storing token
            if (remMe) {
              const localData = JSON.parse(localStorage.getItem(COMPANY)) || {};
              localStorage.setItem(COMPANY, JSON.stringify({ ...localData, token }));
            } else {
              const localData = JSON.parse(localStorage.getItem(COMPANY)) || {};
              delete localData.token;
              localStorage.setItem(COMPANY, JSON.stringify(localData));
            }
            // setting user
            setUser(user);
            // back to home
            navigate(HOME_ROUTE);
            // resets
            setIsGglLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setIsGglLoading(false);
          });
      })
      .catch((err) => {
        console.log(err);
        setIsGglLoading(false);
      });
  };

  const generateOtp = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    if (!validator.isEmail(email)) setEmailErr('Please, provide a valid email addess.');
    else {
      try {
        setIsLoading(true);
        axios
          .post(AUTH_OTP_GENERATE_ENDPOINT, { email })
          .then((res) => {
            const { token } = res.data;
            // storing token
            const localData = JSON.parse(localStorage.getItem(COMPANY)) || {};
            localStorage.setItem(COMPANY, JSON.stringify({ ...localData, token }));
            // open otp form
            setIsOtpSent(true);
            // resets
            setIsLoading(false);
            setEmailErr('');
          })
          .catch((err) => {
            // resets
            console.log(err);
            setIsLoading(false);
            setEmailErr(err.response.data.message || 'Something went wrong!');
          });
      } catch (err) {
        // resets
        setIsLoading(false);
        setEmailErr('Something went wrong! Try refreshing.');
      }
    }
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const otp = formData.get('otp');
    const token = JSON.parse(localStorage.getItem(COMPANY))?.token;
    if (!otp) setOtpErr('Please, provide the One Time Password (OTP).');
    else if (!email || !token) {
      setEmailErr('Please, provide your email addess.');
      setIsOtpSent(false);
    } else {
      try {
        setIsLoading(true);
        axios
          .post(AUTH_OTP_VERIFY_ENDPOINT, { otp, email, token })
          .then(async (res) => {
            if (res.data.verified) {
              // OTP is verified
              axios
                .post(AUTH_IN_ENDPOINT, { email })
                .then((res) => {
                  const { user, token } = res.data;
                  // storing token
                  if (remMe) {
                    const localData = JSON.parse(localStorage.getItem(COMPANY)) || {};
                    localStorage.setItem(COMPANY, JSON.stringify({ ...localData, token }));
                  } else {
                    const localData = JSON.parse(localStorage.getItem(COMPANY)) || {};
                    delete localData.token;
                    localStorage.setItem(COMPANY, JSON.stringify(localData));
                  }
                  // setting user
                  setUser(user);
                  // resets
                  setIsLoading(false);
                  setOtpErr('');
                  navigate(HOME_ROUTE);
                })
                .catch((err) => {
                  // resets
                  console.log(err);
                  setIsLoading(false);
                  setOtpErr(err.response.data.message || 'Something went wrong!');
                });
            } else {
              // resets
              setIsLoading(false);
              setOtpErr('OTP is invalid. Try again.');
            }
          })
          .catch((err) => {
            // resets
            setIsLoading(false);
            setOtpErr(err.message || 'Something went wrong!');
          });
      } catch (err) {
        // resets
        setIsLoading(false);
        console.log(err.message);
        setOtpErr('Something went wrong! Try refreshing.');
      }
    }
  };

  return (
    <Container
      sx={{
        postion: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw !important',
        p: '0 !important',
      }}
    >
      <Helmet>
        <title>Auth | {COMPANY}</title>
      </Helmet>
      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={12} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%' }}>
            <Grid container sx={{ height: '100%' }}>
              <Grid item sm={12} md={6} lg={8} sx={{ display: { sm: 'none', md: 'flex' } }}>
                <Stack
                  sx={{ position: 'relative', width: '100%', height: '100%', display: { xs: 'none', sm: 'flex' } }}
                  justifyContent="flex-end"
                >
                  <video
                    style={{ position: 'absolute', zIndex: '0', width: '100%', height: '100%', objectFit: 'cover' }}
                    src={VIDEOS_AUTH_MP4}
                    muted
                    autoPlay
                    loop
                  />
                  <Stack
                    justifyContent="flex-end"
                    sx={{ backgroundColor: 'rgba(0, 0, 255, 0.4)', height: '100%', zIndex: 1 }}
                  >
                    <Stack p={2} spacing={2} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                      <Typography color="white" variant="h4">
                        Shop. Discover. Delight. Welcome to {COMPANY}!
                      </Typography>
                      <List disablePadding>
                        <ListItem disableGutters disablePadding>
                          <ListItemIcon>
                            <StarBorder sx={{ color: 'white' }} />
                          </ListItemIcon>
                          <ListItemText
                            sx={{ color: 'white' }}
                            primary="Revolutionize your hiring process with HireWise AI: Unleash the power of automation for smarter, faster recruitment"
                          />
                        </ListItem>
                        <ListItem disableGutters disablePadding>
                          <ListItemIcon>
                            <StarBorder sx={{ color: 'white' }} />
                          </ListItemIcon>
                          <ListItemText
                            sx={{ color: 'white' }}
                            primary="Elevate your HR game with HireWise AI: Say goodbye to manual tasks and welcome efficient, data-driven hiring"
                          />
                        </ListItem>
                        <ListItem disableGutters disablePadding>
                          <ListItemIcon>
                            <StarBorder sx={{ color: 'white' }} />
                          </ListItemIcon>
                          <ListItemText
                            sx={{ color: 'white' }}
                            primary="Transforming Recruitment: Let us streamline your hiring journey, from sourcing to onboarding"
                          />
                        </ListItem>
                        <ListItem disableGutters disablePadding>
                          <ListItemIcon>
                            <StarBorder sx={{ color: 'white' }} />
                          </ListItemIcon>
                          <ListItemText sx={{ color: 'white' }} primary="Uncover Hidden Talent Faster: Identify the perfect candidates swiftly and effortlessly" />
                        </ListItem>
                      </List>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item sm={12} md={6} lg={4}>
                <Stack flex={1} px={2} spacing={1} justifyContent="center" sx={{ height: '100%' }}>
                  <Stack direction="row" alignItems="center">
                    <Pix color="primary" fontSize="large" />
                    <Stack sx={{ userSelect: 'none', ml: 1 }}>
                      <Typography color="primary" variant="h6" align="left">
                        {COMPANY}
                      </Typography>
                      <Typography variant="body2" align="left" gutterBottom>
                        {COMPANY2}
                      </Typography>
                    </Stack>
                  </Stack>
                  <form onSubmit={(e) => (!isOtpSent ? generateOtp(e) : verifyOtp(e))}>
                    <Stack>
                      <TextField
                        variant="standard"
                        label="Email"
                        name="email"
                        error={Boolean(emailErr)}
                        helperText={emailErr || 'Lets begin with you email address!'}
                        inputProps={{ readOnly: isOtpSent }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <AccountCircle />
                            </InputAdornment>
                          ),
                        }}
                      />
                      {isOtpSent ? (
                        <TextField
                          variant="standard"
                          label="One Time Password (OTP)"
                          name="otp"
                          error={Boolean(otpErr)}
                          helperText={otpErr || 'Enter the OTP sent to above email address.'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="OTP">
                                  <Key />
                                </Tooltip>
                              </InputAdornment>
                            ),
                          }}
                        />
                      ) : null}
                      <FormControlLabel
                        sx={{ mb: 1 }}
                        control={<Checkbox checked={remMe} onChange={(e, val) => setRemMe(val)} />}
                        label="Remember Me?"
                      />
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isLoading}
                        endIcon={!isOtpSent ? <Login /> : <LockOpen />}
                      >
                        {!isOtpSent ? 'Login' : 'Verify'}
                      </LoadingButton>
                    </Stack>
                  </form>
                  <Divider sx={{ '&::before': { top: 0 }, '&::after': { top: 0 } }}>
                    <Chip label="OR" />
                  </Divider>
                  <Stack justifyContent="center" direction="row">
                    <LoadingButton
                      loading={isGglLoading}
                      fullWidth
                      variant="outlined"
                      onClick={handleGoogleAuth}
                      startIcon={<Google />}
                    >
                      Sign In With Google
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthUser;
