import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// Single, correct mounting of the React app
const rootElement = document.getElementById('root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
} else {
  // In case the root element is missing, log a helpful message to the console
  // so it's easier to debug in the future.
  // eslint-disable-next-line no-console
  console.error('Root element not found: #root')
}
