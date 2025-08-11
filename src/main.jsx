// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './global.css';

// 你需要从Google Cloud Console获取客户端ID
const clientId = '771291701862-klltk7atc0o47fonsp9degm2s21oilok.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
    // </React.StrictMode>
);