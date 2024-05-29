import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@solana/wallet-adapter-react-ui/styles.css';
import './global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
