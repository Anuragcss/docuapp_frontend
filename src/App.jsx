import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './Layout'; // 👈 Handles all routes + navbar + sidebar

function App() {
  return (
    <GoogleOAuthProvider clientId="476230917532-7sqbl95elucjtcmqark1afj78u2fhs28.apps.googleusercontent.com">
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;


