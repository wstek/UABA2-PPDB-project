import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.min.js";

fetch('/api/aaa')

const rootElement = document.getElementById("root");

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    rootElement
);

// React 18

// import React from "react";
// import { createRoot } from 'react-dom/client';
// import App from './App';
// import 'bootstrap/dist/css/bootstrap.min.css';
//
// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(
//     <React.StrictMode>
//         <App/>
//     </React.StrictMode>
// );
