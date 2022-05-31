// React 17

// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import "bootstrap/dist/js/bootstrap.min.js";
//
// fetch('/api/aaa')
//
// const rootElement = document.getElementById("root");
//
// ReactDOM.render(
//     <React.StrictMode>
//         <App/>
//     </React.StrictMode>,
//     rootElement
// );

// React 18

import React from "react";
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.min.js";
import { CookiesProvider } from "react-cookie";

// fetch('/api/aaa')

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    // <React.StrictMode>
    <CookiesProvider>
    <App />
    </CookiesProvider>
    // </React.StrictMode>
);
