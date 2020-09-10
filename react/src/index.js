import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { MyProvider } from './MyContext';
ReactDOM.render(
  //<React.StrictMode>
  <MyProvider>
    <Router>
      <App />
    </Router>
  </MyProvider>
  //</React.StrictMode>,
  , document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
