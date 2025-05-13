import React, { useState, useEffect, useRef } from "react";
import {  Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Plus,
  Menu,
  Trash,
  X,
  Pen,
  Ellipsis,
  Save,
  PanelRightOpen,
  BadgeHelp,
  History,
  MoreVertical,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchConversations,
  createNewConversation,
  fetchConversationHistory,
  renameConversation,
  deleteConversation,
} from "../api_Routes/api";
import {
  setConversations,
  setActiveConversation,
  setMessages,
  addConversation,
  renameConversationRedux,
  removeConversationFromRedux,
} from "../store/chatSlice2";
import dayjs from "dayjs";
import isYesterday from "dayjs/plugin/isYesterday";
import { toast } from "react-toastify";

dayjs.extend(isYesterday);
const Sidebar = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
   
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate(); 
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [dropdownId, setDropdownId] = useState(null);

  const [isOpen, setIsOpen] = useState(false); // For mobile view
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { conversations, activeConversation } = useSelector(
    (state) => state.chat
  );

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"; // default to false if not found
  });
  

  const prevActiveConvRef = useRef();
  // ✅ Group conversations by Today, Yesterday, Previous
  const groupConversationsByDate = (conversations) => {
    const today = [];
    const yesterday = [];
    const previous = [];

    conversations.forEach((conv) => {
      const createdAt = dayjs(conv.created_at || new Date());

      if (createdAt.isSame(dayjs(), "day")) {
        today.push(conv);
      } else if (createdAt.isYesterday()) {
        yesterday.push(conv);
      } else {
        previous.push(conv);
      }
    });

    return { today, yesterday, previous };
  };

  // useEffect(() => {
  //   if (token) {
  //     fetchConversations(token)
  //       .then((data) => {
  //         console.log("Fetched Conversations:", data);
  //         dispatch(setConversations(data.conversations || []));
  //       })
  //       .catch((err) => console.error("Error fetching conversations:", err));
  //   }
  // }, [token, dispatch]);

  // useEffect(() => {
  //   const storedConversationId = localStorage.getItem("conversation_id");
  //   if (storedConversationId) {
  //     dispatch(setActiveConversation(Number(storedConversationId)));
  //   }
  // }, []);

  // useEffect(() => {
  //   console.log("👀 Conversations in Redux:", conversations);
  // }, [conversations]);

  useEffect(() => {
    if (token) {
      fetchConversations(token)
        .then((data) => {
          console.log("Fetched Conversations:", data);
          dispatch(setConversations(data.conversations || []));
        })
        .catch((err) => console.error("Error fetching conversations:", err));
    }
  }, [token, dispatch]);

  useEffect(() => {
    const storedConversationId = localStorage.getItem("conversation_id");
    const storedConversationName = localStorage.getItem("conversation_name");

    // Update the state if the conversation name has changed in localStorage
    if (storedConversationId && storedConversationName) {
      dispatch(setActiveConversation(Number(storedConversationId)));
    }
  }, [dispatch]);

  // useEffect(() => {
  //   console.log("👀 Conversations in Redux:", conversations);
  // }, [conversations]);

   // This runs once when the component mounts.

  useEffect(() => {
    if (conversations.length) {
      // Check if conversations have been updated
      const updatedConversation = conversations.find(
        (conv) => conv.id === activeConversation
      );
      if (updatedConversation) {
        // If there's an active conversation, update its name from Redux
        localStorage.setItem("conversation_name", updatedConversation.name);
      }
    }
  }, [conversations, activeConversation, dispatch]); // Run whenever conversations or activeConversation changes

  // const handleNewChat = async () => {
  //   try {
  //     const newChat = await createNewConversation(token);

  //     if (newChat?.id) {
  //       // ✅ Make sure created_at is set to now if not present
  //       if (!newChat.created_at) {
  //         newChat.created_at = new Date().toISOString();
  //       }

  //       dispatch(addConversation(newChat));
  //       dispatch(setActiveConversation(newChat.id));
  //     }
  //   } catch (error) {
  //     console.error("Error creating new chat:", error);
  //   }
  // };
  const handleNewChat = async () => {
    try {
      const newChat = await createNewConversation(token); // API call to create conversation

      if (newChat?.conversation_id) {
        const newConversation = {
          id: newChat.conversation_id,
          name: newChat.name || "New Chat",
          created_at: new Date().toISOString(),
        };

        // ✅ Add to Redux immediately
        dispatch(addConversation(newConversation));

        // ✅ Set it as active
        dispatch(setActiveConversation(newConversation.id));

        // ✅ Optional: save to localStorage
        localStorage.setItem("conversation_id", newConversation.id);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  // rename conversations

  

  const handleRename = async (id) => {
    if (
      !editText ||
      conversations.find((c) => c.id === id)?.name === editText
    ) {
      // No change, just close rename UI
      setEditingId(null);
      setDropdownId(null);
      return;
    }

    try {
      await renameConversation(id, editText, token);
      dispatch(renameConversationRedux({ id, newName: editText }));
    } catch (err) {
      console.error("Rename failed", err);
    } finally {
      setEditingId(null);
      setDropdownId(null);
    }
  };
 

  useEffect(() => {
    if (
      editingId !== null &&
      prevActiveConvRef.current &&
      prevActiveConvRef.current !== activeConversation &&
      editingId !== activeConversation // ✅ Prevent conflict with deleted or switched conv
    ) {
      handleRename(editingId); // ✅ auto-save rename
    }
  
    prevActiveConvRef.current = activeConversation;
  }, [activeConversation, editingId]);
  
  

   
  const handleDeleteConversation = async (id) => {
    try {
      await deleteConversation(id, token); // Soft delete backend
      dispatch(removeConversationFromRedux(id)); // Remove from Redux
      toast.success("🗑️ deleted successfully!");
      if (activeConversation === id) {
        const remaining = conversations.filter((conv) => conv.id !== id);
  
        if (remaining.length > 0) {
          const nextConv = remaining[0];
          const messages = await fetchConversationHistory(nextConv.id, token);
          dispatch(setMessages({ conversationId: nextConv.id, messages }));
          dispatch(setActiveConversation(nextConv.id));
          navigate(`/chat/${nextConv.id}`);
        } else {
          const newConv = await createNewConversation(token);
          dispatch(addConversation(newConv));
          dispatch(setMessages({ conversationId: newConv.id, messages: [] }));
          dispatch(setActiveConversation(newConv.id));
          navigate(`/chat/${newConv.id}`);
        }
      }
    } catch (error) {
      console.error("❌ Error deleting conversation:", error);
    }
  };
  
  



  const handleSelectConversation = async (conv_id) => {
    console.log("📌 Selected Conversation ID:", conv_id);

    dispatch(setActiveConversation(conv_id));
    localStorage.setItem("conversation_id", conv_id);

    const selectedConversation = conversations.find(
      (conv) => conv.id === conv_id
    );

    if (selectedConversation) {
      localStorage.setItem("conversation_name", selectedConversation.name);
    }
  };

  const groupedConversations = groupConversationsByDate(conversations);

  // Theme change
  const toggleTheme = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };
  

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex">
    {/* Sidebar starts */}
    <div
      className={`fixed md:relative z-30 h-full  
        ${
          isOpen ? "translate-x-0 w-56" : "-translate-x-full"
        } md:translate-x-0
        ${isCollapsed ? "md:w-16" : "md:w-56"}
        bg-slate-100 dark:bg-gradient-to-r dark:from-zinc-700 dark:to-slate-900   p-2 flex flex-col space-y-2 
        transition-all duration-500 overflow-y-auto`}>
      {/* logo with Menu Button starts */}
      <div className="flex gap-2 items-center ">
        {/* logo with menu button */}
        <div
          className={`flex items-center gap-2  justify-center ${
            isCollapsed ? "mb-10" : ""
          }`}>
          <div
            className={`origin-left ml-14 md:ml-5 mt-4 md:mt-0 transition-all duration-500 ${
              isCollapsed ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
            } whitespace-nowrap overflow-hidden  `}>
            <span className="text-2xl  mt-2   items-center cursor-pointer sm:text-center font-bold text-black dark:text-white">
              <img src="./logoName.png" className="w-32" alt="Logo" />
            </span>
          </div>
          <div className="relative z-30">
            <button
              className={`absolute   hidden md:block p-1 ${
                isCollapsed ? "top-4 right-4 " : ""
              } z-30 rounded-md  relative   text-black dark:text-white hover:dark:bg-slate-600 hover:bg-slate-400 transition-all duration-300  `}
              onClick={() => {
                setIsOpen(!isOpen);
                setIsCollapsed(!isCollapsed);
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              ref={buttonRef}>
              <PanelRightOpen size={24} />

              {/* Tooltip on hover */}
            </button>
            {/* Tooltip outside the button so it doesn't trigger hover */}
            {showTooltip && (
              <div
                className={`absolute ${
                  isCollapsed
                    ? "top-12 left-1/2 transform -translate-x-3/4"
                    : "top-8 left-1/2 transform -translate-x-2/3 "
                }  mt-1 px-2 py-1 text-xs text-white bg-zinc-900  rounded  `}>
                 
                {isCollapsed ? "Open Sidebar" : "Close Sidebar"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* logo with menu button ends */}

      <div className="flex flex-col justify-between  ">
        {/* New Chat Button */}
        <div className="newchat-history  flex flex-col gap-2  ">
          <button
            className={`border border-black  dark:border-white p-2 bg-blue-500 text-white rounded-lg flex items-center justify-center`}
            onClick={handleNewChat}>
            <Plus size={18} className="mr-2 text-black dark:text-white" />
            <span
              className={`transition-all duration-500 ${
                isCollapsed
                  ? "opacity-0 scale-x-0 w-0"
                  : "opacity-100 scale-x-100 w-auto"
              } text-sm text-black dark:text-white`}>
              New Chat
            </span>
          </button>

          {/* Chat History */}
          <span
            className={`bg-white border border-black dark:border-white p-2 flex items-center gap-4 dark:bg-gray-600 text-black dark:text-white rounded-lg cursor-pointer`}>
            <History size={18} />
            <span
              className={`transition-all duration-300 ${
                isCollapsed
                  ? "opacity-0 scale-x-0 w-0"
                  : "opacity-100 scale-x-100 w-auto"
              } text-sm`}>
              Chat history
            </span>
          </span>

          {/* Chat List */}
          <div className="flex flex-col space-y-2 flex-1 overflow-y-auto max-h-96  ">
            <h2 className="font-medium text-gray-700 dark:text-gray-300">
              Recent Chats
            </h2>
            {/* Today */}

            {/* {Object.entries(groupedConversations).map(([section, convs]) => (
        convs.length > 0 && (
          <div key={section} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              {section === "today" ? "Today" : section === "yesterday" ? "Yesterday" : "Previous"}
            </h3>
            {convs.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`p-2 rounded cursor-pointer transition ${
                  activeConversation === conv.id ? "bg-blue-700" : " bg-slate-300 dark:bg-gray-700 hover:bg-gray-500"
                } my-1`}
              >
                {conv.name || "New Chat"}
              </div>
            ))}
          </div>
        )
      ))} */}

            {Object.entries(groupedConversations).map(
              ([section, convs]) =>
                convs.length > 0 && (
                  <div key={section} className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                      {section === "today"
                        ? "Today"
                        : section === "yesterday"
                        ? "Yesterday"
                        : "Previous"}
                    </h3>
                    {convs.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-2 text-[13px] mr-2 text-black dark:text-white rounded-md cursor-pointer transition flex justify-between items-center relative ${
                          activeConversation === conv.id
                            ? "bg-blue-700 text-white "
                            : "bg-slate-300 dark:bg-gray-700  hover:bg-gray-500"
                        } my-1`}>
                        <div
                          onClick={() => handleSelectConversation(conv.id)}
                          className="flex-grow">
                          {editingId === conv.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editText}
                                autoFocus
                                onChange={(e) => setEditText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={() => handleRename(conv.id)} // ✅ Save on blur
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleRename(conv.id);
                                  if (e.key === "Escape") {
                                    setEditText("");
                                    setEditingId(null);
                                  }
                                }}
                                className="bg-transparent border-b border-gray-400 outline-none w-full"
                              />

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(conv.id);
                                }}
                                title="Save"
                                className="text-green-500 hover:text-green-700">
                                <Save
                                  size={20}
                                  color="#4dff00"
                                  strokeWidth={2}
                                />
                              </button>
                            </div>
                          ) : (
                            <span title={conv.name || "New Chat"}>
                              {(conv.name || "New Chat").length > 20
                                ? (conv.name || "New Chat").substring(0, 17) +
                                  "..."
                                : conv.name || "New Chat"}
                            </span>
                          )}
                        </div>

                        {/* Dropdown trigger */}
                        <div className="relative">
                          <span
                            className="ml-2 flex justify-center items-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownId(
                                dropdownId === conv.id ? null : conv.id
                              );
                            }}>
                            <Ellipsis />
                          </span>

                          {/* Dropdown menu */}
                          {dropdownId === conv.id && (
                            <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 rounded shadow-md z-50">
                              <button
                                className="block px-4 py-2 font-bold text-sm text-gray-700 hover:bg-gray-100 dark:bg-gray-600 w-full text-left dark:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(conv.id);
                                  setEditText(conv.name || "New Chat");
                                  setDropdownId(null);
                                }}>
                                  <span className="flex gap-1"> Rename <Pen size={16}  /></span>
                               
                              </button>
                              <button
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:dark:bg-red-800 font-bold hover:dark:text-black w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(
                                    conv.id,
                                    token,
                                    dispatch
                                  ); // pass token & dispatch
                                  setDropdownId(null);
                                }}>
                                  <span className="flex gap-1"> Delete<Trash size={16}   /></span>
                               
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
            )}

            {conversations.length === 0 && (
              <p className="text-gray-400">No conversations found</p>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          className={` ${
            isCollapsed ? "md:w-12" : "md:w-52"
          }  buttons  absolute bottom-1 mb-3 flex flex-col gap-4`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`bg-white p-2 flex items-center gap-4 dark:bg-gray-600 text-black dark:text-white border border-black dark:border-white rounded-lg cursor-pointer`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span
              className={`transition-all duration-300 ${
                isCollapsed
                  ? "opacity-0 scale-x-0 w-0"
                  : "opacity-100 scale-x-100 w-auto"
              }`}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
          {/* Help */}
          <span
            className={`bg-white p-2 flex items-center gap-4 dark:bg-gray-600 text-black dark:text-white border border-black dark:border-white rounded-lg cursor-pointer`}>
            <BadgeHelp size={18} />
            <span
              className={`transition-all duration-300 ${
                isCollapsed
                  ? "opacity-0 scale-x-0 w-0"
                  : "opacity-100 scale-x-100 w-auto"
              }`}>
              <Link to="/about">About Us</Link>
            </span>
          </span>
        </div>
      </div>
    </div>

    {/* Mobile Menu Button */}
    <button
      className="md:hidden fixed top-4 left-4 z-30 p-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300"
      onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>
  );
};

export default Sidebar;
