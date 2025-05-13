


import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store/authSlice";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import AboutUs from "./Pages/AboutUs"; // Add this import

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
 
// ✅ Routes component that restores auth state from localStorage
const AppRoutes = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ✅ Restore Redux auth state on page reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");
    const conversation_id = localStorage.getItem("conversation_id");

    if (token && user_id && conversation_id && !user) {
      dispatch(
        setUser({
          user: { user_id },
          token,
          conversationId: conversation_id,
        })
      );
    }
  }, [dispatch, user]);

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
};

// ✅ Main App with Router and basename for Hostinger
const App = () => {
  return (
    <Router basename="/ai/">
      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
      <AppRoutes />
    </Router>
  );
};

export default App;
