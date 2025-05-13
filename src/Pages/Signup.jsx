
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signupUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // ✅ Username state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleSignup = async (e) => {
  //   e.preventDefault();

  //   const result = await dispatch(signupUser({ username, email, password }));

  //   if (!result?.error) {
  //     navigate("/"); // ✅ Redirect only if signup succeeds
  //   } else {
  //     alert("Signup failed. Please try again.");
  //   }
  // };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(signupUser({ username, email, password }));

      if (!result?.error) {
        toast.success("🎉 Signup successful!");
        navigate("/"); // ✅ Redirect
      } else {
        toast.error("❌ Signup failed. Please try again.");
      }
    } catch (err) {
      toast.error("🚫 Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="font-mono h-screen bg-[url('/bg-login.jpg')] bg-cover max-w-screen flex items-center justify-center">
      <div className="rounded-xl backdrop-blur-lg bg-white/10 shadow-lg w-4/5 md:w-2/3 lg:w-9/12 sm:flex">
        {/* Left Section */}
        <div className="md:flex rounded-xl sm:w-2/3 w-full flex-col justify-center bg-gradient-to-r from-zinc-700 to-slate-900">
          <div className="w-full h-full bg-white/10 border border-white/20 py-5 sm:p-0 rounded-xl shadow-lg flex flex-col justify-center items-center">
            <h1 className="text-white text-center text-3xl sm:text-4xl font-bold">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                QuantumHash
              </span>
            </h1>
            <p className="text-white mt-2 sm:mt-6 text-base sm:text-lg w-4/6">
              Discover the Future with QuantumHash AI — Your Personal AI
              Assistant.
              <span className="hidden sm:flex">
                Experience the next level of intelligent conversations and
                problem-solving. From generating creative ideas to providing
                real-time answers, QuantumHash AI adapts to your needs and
                delivers fast, accurate insights. Sign up today and step into a
                smarter tomorrow!
              </span>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-center text-2xl font-bold text-white">
            Sign Up With Us
          </h2>

          

          <form className="mt-2" onSubmit={handleSignup}>
            <div className="mb-2">
              <label className="block text-white">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="mb-2">
              <label className="block text-white">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
  type="submit"
  disabled={loading}
  className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg transition duration-300 flex items-center justify-center gap-2 ${
    loading ? "animate-pulse opacity-60 cursor-not-allowed" : ""
  }`}
>
  {loading ? (
    <>
      <svg
        className="w-5 h-5 animate-spin text-white"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      Signing Up...
    </>
  ) : (
    "Signup"
  )}
</button>

          </form>

          <p className="text-center text-white mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-500 font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;


 