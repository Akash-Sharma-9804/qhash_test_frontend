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
  EllipsisVertical,
  CircleEllipsis ,
  ChevronDown,
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
} from "../../api_Routes/api";
import {
  setConversations,
  setActiveConversation,
  setMessages,
  addConversation,
  renameConversationRedux,
  removeConversationFromRedux,
} from "../../store/chatSlice2";
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
          // console.log("Fetched Conversations:", data);
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
  //     const newChat = await createNewConversation(token); // API call to create conversation

  //     if (newChat?.conversation_id) {
  //       const newConversation = {
  //         id: newChat.conversation_id,
  //         name: newChat.name || "New Chat",
  //         created_at: new Date().toISOString(),
  //       };

  //       // ✅ Add to Redux immediately
  //       dispatch(addConversation(newConversation));

  //       // ✅ Set it as active
  //       dispatch(setActiveConversation(newConversation.id));

  //       // ✅ Optional: save to localStorage
  //       localStorage.setItem("conversation_id", newConversation.id);
  //     }
  //   } catch (error) {
  //     console.error("Error creating new chat:", error);
  //   }
  // };

  // rename conversations

  const handleNewChat = async () => {
  try {
    const newChat = await createNewConversation(token); // API call to create conversation
    console.log("🔍 API Response:", newChat); // Debug log

    if (newChat?.conversation_id) {
      const conversationData = {
        id: newChat.conversation_id,
        name: newChat.name || "New Chat",
        created_at: new Date().toISOString(),
      };

      // Check if conversation already exists in Redux
      const existsInRedux = conversations.some(conv => conv.id === newChat.conversation_id);

      if (newChat.action === "created") {
        // Always add new conversations
        dispatch(addConversation(conversationData));
        console.log("✅ Added new conversation to Redux:", conversationData);
      } else if (newChat.action === "reused" && !existsInRedux) {
        // Add reused conversation only if it's not already in Redux
        dispatch(addConversation(conversationData));
        console.log("🔄 Added reused conversation to Redux:", conversationData);
      } else {
        console.log("🔄 Reusing existing conversation from Redux:", newChat.conversation_id);
      }

      // ✅ Always set as active (whether new or reused)
      dispatch(setActiveConversation(newChat.conversation_id));

      // ✅ Optional: save to localStorage
      localStorage.setItem("conversation_id", newChat.conversation_id);
    }
  } catch (error) {
    console.error("Error creating new chat:", error);
  }
};
  

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
  
  

   
  // const handleDeleteConversation = async (id) => {
  //   try {
  //     await deleteConversation(id, token); // Soft delete backend
  //     dispatch(removeConversationFromRedux(id)); // Remove from Redux
  //     toast.success("🗑️ deleted successfully!");
  //     if (activeConversation === id) {
  //       const remaining = conversations.filter((conv) => conv.id !== id);
  
  //       if (remaining.length > 0) {
  //         const nextConv = remaining[0];
  //         const messages = await fetchConversationHistory(nextConv.id, token);
  //         dispatch(setMessages({ conversationId: nextConv.id, messages }));
  //         dispatch(setActiveConversation(nextConv.id));
  //         navigate(`/chat/${nextConv.id}`);
  //       } else {
  //         const newConv = await createNewConversation(token);
  //         dispatch(addConversation(newConv));
  //         dispatch(setMessages({ conversationId: newConv.id, messages: [] }));
  //         dispatch(setActiveConversation(newConv.id));
  //         navigate(`/chat/${newConv.id}`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("❌ Error deleting conversation:", error);
  //   }
  // };
  
  
