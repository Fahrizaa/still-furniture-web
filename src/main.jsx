/**
 * @fileoverview Titik Masuk Utama (Entry Point) React DOM.
 * Memuat styling global Tailwind CSS (`index.css`) lalu me-render komponen root `<App />`
 * di dalam elemen `<div id="root">` pada `index.html`.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
