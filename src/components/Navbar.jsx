

import React, { useState } from "react";
import { User, ChevronDown, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { clearChatData } from "../store/chatSlice2";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setSidebarOpen }) => {
  const [active, setActive] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user data from Redux store
  const user = useSelector((state) => state.auth.user); // Assuming user is stored in state.auth.user

  const handleLogout = () => {
    dispatch(logout()); // Clears user data from auth slice
    dispatch(clearChatData()); // Clears chat data from chat slice
    dispatch({ type: "RESET" }); // Reset the entire Redux store to initial state

    localStorage.clear(); // Clear localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="w-full pt-2 px-4 md:bg-transparent pb-2 bg-white md:dark:bg-transparent dark:bg-gray-800 fixed top-0 left-0 z-20">
      <div className="flex sm:justify-between items-center justify-around gap-7">
        {/* Logo */}
        <div className="relative ml-14 justify-center items-center cursor-pointer">
          <span className="text-2xl mt-2 flex items-center cursor-pointer sm:text-center font-bold text-black dark:text-white">
            <img src="./logoName.png" className="w-32" alt="Logo" />
            <ChevronDown />
          </span>
        </div>

        {/* User Icon */}
        <div
          className="relative cursor-pointer sm:mr-6 border-2 text-black dark:text-white border-black dark:border-white rounded-full p-2"
          onClick={() => setActive(!active)}
        >
          <User size={20} />
          {active && (
            <div className="absolute top-9 rounded-lg w-48 bg-slate-500 right-6 bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
              <div className="flex flex-col justify-center py-5 gap-2 items-center">
                {/* User Avatar */}
                <img
                  src={user?.avatar || "./user-img.jpg"}
                  className="h-12 w-12 rounded-full"
                  alt="User Avatar"
                />

                {/* Username */}
                <span className="text-sm darkMode dark:text-white text-black">
                  {user?.username || "Guest"}
                </span>

                {/* Email */}
                <span className="text-xs darkMode dark:text-white text-black">
                  {user?.email || "guest@example.com"}
                </span>

                {/* Logout Button */}
                <span
                  className="text-base flex items-center gap-2 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