const handleDeleteConversation = async (id) => {
  try {
    const deleteResponse = await deleteConversation(id, token);
    
    // Handle different backend responses
    if (deleteResponse.action === "deleted") {
      // Normal deletion - conversation deleted, others remain
      dispatch(removeConversationFromRedux(id));
      toast.success("🗑️ Conversation deleted successfully!");
      
      if (activeConversation === id) {
        const remaining = conversations.filter((conv) => conv.id !== id);
        if (remaining.length > 0) {
          const nextConv = remaining[0];
          const messages = await fetchConversationHistory(nextConv.id, token);
          dispatch(setMessages({ conversationId: nextConv.id, messages }));
          dispatch(setActiveConversation(nextConv.id));
          navigate(`/chat/${nextConv.id}`);
        }
      }
    } else if (deleteResponse.action === "deleted_and_created_new" || deleteResponse.action === "deleted_and_selected_existing") {
      // Backend created/selected a new conversation for us
      dispatch(removeConversationFromRedux(id));
      
      const newConversation = {
        id: deleteResponse.conversation_id,
        name: deleteResponse.name,
        created_at: new Date().toISOString()
      };
      
      // Add the new conversation to Redux
      dispatch(addConversation(newConversation));
      
      // Set empty messages for the new conversation
      dispatch(setMessages({ conversationId: newConversation.id, messages: [] }));
      
      // Set as active conversation
      dispatch(setActiveConversation(newConversation.id));
      
      // Navigate to the new conversation
      navigate(`/chat/${newConversation.id}`);
      
      // Update localStorage
      localStorage.setItem("conversation_id", newConversation.id);
      localStorage.setItem("conversation_name", newConversation.name);
      
      toast.success("🗑️ Conversation cleared! Fresh workspace ready.");
      console.log(`✅ Auto-selected new conversation: ${newConversation.id}`);
    } else if (deleteResponse.action === "kept_as_workspace") {
      // Conversation kept as workspace - it's a feature!
      toast.info("💡 This is your active workspace! Ready for new conversations.", {
        duration: 4000,
        icon: "🚀"
      });
      
      // Ensure this conversation stays selected
      if (activeConversation !== id) {
        dispatch(setActiveConversation(parseInt(id)));
        navigate(`/chat/${id}`);
      }
      
      console.log(`💡 Conversation ${id} kept as workspace`);
    }

  } catch (error) {
    console.error("❌ Error deleting conversation:", error);
    toast.error("Failed to delete conversation");
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
      if (dropdownId !== null) {
        const dropdownElement = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownId]);

  const handleDropdownOpen = (convId) => {
    const wasOpen = dropdownId === convId;
    setDropdownId(wasOpen ? null : convId);
    
    // Scroll to make dropdown visible only when opening
    if (!wasOpen) {
      setTimeout(() => {
        const conversationElement = document.querySelector(`[data-conversation-id="${convId}"]`);
        const scrollContainer = document.querySelector('.conversation-scroll-container');
        
        if (conversationElement && scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = conversationElement.getBoundingClientRect();
          
          // Check if element is not fully visible
          const isElementVisible = (
            elementRect.top >= containerRect.top &&
            elementRect.bottom <= containerRect.bottom
          );
          
          if (!isElementVisible) {
            conversationElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }
      }, 100);
    }
  };

  return (
    <div className="flex">
    {/* Sidebar starts */}
    <div
      className={`fixed md:relative z-50 h-screen
        ${isOpen ? "translate-x-0 w-56" : "-translate-x-full"} md:translate-x-0
        ${isCollapsed ? "md:w-16" : "md:w-56"}
        bg-slate-200 dark:bg-[#282828] p-2 flex flex-col
        transition-all duration-500 ease-in-out overflow-hidden`}>
      
      {/* Logo with Menu Button */}
      <div className="flex gap-2 items-center mb-4 flex-shrink-0">
        <div className={`flex items-center gap-2 justify-center ${isCollapsed ? "" : ""}`}>
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              isCollapsed 
                ? "opacity-0 scale-x-0 w-0 ml-0" 
                : "opacity-100 scale-x-100 w-32 ml-14 md:ml-5"
            }  ml-14 md:ml-5 mt-4 md:mt-0  whitespace-nowrap overflow-hidden`}>
            <span className="text-2xl mt-2 items-center cursor-pointer sm:text-center font-bold text-black dark:text-white">
              <img src="./logoName.png" className="w-32 block dark:hidden" alt="Logo" />
              <img src="./dark_logo.png" className="w-32 hidden dark:block" alt="Logo" />
            </span>
          </div>
          <div className="relative z-30">
            <button
              className={`absolute hidden md:block p-1 ${
                isCollapsed ? "right-4" : ""
              } z-30 rounded-md relative text-black dark:text-white hover:dark:bg-slate-600 hover:bg-slate-400 transition-all duration-500 ease-in-out`}
              onClick={() => {
                setIsOpen(!isOpen);
                setIsCollapsed(!isCollapsed);
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              ref={buttonRef}>
              <PanelRightOpen 
                size={24} 
                className={`transition-transform duration-500 ease-in-out ${
                  isCollapsed ? "rotate-180" : "rotate-0"
                }`} 
              />
            </button>
            {showTooltip && (
              <div
                className={`absolute ${
                  isCollapsed
                    ? "top-8 left-1/2 transform -translate-x-3/4"
                    : "top-8 left-1/2 transform -translate-x-2/3"
                } mt-1 px-2 py-1 text-xs text-white bg-zinc-900 rounded transition-all duration-300 ease-in-out`}>
                {isCollapsed ? "Open Sidebar" : "Close Sidebar"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="mb-4 flex-shrink-0">
        <button onClick={handleNewChat}
          className={`border border-black dark:border-white p-2 bg-gradient-to-r from-[#0000B5] to-[#0076FF]
            hover:from-[#0076FF] hover:to-[#0000B5] text-white rounded-lg flex items-center
            transition-all duration-500 ease-in-out overflow-hidden ${
              isCollapsed ? "w-12 h-12 justify-center" : "w-full"
            }`}>
          <Plus size={18} className="text-white flex-shrink-0" />
          <span
            className={`whitespace-nowrap text-sm transition-all duration-500 ease-in-out transform ${
              isCollapsed 
                ? "opacity-0 scale-x-0 w-0 ml-0" 
                : "opacity-100 scale-x-100 w-auto ml-2"
            }`}>
            New Chat
          </span>
        </button>
      </div>

      {/* Chat History - Scrollable Container with proper bottom spacing */}
      <div className={`flex-1 flex flex-col min-h-0 pb-32 transition-all duration-500 ease-in-out ${
        isCollapsed ? "opacity-0 scale-x-0 w-0 overflow-hidden" : "opacity-100 scale-x-100 w-auto"
      }`}>
        <h2 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0 whitespace-nowrap">
          Chat History
        </h2>
        
        {/* Scrollable conversation list with visible scrollbar */}
        <div className="conversation-scroll-container flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 hover:scrollbar-thumb-gray-600">
          {Object.entries(groupedConversations).map(
            ([section, convs]) =>
              convs.length > 0 && (
                <div key={section} className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2 whitespace-nowrap">
                    {section === "today"
                      ? "Today"
                      : section === "yesterday"
                      ? "Yesterday"
                      : "Previous"}
                  </h3>
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      data-conversation-id={conv.id}
                      className={`p-2 text-[13px] text-black dark:text-white rounded-md cursor-pointer transition-all duration-300 flex justify-between items-center relative ${
                        activeConversation === conv.id
                          ? "bg-gradient-to-r from-[#0000B5] to-[#0076FF] hover:bg-gradient-to-r hover:from-[#0076FF] hover:to-[#0000B5] text-white"
                          : "bg-slate-300 dark:bg-[#3f3f3f] border hover:bg-gray-500"
                      } my-1 mr-2`}>
                      <div
                        onClick={() => handleSelectConversation(conv.id)}
                        className="flex-grow min-w-0">
                        {editingId === conv.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              autoFocus
                              onChange={(e) => setEditText(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={() => handleRename(conv.id)}
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
                              className="text-green-500 hover:text-green-700 flex-shrink-0">
                              <Save
                                size={20}
                                color="#4dff00"
                                strokeWidth={2}
                              />
                            </button>
                          </div>
                        ) : (
                          <span 
                            title={conv.name || "New Chat"}
                            className="block truncate pr-2">
                            {conv.name || "New Chat"}
                          </span>
                        )}
                      </div>

                      {/* Dropdown trigger */}
                      <div className="relative flex-shrink-0" data-dropdown-id={conv.id}>
                        <span
                          className="ml-2 flex justify-center items-center cursor-pointer p-1 hover:bg-black/10 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownOpen(conv.id);
                          }}>
                          <ChevronDown size={16} />
                        </span>

                        {/* Dropdown menu */}
                        {dropdownId === conv.id && (
                          <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 rounded shadow-md z-50 min-w-[120px]">
                            <button
                              className="block px-4 py-2 font-bold text-sm text-gray-700 hover:bg-gray-100 dark:bg-gray-600 w-full text-left dark:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(conv.id);
                                setEditText(conv.name || "New Chat");
                                setDropdownId(null);
                              }}>
                              <span className="flex gap-2 items-center"> 
                                <Pen size={14} />
                                Rename 
                              </span>
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:dark:bg-red-800 font-bold hover:dark:text-black w-full text-left"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conv.id, token, dispatch);
                                setDropdownId(null);
                              }}>
                              <span className="flex gap-2 items-center"> 
                                <Trash size={14} />
                                Delete
                              </span>
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
            <div className="space-y-4 animate-pulse">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                  <div className="flex-1 h-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons - Always at bottom with absolute positioning */}
      <div className={`absolute bottom-2 left-2 right-2 flex flex-col gap-3`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`relative overflow-hidden p-2 flex items-center gap-3 
                    bg-[#282828] dark:bg-slate-200 text-white dark:text-black 
                    hover:bg-slate-200 hover:text-black border border-black dark:border-white 
                    rounded-lg cursor-pointer transition-all duration-500 ease-in-out ${
                      isCollapsed ? "w-12 h-12 justify-center" : "w-full"
                    }`}>
          
          {/* Animated Icon Swap */}
          <div className="relative w-5 h-5 flex-shrink-0">
            <div
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                darkMode ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
              }`}>
              <Sun size={18} />
            </div>
            <div
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                darkMode ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
              }`}>
              <Moon size={18} />
            </div>
          </div>

          {/* Animated Text Label */}
          <span
            className={`transition-all duration-500 ease-in-out transform
            ${isCollapsed ? "opacity-0 scale-x-0 w-0" : "opacity-100 scale-x-100 w-auto"}
            whitespace-nowrap`}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* Help */}
        <Link to="/about"
          className={`bg-gradient-to-r from-[#0000B5] to-[#0076FF] hover:bg-gradient-to-r hover:from-[#0076FF] hover:to-[#0000B5] p-2 flex items-center gap-3 text-white border border-black dark:border-white rounded-lg cursor-pointer transition-all duration-500 ease-in-out ${
            isCollapsed ? "w-12 h-12 justify-center" : "w-full"
          }`}>
          <BadgeHelp size={18} className="flex-shrink-0" />
          <span
            className={`transition-all duration-500 ease-in-out transform
            ${isCollapsed ? "opacity-0 scale-x-0 w-0" : "opacity-100 scale-x-100 w-auto"}
            whitespace-nowrap`}>
            About us
          </span>
        </Link>
      </div>
    </div>

    {/* Mobile Menu Button */}
    <button
      className="md:hidden fixed top-4 left-4 z-50 p-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-all duration-500 ease-in-out"
      onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>
  );
};

export default Sidebar;

