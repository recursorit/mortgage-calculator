import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoot from './AppRoot';

const rootEl = document.getElementById('root');
if (rootEl) {
  if (window.localStorage.getItem('react-scan') === '1') {
    import('react-scan')
      .then(({ scan }) => scan({ enabled: true }))
      .catch(() => {
        // ignore
      });
  }

  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <AppRoot />
    </React.StrictMode>,
  );
}
