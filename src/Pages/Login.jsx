import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 👈 Import useNavigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conversations, setConversations] = useState([]);
const [currentConversationId, setCurrentConversationId] = useState(null);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);


const handleLogin = async (e) => {
  e.preventDefault();
  setError(""); // Reset error state
  setLoading(true); // Start loading

  try {
      const response = await dispatch(loginUser({ email, password }));

      console.log("🔍 Full Login Response:", response);

      if (!response || !response.payload) {
          console.error("❌ Login failed: No response or payload received");
          return;
      }

      const { token, user, conversation_id } = response.payload;

      if (!token || !user?.user_id || !conversation_id) {
          console.error("❌ Login failed: Missing token, user_id, or conversation_id.");
          return;
      }

      // ✅ Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user.user_id);
      localStorage.setItem("conversation_id", conversation_id);

      console.log("✅ Token stored:", token);
      console.log("✅ User ID stored:", user.user_id);
      console.log("✅ Conversation ID stored:", conversation_id);

      // ✅ Add the new conversation to the list
      const newConversation = {
          id: conversation_id,
          name: "New Chat",
      };

      setConversations(prev => [newConversation, ...prev]); // Add to top
      setCurrentConversationId(conversation_id); // Set as selected
      toast.success("🎉 Login successful!");
      navigate("/"); // ✅ Redirect after login
  } catch (err) {
      console.error("❌ Login Error:", err);
      toast.error("❌ Login failed!");

      setError(err.response?.data?.error || "Login failed!");
  }finally {
    setLoading(false); // Stop loading
  }
};


  

  return (
    <div className="font-mono h-screen bg-[url('/bg-login.jpg')] bg-cover max-w-screen flex items-center justify-center">
      <div className="rounded-xl backdrop-blur-lg bg-white/10 shadow-lg w-4/5 md:w-2/3 lg:w-9/12 sm:flex">
        
        {/* Left Section */}
        <div className="md:flex rounded-xl flex-col justify-center bg-gradient-to-r from-zinc-700 to-slate-900">
          <div className="w-full h-full bg-white/10 border border-white/20 py-5 sm:p-0 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <h1 className="text-white text-center text-3xl sm:text-4xl font-bold">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                QuantumHash
              </span>
            </h1>
            <p className="text-white mt-2 sm:mt-6 text-base sm:text-lg w-4/6">
              Welcome back! Unlock the full potential of AI — log in to continue
              your journey with 
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                QuantumHash
              </span> and experience smarter, faster insights.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full rounded-xl bg-white/10 border border-white/20 shadow-lg md:w-1/2 p-7 flex flex-col justify-center">
          <h2 className="text-center text-2xl font-bold text-white">Login</h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form className="mt-6" onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-white">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <span className="text-white text-sm">Forgot Password?</span>
            {/* <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg"
            >
              Login
            </button> */}

<button
  type="submit"
  disabled={loading}
  className={`w-full flex items-center justify-center gap-2 text-white font-bold py-2 rounded-lg transition-all duration-300 ${
    loading ? 'bg-indigo-400 cursor-not-allowed animate-pulse' : 'bg-indigo-500 hover:bg-indigo-600'
  }`}  
>
  {loading ? (
    <>
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Logging in...
    </>
  ) : (
    'Login'
  )}
</button>

          </form>

          <div className="flex flex-col mt-5 text-white">
            <span>Or Continue with</span>
            <div className="flex mt-2 justify-center gap-5">
              <span className="cursor-pointer">
                <img src="./google.png" className="h-6 w-6" alt="" />
              </span>
              <span className="cursor-pointer">
                <img src="./fb.png" className="h-6 w-6" alt="" />
              </span>
            </div>
          </div>
          <p className="text-center text-white">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-500 font-bold">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;



