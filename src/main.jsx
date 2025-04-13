import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import TrainNN from './TrainingProject/TrainNN.jsx'
import './index.css'

// Simpele routing op basis van URL
const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {path === '/train' ? <TrainNN /> : <App />}
  </React.StrictMode>,
)
