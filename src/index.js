


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

import './styles/common.css';
import './styles/themes-page.css';
import './styles/bizx-legacy.css';
import './styles/bizx-components.css';
import './styles/bizx-responsive.css';

import { setThemeBackgrounds } from './utils/publicAsset';

setThemeBackgrounds();

const materialIcons = document.createElement("link");
materialIcons.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
materialIcons.rel = "stylesheet";
document.head.appendChild(materialIcons);



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);