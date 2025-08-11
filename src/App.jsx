// App.jsx
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import AppRoutes from './routes';
import './global.css';

const App = () => {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

export default App;