import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from './ErrorBoundary.jsx'
import App from './App.jsx'
ReactDOM.createRoot(document.getElementById('app')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
