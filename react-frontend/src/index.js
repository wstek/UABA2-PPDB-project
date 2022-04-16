import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Sign_Up from "./Sign_Up";
import App from './App';
import Sign_In from "./Sign_In";

const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <React.StrictMode>
    {<App/>}

  </React.StrictMode>
);
