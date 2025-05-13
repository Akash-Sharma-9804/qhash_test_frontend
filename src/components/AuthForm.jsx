import { useState } from "react";
import { useDispatch } from "react-redux";
// import { setUser } from "../redux/slices/userSlice";
// import { login, signup, createNewConversation } from "../services/authService";
import { setUser } from "../store/userSlice";
import { login, signup, createNewConversation } from "../store/authServices";

const AuthForm = ({ isSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for signup
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userData;
      if (isSignup) {
        userData = await signup({ name, email, password });
      } else {
        userData = await login(email, password);
      }

      // Create a new conversation automatically after login/signup
      const newConversation = await createNewConversation(userData.token);

      // Update Redux store
      dispatch(setUser({ 
        user: userData.user, 
        token: userData.token, 
        conversationId: newConversation.conversationId 
      }));

      console.log("Login/Signup successful, new conversation created!");

    } catch (error) {
      console.error("Auth error:", error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {isSignup && (
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      )}
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
      </button>
    </form>
  );
};

export default AuthForm;
