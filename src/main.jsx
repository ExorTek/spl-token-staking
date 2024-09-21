import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SolanaProvider } from '@providers';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SolanaProvider>
      <App />
    </SolanaProvider>
  </React.StrictMode>
);
