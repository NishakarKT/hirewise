import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// routes
import Router from './routes';
// constants
import { AUTH_TOKEN_ENDPOINT } from './constants/endpoints';
import { COMPANY } from './constants/vars';
// contexts
import AppContext from './contexts/AppContext';
// mui
import ThemeProvider from './theme';
// components
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';

export const App = () => {
  const [mode, setMode] = useState('light');
  const [user, setUser] = useState({});

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem(COMPANY)) || {};
    // set user
    const token = localData?.token;
    if (token) {
      try {
        axios
          .post(AUTH_TOKEN_ENDPOINT, { token })
          .then((res) => {
            const user = res.data.user || {};
            setUser(user);
          })
          .catch((err) => {
            setUser(null);
          });
      } catch (err) {
        setUser(null);
      }
    } else setUser(null);
    // set mode
    if (localData.mode) setMode(localData.mode);
  }, []);

  const handleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    // save to localstorage
    localStorage.setItem(COMPANY, JSON.stringify({ ...JSON.parse(localStorage.getItem(COMPANY)), mode: newMode }));
  };

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider mode={mode}>
          <AppContext.Provider value={{ user, setUser, mode, handleMode }}>
            <ScrollToTop />
            <StyledChart />
            <Router />
          </AppContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
