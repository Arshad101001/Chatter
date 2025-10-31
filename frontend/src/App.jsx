import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import Signup from './components/Signup'
import Login from './components/Login'
import Home from './components/Home'
import PageNotFound from './components/PageNotFound'

function App() {

  const token = localStorage.getItem('jwt');
  return (
    <>
      <Routes>
        <Route path='/' element={token ? <Home /> : <Navigate to={'/login'} />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
