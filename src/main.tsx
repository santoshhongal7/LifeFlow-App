import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'

if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then((module) => {
    module.registerSW({ immediate: true })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
