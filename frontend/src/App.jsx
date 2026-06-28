import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from "react-router";
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuthStore } from './store/useAuthStore';
import PageLoader from './components/PageLoader';

import { Toaster } from "react-hot-toast";

function App() {

  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="h-screen overflow-hidden bg-[#0B0F17] relative">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      <div className="relative z-10 h-full w-full">
        <Routes>
          <Route path='/' element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
          <Route path='/signup' element={!authUser ? <SignupPage /> : <Navigate to={"/"} />} />
        </Routes>
        <Toaster />
      </div>
    </div>
  )
}

export default App