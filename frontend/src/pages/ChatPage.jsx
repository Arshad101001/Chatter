import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

function ChatPage() {
  const { logout } = useAuthStore();
  return (
    <button className='btn btn-primary z-10' onClick={logout}>Logout</button>
  )
}

export default ChatPage