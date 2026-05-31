import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';

// console 억제
(function() {
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.info = noop;
  console.debug = noop;
})();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
