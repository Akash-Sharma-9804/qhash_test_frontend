import React from 'react'
import { useState, useEffect, useRef } from "react";

import ChatArea from '../components/ChatArea';

import Sidebar from '../components/Sidebar';

const HomePage = () => {
   
    const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className=' font-mono  h-screen overflow-hidden   text-white   '>
      <div className="flex h-screen overflow-auto">
      
      <Sidebar isCollapsed={!isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      
    <ChatArea isCollapsed={!isSidebarOpen } setSidebarOpen={setSidebarOpen} />
     
 </div>
    </div>
 

  )
}

export default HomePage
