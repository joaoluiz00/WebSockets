import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RoomsPage from './pages/RoomsPage.jsx'
import ChatRoomPage from './pages/ChatRoomPage.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoomsPage />} />
        <Route path="/room/:key" element={<ChatRoomPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
