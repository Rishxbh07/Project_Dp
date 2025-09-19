import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // <-- 1. IMPORT

// import './styles/index.css'; // This should still be commented out for the CDN fix

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- 2. WRAP APP */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);