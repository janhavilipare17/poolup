import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

Sentry.init({
  dsn: "https://e73d853ad5bf91856f449b06d67c5f18@o4511122070306816.ingest.us.sentry.io/4511",
  sendDefaultPii: false,
  environment: "production",
  tracesSampleRate: 1.0,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
