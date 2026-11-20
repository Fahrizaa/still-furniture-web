/**
 * @fileoverview Titik Masuk Utama (Entry Point) React DOM & BrowserRouter.
 * Memuat styling global Tailwind CSS (`index.css`) dan membungkus `<App />`
 * dengan `<BrowserRouter>` agar mendukung multi-page URL routing (`/`, `/shop`, `/product/:id`, dll).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
