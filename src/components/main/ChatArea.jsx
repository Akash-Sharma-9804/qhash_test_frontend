import React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Mic,
  Menu,
  MicOff,
  CircleUserRound,
  Paperclip,
  X,
  CheckCircle,
  CirclePause,
  AudioLines,
  ArrowDown,
  CircleArrowDown,
  Sparkles,
} from "lucide-react";
//
// import { FaMicrophone, FaStop, FaPlayCircle } from 'react-icons/fa';
// import { IoClose } from 'react-icons/io5';
import { motion } from "framer-motion";
import VoiceVisualizer from "../helperComponent/VoiceVisualizer";
import RecordRTC from "recordrtc";
import Navbar from "./Navbar";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { streamAudio } from "../../utils/streamAudio";
import remarkGfm from "remark-gfm";
import "./Chatarea.css";
// import { useSelector, useDispatch } from "react-redux";
import ChatbotMarkdown from "../helperComponent/ChatbotMarkdown";
import {
  fetchConversationHistory,
  sendMessage,
  uploadFiles,
  fetchConversations,
  uploadFinalAudio,
  sendGuestMessage,
} from "../../api_Routes/api";
import {
  setMessages,
  addMessage,
  setActiveConversation,
  updateMessage,
  renameConversationRedux,
  setConversations,
  addConversation,
  removeMessage,
} from "../../store/chatSlice2";
import { toast } from "react-toastify";
import MessageFiles from "../helperComponent/MessageFiles";
import FileActionModal from "../helperComponent/FileActionModal";
// import * as vad from "@ricky0123/vad-web";
// import { useMicVAD } from "@ricky0123/vad-react";
// import AudioVisualizer from 'react-audio-visualize';
import RadialVisualizer from "../helperComponent/RadialVisualizer";
import { FaMicrophone, FaStop, FaPause, FaPlay } from "react-icons/fa";
import RedirectModal from "../helperComponent/RedirectModal";
import BotThinking from "../helperComponent/BotThinking";

const isMobileDevice = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
};

const ChatArea = ({ isGuest, sidebarOpen, setSidebarOpen  }) => {
  const [loading, setLoading] = useState(false);
  const [botTyping, setBotTyping] = useState("");
  const [greeting, setGreeting] = useState("");
  const chatEndRef = useRef(null);
  const [copied, setCopied] = useState(false);
  // greeting text
  const [showGreeting, setShowGreeting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const navigate = useNavigate();
  const [lastBotMessage, setLastBotMessage] = useState(null);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const [showMicTooltip, setShowMicTooltip] = useState(false);
  const [scrollTooltip, setscrollTooltip] = useState(false);
  const [voiceTooltip, setvoiceTooltip] = useState(false);

  const fileInputRef = useRef(null);
  const buttonRef = useRef(null);
  const textareaRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const dispatch = useDispatch();
  const { activeConversation, messages } = useSelector((state) => state.chat);
  const { user, token } = useSelector((state) => state.auth);
  const [inputMessage, setInputMessage] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const conversations = useSelector((state) => state.chat.conversations);
  const [isResponding, setIsResponding] = useState(false);

  // guest mode

  const guestConversationId = useSelector(
    (state) => state.chat.guestConversationId
  );

  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // For final transcription

  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

  // scroll button prop
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const markdownRefs = useRef({});
  // const API_BASE_URL = "https://quantumhash-backend-1.onrender.com/api"; // Replace with your backend URL
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");

  const WSS_BASE_URL = import.meta.env.VITE_WSS_API_BASE_URL;

  // copy button

  const handleCopyCode = (content, messageId) => {
    const markdownRef = markdownRefs.current[messageId];

    if (markdownRef && markdownRef.getFormattedText) {
      // Get the formatted text from the rendered component
      const formattedText = markdownRef.getFormattedText();
      console.log("Formatted text to copy:", formattedText.substring(0, 200));
      navigator.clipboard.writeText(formattedText);
    } else {
      // Fallback to original content
      console.log("Fallback to raw content");
      navigator.clipboard.writeText(content);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleLoginPrompt = () => setShowLoginPrompt(true);

  // Add state to track user scroll behavior
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Enhanced smart scroll function
  const scrollToBottomSmooth = () => {
    // Don't auto-scroll if user has manually scrolled up
    if (userHasScrolledUp) {
      console.log("⏸️ Skipping auto-scroll - user has scrolled up");
      return;
    }

    // Check if we're already near the bottom before scrolling
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      // Only scroll if we're reasonably close to bottom
      if (distanceFromBottom > 200) {
        console.log("⏸️ Skipping auto-scroll - too far from bottom");
        return;
      }
    }

    setIsAutoScrolling(true);

    // Use a more gentle scroll approach
    requestAnimationFrame(() => {
      if (chatEndRef.current && !userHasScrolledUp) {
        chatEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }

      // Reset auto-scrolling flag after animation completes
      setTimeout(() => {
        setIsAutoScrolling(false);
      }, 500); // Increased timeout to match scroll animation
    });
  };

  const handleUserScrollInterruption = () => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      setUserHasScrolledUp(true);
      console.log("🛑 User interrupted auto-scroll");
    }
  };

  // 1st useeffect
  useEffect(() => {
    const storedConversationId = localStorage.getItem("conversation_id");

    if (storedConversationId) {
      dispatch(setActiveConversation(parseInt(storedConversationId))); // Make sure it's a number
    }
  }, [dispatch]);

  // 2nd useeffect
  useEffect(() => {
    if (!activeConversation || !token) return;

    fetchConversationHistory(activeConversation, token)
      .then((data) => {
        // console.log("Fetched history:", data.history);
        const history = Array.isArray(data.history)
          ? data.history
          : [data.history];

        dispatch(
          setMessages({ conversationId: activeConversation, messages: history })
        );

        // ✅ Auto-scroll to bottom after fetching messages
        setTimeout(() => {
          const chatContainer = document.getElementById("chat-container");
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      })
      .catch((err) => console.error("❌ Error fetching chat history:", err));
  }, [activeConversation, token, dispatch]);

  // 3rd useeffect

  useEffect(() => {
    if (activeConversation) {
      localStorage.setItem("conversation_id", activeConversation);
    }
  }, [activeConversation]);

  // const conversationMessages = messages[activeConversation] || [];
  const conversationMessages = isGuest
    ? messages["guest"] || []
    : messages[activeConversation] || [];

  // greeting text function starts

  const generateGreeting = () => {
    const greetingOptions = [
      "Explore Like Never Before. The Quantum Way!!!",
      "Say Hello to the Quantum Future",
      "bringing intelligence to the conversation.",
    ];

    const selectedGreeting =
      greetingOptions[Math.floor(Math.random() * greetingOptions.length)];

    let index = 0;
    let typedText = "";

    const typingInterval = setInterval(() => {
      if (index < selectedGreeting.length) {
        typedText += selectedGreeting[index];
        setGreeting(typedText);
        index++;
      } else {
        clearInterval(typingInterval);

        // Start blinking cursor after typing finishes
        setInterval(() => {
          setShowCursor((prev) => !prev);
        }, 500);
      }
    }, 60);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    if (hour >= 21 && hour < 24) return "Night owl";
    if (hour >= 0 && hour < 3) return "Midnight coder";
    return "Early bird"; // 3-5 AM
  };

  // greeting text function ends

  // 4th useeffect
  useEffect(() => {
    const currentMessages = messages[activeConversation];

    // Don't do anything until data is fetched
    if (currentMessages === undefined) return;

    // If no messages in conversation, show greeting
    if (currentMessages.length === 0) {
      setShowGreeting(true);

      // Only run typing animation once
      if (!greeting) {
        generateGreeting();
      }
    } else {
      // Hide greeting when there's at least one message
      if (showGreeting) setShowGreeting(false);
      if (greeting) setGreeting(""); // Reset greeting so it's fresh next time
    }
  }, [activeConversation, messages]);

  useEffect(() => {
    // Get current conversation messages based on mode
    const currentMessages = conversationMessages; // This already handles guest vs user mode

    if (!currentMessages || currentMessages.length === 0) return;

    const scrollToBottom = () => {
      // Wait for DOM to update first
      setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
          // console.log("Scrolled to bottom after message update.");
        }
      }, 100);
    };

    scrollToBottom();
  }, [conversationMessages.length, botTyping]);

  // 6th useEffect
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50;
      setShowScrollButton(!isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initialize

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [activeConversation]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const stored = localStorage.getItem("last_ai_message");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.suggestions?.length > 0) {
          setLastBotMessage(parsed);
        }
      } catch (err) {
        console.error("Failed to parse stored AI message:", err);
      }
    }
  }, []);

  // Add this useEffect after your existing useEffects (around line 200-250)
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    let lastScrollTop = container.scrollTop;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight;

      // Clear previous timeout
      clearTimeout(scrollTimeout);

      // Debounce scroll detection
      scrollTimeout = setTimeout(() => {
        const isNearBottom = distanceFromBottom <= 100;

        // Detect if user manually scrolled up (not auto-scroll)
        if (
          !isAutoScrolling &&
          currentScrollTop < lastScrollTop &&
          !isNearBottom
        ) {
          if (!userHasScrolledUp) {
            setUserHasScrolledUp(true);
            console.log("🔼 User scrolled up manually - pausing auto-scroll");
          }
        }

        // If user scrolled back to bottom, resume auto-scroll
        if (isNearBottom && userHasScrolledUp) {
          setUserHasScrolledUp(false);
          console.log("🔽 User back at bottom - resuming auto-scroll");
        }

        // Update scroll button visibility
        setShowScrollButton(!isNearBottom);

        lastScrollTop = currentScrollTop;
      }, 50); // Reduced debounce time for more responsive detection
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    // Initialize scroll state
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [userHasScrolledUp, isAutoScrolling]);

  // working handlesend message function starts

  
  const handleSendMessage = async (customText) => {
    //  console.log("💥 handleSendMessage fired", { customText });
    // Reset scroll state for new message
    setUserHasScrolledUp(false);
    const messageText =
      typeof customText === "string"
        ? customText.trim()
        : inputMessage.trim?.() || "";
    if (!messageText && files.length === 0) return;
    setIsResponding(true);

    textareaRef.current.style.height = "44px";
    const plainText =
      typeof customText === "string" && customText.trim()
        ? customText.trim()
        : inputMessage.trim();
    if (!plainText && files.length === 0) return;

    // ✅ Guest Mode with Streaming
    if (isGuest) {
      const userMessage = {
        id: Date.now(),
        conversationId: guestConversationId || "guest",
        message: plainText,
        sender: "user",
        files: [],
      };

      setInputMessage("");
      setFiles([]);
      setBotTyping(true);
      setLoading(true);

      dispatch(
        addMessage({
          conversationId: guestConversationId || "guest",
          message: userMessage,
        })
      );

      // Create initial bot message for streaming
      let currentBotMessageId = Date.now() + 1;
      let streamingResponse = "";

      const initialBotMessage = {
        id: currentBotMessageId,
        conversationId: guestConversationId || "guest",
        message: "",
        sender: "bot",
        response: "",
        isNewMessage: true,
        suggestions: [],
        isStreaming: true, // Flag to show it's streaming
      };

      dispatch(
        addMessage({
          conversationId: guestConversationId || "guest",
          message: initialBotMessage,
        })
      );

      console.log("📤 Sending guest message with streaming:", plainText);

      try {
        await sendGuestMessage(plainText, (streamData) => {
          switch (streamData.type) {
            case "start":
              console.log("🚀 Guest stream started:", streamData.data);
              break;

            case "content":
              streamingResponse = streamData.fullResponse;

              // Hide typing indicator when first content arrives
              if (streamingResponse.trim().length > 0) {
                setBotTyping(false);
              }

              // Update the message in real-time as content streams
              dispatch(
                updateMessage({
                  conversationId: guestConversationId || "guest",
                  id: currentBotMessageId,
                  message: streamingResponse,
                  response: streamingResponse,
                })
              );
              // 🚀 Smart scroll with delay to allow DOM update
              setTimeout(() => {
                scrollToBottomSmooth();
              }, 10);
              break;

            case "end":
              // Final update with suggestions and complete response
              dispatch(
                updateMessage({
                  conversationId: guestConversationId || "guest",
                  id: currentBotMessageId,
                  message: streamData.fullResponse,
                  response: streamData.fullResponse,
                  suggestions: streamData.suggestions || [],
                  isStreaming: false,
                })
              );
              setBotTyping(false);

              // Update localStorage with final messages
              const finalUserMessage = userMessage;
              const finalBotMessage = {
                id: currentBotMessageId,
                conversationId: guestConversationId || "guest",
                message: streamData.fullResponse,
                sender: "bot",
                response: streamData.fullResponse,
                suggestions: streamData.suggestions || [],
              };

              const prevGuestChat = JSON.parse(
                localStorage.getItem("guest_chat") || "[]"
              );
              localStorage.setItem(
                "guest_chat",
                JSON.stringify([
                  ...prevGuestChat,
                  finalUserMessage,
                  finalBotMessage,
                ])
              );

              console.log("✅ Guest stream completed");
              //  scrollToBottomSmooth();
              break;

            case "error":
              dispatch(
                updateMessage({
                  conversationId: guestConversationId || "guest",
                  id: currentBotMessageId,
                  message: streamData.error || "❌ Failed to get a response.",
                  response: streamData.error || "❌ Failed to get a response.",
                  isStreaming: false,
                })
              );
              setBotTyping(false);
              toast.error("❌ Guest response failed.");
              break;
          }
        });
      } catch (error) {
        console.error("❌ Guest mode streaming error:", error);

        // Update the bot message with error
        dispatch(
          updateMessage({
            conversationId: guestConversationId || "guest",
            id: currentBotMessageId,
            message: "❌ Failed to get a response.",
            response: "❌ Failed to get a response.",
            isStreaming: false,
          })
        );

        setBotTyping(false);
        toast.error("❌ Failed to get guest response.");
      } finally {
        setLoading(false);
        setIsResponding(false);
      }
      return;
    }
    // ✅ Logged-in user flow
    const token = localStorage.getItem("token");
    const user_id = user?.user_id || localStorage.getItem("user_id");
    const conv_id =
      activeConversation || localStorage.getItem("conversation_id");
    if (!token) {
      console.error("🚨 Missing token.");
      return;
    }
    if (!user_id) {
      console.error("🚨 Missing user_id.");
      return;
    }

    // ✅ 1. Prepare user message text (without appending file names - we'll show them separately)
    const userMessage = {
      id: Date.now(),
      message: plainText,
      sender: "user",
       files: files.map((f) => ({ 
    file_name: f.name,           // Original filename
    display_name: f.name,        // For display
    file_type: f.type,           // MIME type
    file_size: f.size,           // File size
    name: f.name,                // Keep for backward compatibility
    type: f.type,
    // ✅ ADD: Temporary processing state
    processing: true,
    upload_success: null               // Keep for backward compatibility
  })),
};
   
    dispatch(addMessage({ conversationId: conv_id, message: userMessage }));
    setLoading(true); // 🔐 Disable send button here
    setInputMessage("");
    setBotTyping(true);
    setFiles([]);
if (fileInputRef.current) {
  fileInputRef.current.value = null; // Use null instead of empty string
  fileInputRef.current.type = 'text';
  fileInputRef.current.type = 'file'; // This forces a reset
}
    try {
      // ✅ 2. Prepare FormData for upload
      const formData = new FormData();
      if (plainText) formData.append("message", plainText);
      formData.append("user_id", user_id);
      if (conv_id) formData.append("conversation_id", conv_id);
      files.forEach((file) => {
        formData.append("files", file);
      });

      // ✅ 3. Upload files
      const uploadResponse = await uploadFiles(formData, token, (event) => {
        const percent = Math.round((event.loaded * 100) / event.total);
        const progressMap = {};
        files.forEach((file) => {
          progressMap[file.name] = percent;
        });
        setUploadProgress(progressMap);
      });

      const finalConversationId =
        uploadResponse?.data?.conversation_id ||
        uploadResponse?.conversation_id ||
        conv_id;
      if (!activeConversation && finalConversationId) {
        dispatch(setActiveConversation(finalConversationId));
      }

      // ✅ 4. Extract metadata to send to chatbot
      const uploaded_file_metadata = uploadResponse?.data?.files || [];

      const file_upload_ids = uploadResponse?.data?._internal?.uploaded_file_ids || 
                       uploadResponse?._internal?.uploaded_file_ids || [];

     // In your handleSendMessage function, ensure file metadata is properly stored
if (uploaded_file_metadata.length > 0) {
  const formattedFiles = uploaded_file_metadata.map(file => ({
    file_name: file.file_name || file.original_filename,
    display_name: file.display_name || file.file_name,
    file_path: file.file_path,
    file_type: file.file_type || file.mime_type,
    file_size: file.file_size,
    unique_filename: file.unique_filename,
    upload_success: file.upload_success !== false,
    extraction_error: file.extraction_error,
    // ✅ ADD: Ensure these are always present for icon display
    name: file.file_name || file.original_filename,
    type: file.file_type || file.mime_type,
    url: file.file_path,
    processing: false,
    // ✅ ADD: Store original file extension for icon fallback
    extension: file.file_name ? file.file_name.split('.').pop()?.toLowerCase() : null
  }));

  // Update Redux with proper file data
  dispatch(
    updateMessage({
      conversationId: finalConversationId,
      id: userMessage.id,
      files: formattedFiles,
    })
  );
}

// ✅ ADD: Handle upload errors
if (uploadResponse?.summary?.failed > 0) {
  // Update files that failed to upload
  const failedFiles = uploadResponse?.data?.files?.filter(f => !f.upload_success) || [];
  if (failedFiles.length > 0) {
    const errorFiles = failedFiles.map(file => ({
      file_name: file.file_name || file.original_filename || "Unknown file",
      display_name: file.display_name || file.file_name || "Unknown file",
      file_type: file.file_type || "unknown",
      upload_success: false,
      error: file.error || "Upload failed",
      name: file.file_name || "Unknown file",
      type: file.file_type || "unknown"
    }));
    
    // Update the message with error state
    dispatch(
      updateMessage({
        conversationId: finalConversationId,
        id: userMessage.id,
        files: [...(formattedFiles || []), ...errorFiles],
      })
    );
  }
}

      // ✅ 5. Send message to chatbot with streaming if there's a user message
      if (plainText || files.length > 0) {
        let streamingResponse = "";
        let currentBotMessageId = Date.now() + 1;

        // Create initial bot message for streaming
        const initialBotMessage = {
          id: currentBotMessageId,
          message: "",
          sender: "bot",
          response: "",
          files: [],
          suggestions: [],
          isNewMessage: true,
          isStreaming: true, // Flag to show it's streaming
        };

        dispatch(
          addMessage({
            conversationId: finalConversationId,
            message: initialBotMessage,
          })
        );

        try {
          const chatRes = await sendMessage(
            finalConversationId,
            plainText,
            user_id,
            token,
            uploadResponse?.data?.extracted_summary_raw,
            uploaded_file_metadata,
            file_upload_ids,
            // 🚀 Streaming callback
            (streamData) => {
              switch (streamData.type) {
                case "start":
                  console.log("🚀 Stream started:", streamData.data);

                  // Update with initial metadata
                  dispatch(
                    updateMessage({
                      conversationId: finalConversationId,
                      id: currentBotMessageId,
                      files: streamData.data?.uploaded_files || [],
                    })
                  );
                  break;

                case "content":
                  streamingResponse = streamData.fullResponse;
                  // ✅ ADD THIS - Hide thinking when first content arrives
                  if (streamingResponse.trim().length > 0) {
                    setBotTyping(false);
                  }
                  // Update the message in real-time as content streams
                  dispatch(
                    updateMessage({
                      conversationId: finalConversationId,
                      id: currentBotMessageId,
                      message: streamingResponse,
                      response: streamingResponse,
                    })
                  );
                  // 🚀 Smart scroll with delay to allow DOM update
                  setTimeout(() => {
                    scrollToBottomSmooth();
                  }, 10);
                  break;

                case "end":
                  // Final update with suggestions and complete response
                  dispatch(
                    updateMessage({
                      conversationId: finalConversationId,
                      id: currentBotMessageId,
                      message: streamData.fullResponse,
                      response: streamData.fullResponse,
                      suggestions: streamData.suggestions || [],
                      isStreaming: false,
                    })
                  );
                  setBotTyping(false);
                  console.log("✅ Stream completed");
                  //  scrollToBottomSmooth();
                  break;

                case "error":
                  dispatch(
                    updateMessage({
                      conversationId: finalConversationId,
                      id: currentBotMessageId,
                      message:
                        streamData.error || "❌ Failed to get a response.",
                      response:
                        streamData.error || "❌ Failed to get a response plz try after some time.",
                      isStreaming: false,
                       error: true,
                    })
                  );
                  setBotTyping(false);
                  toast.error("❌ AI response failed.");
                  break;
              }
            }
          );

          // ✅ 6. Rename is handled by the backend — now refresh conversations list in Sidebar
          const updatedConversations = await fetchConversations(token);
          dispatch(setConversations(updatedConversations?.conversations || []));

          // ✅ 7. Fetch updated conversation list after rename
          const currentConv = conversations.find(
            (c) => c.id === finalConversationId
          );
          if (currentConv?.name === "New Conversation") {
            const updatedData = await fetchConversations(token);
            if (updatedData?.conversations) {
              dispatch(setConversations(updatedData.conversations));
              const currentId = localStorage.getItem("conversation_id");
              if (currentId) {
                dispatch(setActiveConversation(Number(currentId)));
              }
            }
          }
        } catch (streamError) {
          console.error("❌ Streaming error:", streamError);
          dispatch(
            updateMessage({
              conversationId: finalConversationId,
              id: currentBotMessageId,
              message: "❌ Failed to get a response.",
              response: "❌ Failed to get a response.",
              isStreaming: false,
            })
          );
          setBotTyping(false);
          toast.error("❌ Message failed to send.");
        }
      } else if (files.length > 0) {
        // ✅ 8. No user message, only files
        toast.info(
          uploadResponse?.data?.extracted_summary ||
            "🧠 Files received, but no text was extractable.",
          { position: "bottom-right" }
        );
        setBotTyping(false); // ✅ stop here too
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
       // ✅ UPDATE: Mark files as failed in Redux
  dispatch(
    updateMessage({
      conversationId: conv_id,
      id: userMessage.id,
      files: files.map(f => ({
        file_name: f.name,
        display_name: f.name,
        file_type: f.type,
        upload_success: false,
        error: "Upload failed",
        processing: false
      }))
    })
  );
      dispatch(
        addMessage({
          conversationId: conv_id,
          message: {
            id: Date.now() + 1,
            message: "❌ Failed to get a response.",
            sender: "bot",
            response: "❌ Failed to get a response.",
          },
        })
      );
      toast.error("❌ Message or file upload failed.");
      setBotTyping(false); // ✅ also stop here in error
      setLoading(false); // 🔓 Re-enable send button here
    } finally {
      // ✅ 9. Cleanup
      setUploadProgress({});
      setLoading(false); // 🔓 Re-enable send button here
      setIsResponding(false);
    }
  };

  // working handlesend message ends
const clearFileSelection = () => {
  setFiles([]);
  setUploadProgress({});
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};
  // ✅ Remove selected file
  const removeFile = (index) => {
  const updatedFiles = [...files];
  updatedFiles.splice(index, 1);
  setFiles(updatedFiles);
  
  // ✅ CLEAR: Reset file input if no files left
  if (updatedFiles.length === 0 && fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  // ✅ Handle file upload selection
  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  // text area resize starts

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    const el = textareaRef.current;
    if (!el) return;

    // Reset height to minimum before recalculating
    el.style.height = "auto"; // ← crucial to allow shrinking
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [inputMessage, transcriptBuffer]);

  // text area resize ends

  

  // voice functions dictation part starts
// dictate mode start 
// Add these new states for live transcript display
const [showLiveTranscript, setShowLiveTranscript] = useState(false);
const [liveTranscriptText, setLiveTranscriptText] = useState("");
const [accumulatedTranscript, setAccumulatedTranscript] = useState(""); // 👈 NEW: For full transcript
const [isTranscriptFinal, setIsTranscriptFinal] = useState(false);

  // ✅ Call this to start recording
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  recorderRef.current = RecordRTC(stream, {
    type: "audio",
    mimeType: "audio/wav", // 👈 Changed from webm to wav
    recorderType: RecordRTC.StereoAudioRecorder,
    desiredSampRate: 16000, // 👈 Match backend sample rate
    numberOfAudioChannels: 1, // 👈 Mono audio for better compatibility
    timeSlice: 1000,
    ondataavailable: (blob) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        // 👈 Convert blob to ArrayBuffer for raw audio data
        blob.arrayBuffer().then(buffer => {
          socketRef.current.send(buffer);
        });
      }
    },
  });

  const token = localStorage.getItem("token");
  console.log("🎙️ Token:", token);
  
  socketRef.current = new WebSocket(`${WSS_BASE_URL}?token=${token}&mode=dictate`);

  socketRef.current.onopen = () => {
    console.log("🎙️ Dictate WebSocket connected");
    recorderRef.current.startRecording();
    setIsRecording(true);
    setShowLiveTranscript(true);
    setLiveTranscriptText("");
    setAccumulatedTranscript(""); // 👈 Reset accumulated transcript
  };

  socketRef.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "dictate-ready") {
      console.log("✅ Dictate mode ready");
      setLiveTranscriptText("Listening...");
      setAccumulatedTranscript(""); // 👈 Reset on ready
    }
    
    if (data.type === "dictate-transcript") {
      const transcript = data.text;
      if (transcript) {
        console.log("📝 Live dictate transcript:", transcript);
        
        // 👈 NEW: Handle transcript accumulation
        if (data.is_final) {
          // Final transcript - add to accumulated and clear current
          setAccumulatedTranscript((prev) => {
            const newLine = prev.trim() ? prev + " " + transcript : transcript;
            return newLine;
          });
          setLiveTranscriptText(""); // Clear current interim
          setIsTranscriptFinal(true);
          
          // Also update transcript buffer for fallback
          setTranscriptBuffer((prev) => prev + " " + transcript + " ");
        } else {
          // Interim transcript - show as current without adding to accumulated
          setLiveTranscriptText(transcript);
          setIsTranscriptFinal(false);
        }
        
        if (voiceMode) {
          setTranscriptBuffer(transcript);
        }
      }
    }

    // Keep existing logic for backward compatibility
    if (data.type === "transcript") {
      const transcript = data.transcript;
      if (transcript) {
        console.log("📝 Live transcription:", transcript);
        
        // 👈 NEW: Also handle accumulation for backward compatibility
        setAccumulatedTranscript((prev) => {
          const newLine = prev.trim() ? prev + " " + transcript : transcript;
          return newLine;
        });
        setLiveTranscriptText("");
        
        if (voiceMode) {
          setTranscriptBuffer(transcript);
        } else {
          setTranscriptBuffer((prev) => prev + " " + transcript + " ");
        }
      }
    }

    if (data.type === "dictate-stopped") {
      console.log("🛑 Dictate mode stopped");
    }
  };

  socketRef.current.onclose = () => {
    console.log("🔌 Dictate WebSocket closed");
  };

  socketRef.current.onerror = (err) => {
    console.error("❌ Dictate WebSocket Error:", err);
  };
};


 const stopRecording = () => {
  if (recorderRef.current) {
    setIsUploading(true);
    setIsRecording(false);
    setLiveTranscriptText("Processing..."); // 👈 Show processing message
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "stop-dictate" }));
    }

    recorderRef.current.stopRecording(async () => {
      const blob = recorderRef.current.getBlob();
      const token = localStorage.getItem("token");

      try {
        const finalTranscript = await uploadFinalAudio(blob, token);
        const trimmedTranscript = finalTranscript.trim();

        if (trimmedTranscript) {
          if (voiceMode) {
            startRealtimeAI({
              conversationId: activeConversation,
              userMessage: trimmedTranscript,
            });
          } else {
            setInputMessage((prev) => prev + " " + trimmedTranscript);
          }
        } else {
          setInputMessage("");
        }
      } catch (err) {
        console.error("⚠️ Upload or transcription error", err);
        
        // 👈 UPDATED: Use accumulated transcript as fallback
        const fallbackTranscript = accumulatedTranscript.trim() || transcriptBuffer.trim();
        if (fallbackTranscript) {
          setInputMessage((prev) => prev + " " + fallbackTranscript);
        }
      } finally {
        setIsUploading(false);
        setTranscriptBuffer("");
        setVoiceMode(false);
        // 👈 Hide live transcript overlay after processing
        setTimeout(() => {
          setShowLiveTranscript(false);
          setLiveTranscriptText("");
          setAccumulatedTranscript(""); // 👈 Reset accumulated transcript
        }, 1000);
      }
    });
  }

  setTimeout(() => {
    if (socketRef.current) socketRef.current.close();
  }, 1000);
};

  // voice functions dictation part ends

  // test2 working 14-05-25
  // ✅ Voice mode refs
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [socketOpen, setSocketOpen] = useState(false);
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [aiResponseText, setAiResponseText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const audioChunksBufferRef = useRef([]);
  const currentTTSAudioRef = useRef(null);

  let audioContext, mediaStream, processor, socket;

  const [currentBotMessageId, setCurrentBotMessageId] = useState(null);
  // OR better yet, use useRef for callback usage:
  const currentBotMessageIdRef = useRef(null);
  const voiceAccumulatedResponseRef = useRef("");

  // tts part
  // ✅ HUMAN-LIKE: Web Audio API with natural speech processing
  const audioContextRef = useRef(null);
  const audioBufferQueueRef = useRef([]);
  const isPlayingAudioRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const pcmBufferRef = useRef([]);

  const initializeTTSAudio = () => {
    try {
      // Create Web Audio Context for human-like playback
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: 24000,
      });

      audioBufferQueueRef.current = [];
      pcmBufferRef.current = [];
      isPlayingAudioRef.current = false;
      nextPlayTimeRef.current = 0;

      setIsTTSPlaying(true);
      console.log("🔊 Human-like Web Audio API initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Web Audio API:", error);
      setIsTTSPlaying(true);
    }
  };

  const handleTTSChunk = (
    base64Audio,
    encoding = "linear16",
    sampleRate = 24000
  ) => {
    try {
      console.log(
        `🔊 Processing human-like audio chunk: ${base64Audio.length} chars`
      );

      // Decode base64 to PCM
      const binaryString = atob(base64Audio);
      const pcmData = new Int16Array(binaryString.length / 2);

      for (let i = 0; i < pcmData.length; i++) {
        const byte1 = binaryString.charCodeAt(i * 2);
        const byte2 = binaryString.charCodeAt(i * 2 + 1);
        pcmData[i] = (byte2 << 8) | byte1;
      }

      // Add to continuous buffer
      pcmBufferRef.current.push(pcmData);

      // Process larger chunks for more natural speech flow
      const totalSamples = pcmBufferRef.current.reduce(
        (sum, chunk) => sum + chunk.length,
        0
      );

      // Process when we have ~800ms of audio for natural pacing
      if (totalSamples >= 19200) {
        // 800ms at 24kHz for more natural chunks
        processHumanLikeAudioBuffer();
      }
    } catch (error) {
      console.error("❌ Error processing audio chunk:", error);
    }
  };

  const processHumanLikeAudioBuffer = async () => {
    try {
      if (!audioContextRef.current || pcmBufferRef.current.length === 0) return;

      // Combine all PCM data
      const totalLength = pcmBufferRef.current.reduce(
        (sum, chunk) => sum + chunk.length,
        0
      );
      const combinedPCM = new Int16Array(totalLength);

      let offset = 0;
      for (const chunk of pcmBufferRef.current) {
        combinedPCM.set(chunk, offset);
        offset += chunk.length;
      }

      // Clear buffer
      pcmBufferRef.current = [];

      // ✅ HUMAN-LIKE PROCESSING: Apply natural speech effects
      const processedPCM = applyHumanLikeEffects(combinedPCM);

      // Convert PCM to Float32 for Web Audio API
      const float32Data = new Float32Array(processedPCM.length);
      for (let i = 0; i < processedPCM.length; i++) {
        float32Data[i] = processedPCM[i] / 32768.0;
      }

      // Create AudioBuffer
      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        float32Data.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32Data);

      // Schedule with natural pacing
      scheduleHumanLikeAudioBuffer(audioBuffer);

      console.log(
        `🔊 Scheduled ${float32Data.length} samples with human-like processing`
      );
    } catch (error) {
      console.error("❌ Error processing human-like audio buffer:", error);
    }
  };

  // ✅ HUMAN-LIKE EFFECTS: Make speech more natural
  const applyHumanLikeEffects = (pcmData) => {
    try {
      // 1. Slight volume normalization for consistent levels
      const normalizedData = normalizeAudio(pcmData);

      // 2. Add subtle natural variations
      const naturalData = addNaturalVariations(normalizedData);

      // 3. Smooth transitions between chunks
      const smoothedData = smoothTransitions(naturalData);

      return smoothedData;
    } catch (error) {
      console.error("❌ Error applying human-like effects:", error);
      return pcmData; // Return original if processing fails
    }
  };

  const normalizeAudio = (pcmData) => {
    // Find peak amplitude
    let maxAmplitude = 0;
    for (let i = 0; i < pcmData.length; i++) {
      maxAmplitude = Math.max(maxAmplitude, Math.abs(pcmData[i]));
    }

    // Normalize to ~70% of max to avoid clipping and sound more natural
    const targetAmplitude = 32768 * 0.7;
    const normalizationFactor =
      maxAmplitude > 0 ? targetAmplitude / maxAmplitude : 1;

    const normalizedData = new Int16Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      normalizedData[i] = Math.round(pcmData[i] * normalizationFactor);
    }

    return normalizedData;
  };

  const addNaturalVariations = (pcmData) => {
    // Add very subtle natural variations (like human speech micro-variations)
    const naturalData = new Int16Array(pcmData.length);

    for (let i = 0; i < pcmData.length; i++) {
      // Add tiny random variations (±1% max) for more natural sound
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      naturalData[i] = Math.round(pcmData[i] * (1 + variation));
    }

    return naturalData;
  };

  const smoothTransitions = (pcmData) => {
    // Apply gentle fade-in/fade-out to chunk edges for seamless transitions
    const smoothedData = new Int16Array(pcmData.length);
    const fadeLength = Math.min(480, pcmData.length / 10); // 20ms fade at 24kHz

    for (let i = 0; i < pcmData.length; i++) {
      let sample = pcmData[i];

      // Fade in at the beginning
      if (i < fadeLength) {
        const fadeIn = i / fadeLength;
        sample = Math.round(sample * fadeIn);
      }

      // Fade out at the end
      if (i >= pcmData.length - fadeLength) {
        const fadeOut = (pcmData.length - 1 - i) / fadeLength;
        sample = Math.round(sample * fadeOut);
      }

      smoothedData[i] = sample;
    }

    return smoothedData;
  };

  const scheduleHumanLikeAudioBuffer = (audioBuffer) => {
    try {
      if (!audioContextRef.current) return;

      const source = audioContextRef.current.createBufferSource();

      // ✅ HUMAN-LIKE AUDIO PROCESSING: Add subtle effects
      const gainNode = audioContextRef.current.createGain();
      const compressor = audioContextRef.current.createDynamicsCompressor();

      // Configure compressor for more natural speech
      compressor.threshold.setValueAtTime(
        -24,
        audioContextRef.current.currentTime
      );
      compressor.knee.setValueAtTime(30, audioContextRef.current.currentTime);
      compressor.ratio.setValueAtTime(3, audioContextRef.current.currentTime);
      compressor.attack.setValueAtTime(
        0.003,
        audioContextRef.current.currentTime
      );
      compressor.release.setValueAtTime(
        0.25,
        audioContextRef.current.currentTime
      );

      // Set natural volume level
      gainNode.gain.setValueAtTime(0.85, audioContextRef.current.currentTime);

      // Connect audio chain: source -> compressor -> gain -> destination
      source.buffer = audioBuffer;
      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;

      // Schedule with natural pacing
      if (!isPlayingAudioRef.current) {
        // First chunk - start with slight delay for natural feel
        nextPlayTimeRef.current = currentTime + 0.15; // Slightly longer delay for natural start
        isPlayingAudioRef.current = true;
      }

      // Schedule this buffer to play with natural timing
      source.start(nextPlayTimeRef.current);

      // ✅ NATURAL PACING: Add small gaps between chunks for breathing room
      const naturalGap = 0.05; // 50ms gap for natural speech rhythm
      nextPlayTimeRef.current += audioBuffer.duration + naturalGap;

      // Handle completion
      source.onended = () => {
        console.log("🔊 Human-like audio buffer completed naturally");
      };

      console.log(
        `🔊 Human-like audio scheduled at ${nextPlayTimeRef.current}, duration: ${audioBuffer.duration}s`
      );
    } catch (error) {
      console.error("❌ Error scheduling human-like audio buffer:", error);
    }
  };

  const playTTSAudio = () => {
    // Process any remaining buffered audio
    if (pcmBufferRef.current.length > 0) {
      processHumanLikeAudioBuffer();
    }

    // Set completion timeout with natural timing
    setTimeout(() => {
      if (audioContextRef.current) {
        const remainingTime =
          nextPlayTimeRef.current - audioContextRef.current.currentTime;

        setTimeout(() => {
          setIsTTSPlaying(false);
          isPlayingAudioRef.current = false;
          console.log("🔊 All human-like TTS audio completed naturally");
        }, Math.max(remainingTime * 1000, 1500)); // Longer timeout for natural completion
      }
    }, 800); // Longer initial delay

    console.log("🔊 Human-like TTS playback finalized");
  };

  const cleanupTTSAudio = () => {
    try {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }

      audioContextRef.current = null;
      audioBufferQueueRef.current = [];
      pcmBufferRef.current = [];
      isPlayingAudioRef.current = false;
      nextPlayTimeRef.current = 0;
      setIsTTSPlaying(false);

      console.log("🔊 Human-like audio cleanup complete");
    } catch (error) {
      console.error("❌ Error during audio cleanup:", error);
    }
  };

  // dictate mode starts 
  // Update your startVoiceMode function
  const startVoiceMode = async () => {
    try {
      setUserHasScrolledUp(false);
      setIsVoiceMode(true);
      setIsProcessing(true);
      setShowVoiceOverlay(true);

      // Initialize audio context and mic stream
      audioContext = new AudioContext({ sampleRate: 16000 });
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const input = audioContext.createMediaStreamSource(mediaStream);

      // Optional: apply filter to reduce background noise
      const filter = audioContext.createBiquadFilter();
      filter.type = "lowshelf";
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      filter.gain.setValueAtTime(-10, audioContext.currentTime);

      input.connect(filter);

      // Create audio processor node (deprecated but works widely)
      processor = audioContext.createScriptProcessor(4096, 1, 1);
      filter.connect(processor);
      processor.connect(audioContext.destination);

      // Connect to WebSocket server
      const token = localStorage.getItem("token");
      const conversationId = activeConversation; // from Redux/state
      const socket = new WebSocket(
        `${WSS_BASE_URL}?token=${token}&conversation_id=${conversationId}`
      );
      socketRef.current = socket; // ✅ Store in ref

      socket.onopen = () => {
        console.log("🔌 WebSocket connected");
        setSocketOpen(true);
        setConnectionStatus("connected");
        setIsProcessing(false);

        processor.onaudioprocess = (e) => {
          if (socket.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16Data = convertFloat32ToInt16(inputData);
            socket.send(int16Data);
          }
        };
      };

      // ✅ Move the socket.onmessage handler here (outside of any other function)
      socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        console.log("📥 [WebSocket Message]", data);

        switch (data.type) {
          case "connected":
            console.log("✅ WebSocket connected:", data.message);
            break;

          case "transcript":
            // Live transcript from Deepgram
            console.log("📝 [Live Transcript]", data.text);
            setVoiceTranscript(data.text);
            break;

          case "user-message":
            // Final user message after processing
            console.log("👤 [User Message]", data.text);
            setVoiceTranscript(""); // Clear live transcript

            // ✅ Add user message to Redux store
            const userMessage = {
              id: Date.now(),
              message: data.text,
              sender: "user",
              files: [],
              conversationId: data.conversation_id,
            };

            dispatch(
              addMessage({
                conversationId: data.conversation_id,
                message: userMessage,
              })
            );
            break;

          case "bot-typing":
            // AI is processing/typing
            console.log("🤖 [Bot Typing]", data.status);
            setIsAISpeaking(data.status);
            setBotTyping(data.status);
            break;

          case "tts-start":
            console.log("🔊 TTS started");
            initializeTTSAudio();
            break;

          case "tts-audio-chunk":
            console.log("🔊 Got audio chunk");
            handleTTSChunk(data.audio, data.encoding, data.sample_rate);
            break;

          case "tts-end":
            console.log("🔊 TTS finished, playing audio");
            playTTSAudio();
            break;

          case "start":
            // AI response stream started
            console.log("🚀 [AI Response Start]", data);
            setIsAISpeaking(true);
            setBotTyping(true);

            // ✅ Reset accumulated response for new message
            voiceAccumulatedResponseRef.current = "";

            // ✅ Create initial bot message for streaming
            const newBotMessageId = Date.now() + 1;
            const initialBotMessage = {
              id: newBotMessageId,
              message: "",
              sender: "bot",
              response: "",
              files: data.uploaded_files || [],
              suggestions: [],
              isNewMessage: true,
              isStreaming: true,
            };

            // Store the message ID using ref for callback access
            currentBotMessageIdRef.current = newBotMessageId;

            dispatch(
              addMessage({
                conversationId: data.conversation_id,
                message: initialBotMessage,
              })
            );
            break;

          case "content":
            // AI response chunk - accumulate and update the streaming message
            console.log("🤖 [AI Chunk]", data.content);

            // ✅ Accumulate the content (same pattern as handleSendMessage)
            voiceAccumulatedResponseRef.current += data.content;
            const currentFullResponse = voiceAccumulatedResponseRef.current;

            // Hide typing when first content arrives
            if (currentFullResponse.trim().length > 0) {
              setBotTyping(false);
            }

            // ✅ Only update if we have a valid message ID
            if (currentBotMessageIdRef.current) {
              dispatch(
                updateMessage({
                  conversationId: activeConversation,
                  id: currentBotMessageIdRef.current,
                  message: currentFullResponse, // ✅ Use accumulated response
                  response: currentFullResponse, // ✅ Use accumulated response
                })
              );

              // ✅ Smart scroll to show new content
              setTimeout(() => {
                scrollToBottomSmooth();
              }, 10);
            }
            break;

          case "end":
            // AI response completed
            console.log("✅ [AI Response Complete]", data);
            setIsAISpeaking(false);
            setBotTyping(false);

            // ✅ Final update with complete response and suggestions
            if (currentBotMessageIdRef.current) {
              // Use the full_response from backend or fallback to accumulated
              const finalResponse =
                data.full_response || voiceAccumulatedResponseRef.current;

              dispatch(
                updateMessage({
                  conversationId: activeConversation,
                  id: currentBotMessageIdRef.current,
                  message: finalResponse,
                  response: finalResponse,
                  suggestions: data.suggestions || [],
                  isStreaming: false,
                })
              );
            }

            // Reset the message ID and accumulated response
            currentBotMessageIdRef.current = null;
            voiceAccumulatedResponseRef.current = "";
            break;

          case "conversation_renamed":
            // Conversation was renamed - refresh conversation list
            console.log("🏷️ [Conversation Renamed]", data.new_name);
            // ✅ Refresh conversations list
            if (token) {
              fetchConversations(token).then((updatedConversations) => {
                dispatch(
                  setConversations(updatedConversations?.conversations || [])
                );
              });
            }
            break;

          case "error":
            // Error occurred
            console.error("❌ [Voice Error]", data.error);
            setIsAISpeaking(false);
            setBotTyping(false);

            // ✅ Show error message in chat
            const errorMessage = {
              id: Date.now(),
              message: `❌ Error: ${data.error}`,
              sender: "bot",
              response: `❌ Error: ${data.error}`,
              error: true,
            };

            dispatch(
              addMessage({
                conversationId: activeConversation,
                message: errorMessage,
              })
            );

            toast.error(`❌ Voice Error: ${data.error}`);
            break;

          default:
            console.log("🔍 [Unknown Message Type]", data);
            break;
        }
      };

      socket.onclose = () => {
        console.log("❌ WebSocket closed");
        setConnectionStatus("disconnected");
        cleanup();
      };

      socket.onerror = (e) => {
        console.error("WebSocket error:", e);
        setConnectionStatus("error");
        cleanup();
      };
    } catch (err) {
      console.error("Voice mode error:", err);
      cleanup();
    }
  };

  // ✅ Update stopVoiceMode function
  const stopVoiceMode = () => {
    console.log("🎤 stopVoiceMode called");

    const socket = socketRef.current;
    if (!socket) {
      console.warn("⚠️ No socket instance found.");
      cleanup();
      return;
    }

    try {
      if (socket.readyState === WebSocket.OPEN) {
        console.log("🟢 WebSocket is OPEN, sending stop-voice...");
        socket.send(JSON.stringify({ type: "stop-voice" }));
        setTimeout(() => {
          socket?.close();
          console.log("🔌 WebSocket closed from frontend ✅");
        }, 100);
      } else if (socket.readyState === WebSocket.CONNECTING) {
        console.warn("⏳ WebSocket is CONNECTING, will retry...");
        const waitAndStop = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            clearInterval(waitAndStop);
            console.log("🟢 WebSocket became OPEN, sending stop-voice...");
            socket.send(JSON.stringify({ type: "stop-voice" }));
            setTimeout(() => {
              socket?.close();
              console.log("🔌 WebSocket closed from frontend ✅");
            }, 100);
          } else if (socket.readyState >= WebSocket.CLOSING) {
            clearInterval(waitAndStop);
            console.warn(
              "❌ WebSocket closed before we could send stop-voice."
            );
          }
        }, 50);
      } else {
        console.warn(
          "⚠️ WebSocket not open or connecting, cannot stop properly"
        );
      }
    } catch (err) {
      console.warn("⚠️ Failed to send stop-voice or close socket:", err);
    }

    setIsVoiceMode(false);
    setVoiceTranscript("");
    setShowVoiceOverlay(false);
    currentBotMessageIdRef.current = null; // ✅ Reset message ID using ref
    voiceAccumulatedResponseRef.current = ""; // ✅ Reset accumulated response
    cleanupTTSAudio(); // Add this line
    cleanup();
  };

  const cleanup = () => {
    processor?.disconnect();
    audioContext?.close();
    mediaStream?.getTracks().forEach((track) => track.stop());
  };

  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16.buffer;
  };


function preprocessMessage(msg) {
  // Auto-wrap full HTML in code block if detected
  if (msg.includes('<html') || msg.includes('<!DOCTYPE')) {
    return `\`\`\`html\n${msg}\n\`\`\``;
  }
  return msg;
}

// Enhanced mobile viewport handling
useEffect(() => {
  const setMobileVH = () => {
    // Method 1: CSS Custom Properties
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Method 2: Direct body height for mobile
    if (window.innerWidth <= 768) {
      document.body.style.height = `${window.innerHeight}px`;
      document.documentElement.style.height = `${window.innerHeight}px`;
    }
  };

  // Set initial values
  setMobileVH();
  
  // Handle resize and orientation changes
  window.addEventListener('resize', setMobileVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setMobileVH, 100); // Delay for orientation change
  });
  
  // Handle viewport changes on mobile (URL bar show/hide)
  window.addEventListener('scroll', setMobileVH);
  
  return () => {
    window.removeEventListener('resize', setMobileVH);
    window.removeEventListener('orientationchange', setMobileVH);
    window.removeEventListener('scroll', setMobileVH);
  };
}, []);



  return (
   <div className="flex flex-col w-full mobile-viewport md:h-screen overflow-y-auto bg-white dark:bg-[#121212] transition-colors duration-300 fixed md:relative inset-0 md:inset-auto z-40 md:z-auto mobile-full-height">

 {/* ✅ ADD: Mobile Menu Button - Now in ChatArea with conditional z-index */}
      {!isGuest && (
        <button
          className={`md:hidden fixed top-4 left-4 p-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-all duration-500 ease-in-out ${
            showVoiceOverlay || showLiveTranscript ? 'z-10' : 'z-50'
          }`}
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      <Navbar isGuest={isGuest} />
      {/* Chat Area starts */}
      <div
        ref={chatContainerRef}
        onWheel={handleUserScrollInterruption} // Detect mouse wheel
        onTouchMove={handleUserScrollInterruption} // Detect touch scroll
       className="relative flex-1 h-[calc(100dvh-140px)] md:h-[calc(100vh-160px)] w-full scrollbar-hover md:p-4 mt-16 md:mt-0 space-y-6 overflow-auto mx-auto bg-white dark:bg-[#121212] transition-colors duration-300"


        style={{}}>
        <RedirectModal
          open={modalOpen}
          url={pendingUrl}
          onConfirm={(url) => {
            window.open(url, "_blank", "noopener,noreferrer");
            setModalOpen(false);
            setPendingUrl("");
          }}
          onCancel={() => {
            setModalOpen(false);
            setPendingUrl("");
          }}
        />
        <div className="  md:w-[70%] w-full  mx-auto">
          {/* chats section starts */}
          {/* final  */}

          {conversationMessages.length > 0 ? (
            <>
              {conversationMessages
                .filter((msg) => msg && (msg.message || msg.response))
                .map((msg, index) => (
                  <div key={msg.id} className="p-2 my-2 rounded">
                    {/* display file  */}

                    {msg.sender === "user" && msg.files?.length > 0 && (
                      <MessageFiles files={msg.files} />
                    )}

                    {/* USER MESSAGE */}
                    {(msg.sender === "user" ||
                      (!msg.sender && msg.message)) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative   z-30 p-3 rounded-lg mt-2 break-words text-sm shadow-md hover:dark:bg-gradient-to-r hover:dark:from-[#0076FF] hover:dark:to-[#0000b591]  dark:bg-gradient-to-r dark:from-[#0000B5] dark:to-[#0076FF] text-[#1e293b] dark:text-white  max-w-full md:max-w-2xl w-fit self-end ml-auto">
                        <div className="flex items-start gap-2">
                          <div className="p-1 rounded-full flex-shrink-0">
                            {/* Fallback to default circle icon if user_img is not available */}
                            {user?.user_img ? (
                              <img
                                src={user?.user_img}
                                className="h-5 w-5 md:h-7 md:w-7 rounded-full object-cover border-2 border-gray-300"
                                alt="User Avatar"
                                onError={(e) => {
                                  e.target.onerror = null; // Prevent infinite loop if fallback image also fails
                                  e.target.src = "./user.png"; // Trigger fallback icon display
                                }}
                              />
                            ) : (
                              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center bg-gray-200">
                                {/* Default User Icon */}
                                <CircleUserRound
                                  size={20} // Set the icon size to fit inside the circle
                                  color="black"
                                  strokeWidth={2.25}
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex prose max-w-none dark:text-white flex-col w-full mr-7  mt-1  overflow-auto text-justify text-sm md:text-base space-y-2 font-poppins">
                            {/* <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {msg.message}
                            </ReactMarkdown> */}
                           
  <ReactMarkdown>
    {preprocessMessage(msg.message)}
  </ReactMarkdown>



                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* BOT RESPONSE */}
                    {/* BOT RESPONSE */}
                    {msg.response && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative   z-30 p-3 rounded-lg break-words  dark:bg-[#282828] text-sm shadow-md backdrop-blur-2xl bg-white/10 border border-white/20 text-gray-800 dark:text-white max-w-full self-start mr-auto mt-3">
                        <div className="flex items-start gap-2">
                          <div className="p-1 hidden md:block rounded-full">
                            <img
                              src="./logo.png"
                              className="h-5 w-5"
                              alt="Bot Logo"
                            />
                          </div>
                          {/* Replace the ChatbotMarkdown component with this */}
                          <div className="w-full text-base  mr-2 font-poppins relative">
                            <ChatbotMarkdown
                              ref={(ref) =>
                                (markdownRefs.current[msg.id] = ref)
                              }
                              content={msg.response}
                              messageId={msg.id}
                              onLinkClick={(url) => {
                                setPendingUrl(url);
                                setModalOpen(true);
                              }}
                              onCopyClick={handleCopyCode}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 p-4 font-poppins">
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="text-xs md:text-base text-gray-800 text-bold dark:text-gray-300 mb-2 font-medium">
                          Would you like to know more?
                        </motion.p>

                        <div className="flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, y: 30, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                duration: 0.6,
                                delay: index * 0.15,
                                ease: [0.25, 0.46, 0.45, 0.94],
                                type: "spring",
                                stiffness: 100,
                                damping: 15,
                              }}
                              onClick={() => {
                                if (isResponding) return; // ❗ Prevent while AI responding
                                const cleanSuggestion = suggestion.replace(
                                  /^\.+\s*/,
                                  ""
                                );
                                setInputMessage(cleanSuggestion);
                                handleSendMessage(cleanSuggestion);
                              }}
                              disabled={isResponding}
                              className={`px-4 py-1.5 flex justify-between items-center text-left w-full font-semibold md:font-bold rounded-full 
            bg-gradient-to-r from-gray-100 to-gray-200 
            dark:from-gray-700 dark:to-gray-800 
            text-gray-900 dark:text-white 
            text-xs md:text-sm shadow-sm 
            cursor-pointer select-none
            transition-all duration-300 ease-out
            hover:shadow-lg 
            ${
              botTyping || isProcessing
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:text-blue-500 dark:hover:text-blue-400"
            }
          `}>
                              {suggestion.replace(/^[.]/, "")} <span>+</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.response && (
                      <hr className="border-t-[1px] border-gray-600 dark:border-gray-600 w-full mx-auto my-5 opacity-50" />
                    )}
                  </div>
                ))}

              <BotThinking isVisible={botTyping || isProcessing} />
            </>
          ) : (
            // ✅ Greeting when no messages yet
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`absolute md:right-80  bottom-44 md:bottom-24 w-full gap-3 md:w-3/5 flex font-centurygothic flex-col items-center justify-center text-center text-gray-800 dark:text-white`}>
                <img
                  src="./logo.png"
                  className="w-16 h-16 block dark:hidden"
                  alt="Logo"
                />
                <img
                  src="./q.png"
                  className="w-16 h-16 hidden dark:block"
                  alt="Logo"
                />
                <span className="md:text-3xl font-centurygothic text-base font-extrabold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                  Quantum<span className="text-base md:text-4xl">Ai</span>
                </span>

                <h2 className="md:text-3xl text-base font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                  {greeting}
                  <span>
                    {isGuest && (
                      <p className="text-xs md:text-base bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                        You are in guest mode. Your messages won't be saved.
                      </p>
                    )}
                  </span>
                  {/* <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">{showCursor ? "|" : ""}</span> */}
                </h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5 }}
                  className="text-base md:text-2xl font-bold text-gray-500 dark:text-gray-300 font-centurygothic">
                  {getTimeBasedGreeting()} {user?.username}
                </motion.p>
              </motion.div>
            </>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      {showScrollButton && (
        <button
          onMouseEnter={() => setscrollTooltip(true)}
          onMouseLeave={() => setscrollTooltip(false)}
          onClick={scrollToBottom}
          className={`absolute bottom-[125px] md:bottom-[160px] right-0 md:right-10 transform -translate-x-1/2 z-50 p-1  rounded-full shadow-lg bg-white dark:bg-gray-800 border border-black dark:border-white transition text-black dark:text-white`}
          aria-label="Scroll to bottom">
          {/* <CircleArrowDown /> */}
          <span className="hidden md:block">
            <ArrowDown />
          </span>
          <span className="block md:hidden">
            <ArrowDown size={16} />
          </span>
          {scrollTooltip && (
            <div className="hidden sm:block absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-900 rounded-lg shadow-md whitespace-nowrap">
              Scroll Down
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                  border-l-[6px] border-l-transparent 
                  border-r-[6px] border-r-transparent 
                  border-t-[6px] border-t-zinc-900"
              />
            </div>
          )}
        </button>
      )}
      {/* chat area ends*/}
      {/* Input Section div starts */}
      <div className="flex flex-col  mx-auto    mb-3 mt-2 w-[95%] sm:w-[70%] shadow-2xl rounded-3xl bg-white dark:bg-[#282828]  p-2 transition-colors duration-300">
        {/* File Previews Section — ✅ UPDATED LIKE CHATGPT */}

        {/* test  */}
        <div className="w-full flex gap-3 mb-1 md:mb-3 flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-sm w-[150px] flex-shrink-0 flex items-center gap-2">
              {/* 📸 Image Preview */}
              {file?.type?.startsWith("image/") ||
              /\.(jpg|jpeg|png|gif|webp)$/i.test(file?.name) ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-14 h-14 object-cover rounded-md hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="flex flex-col items-start text-black dark:text-white text-xs font-medium">
                  <span className="truncate max-w-[120px] flex items-center gap-1">
                    📄 {file.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}

              {/* ❌ Remove Button */}
              <button
                className="text-red-600 hover:text-red-400 absolute top-1 right-1"
                onClick={() => removeFile(index)}>
                <X size={14} />
              </button>

              {/* ⏳ Upload Progress */}
              {uploadProgress[file.name] && (
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gray-300 dark:bg-gray-600 rounded-b-md overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-200"
                    style={{ width: `${uploadProgress[file.name]}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Textarea Input */}

        {/* Text Area with Voice Visualizer */}
       <div className="relative w-full">
  <textarea
    ref={textareaRef}
    className="w-full h-auto text-xs md:text-base max-h-36 min-h-[35px] md:min-h-[44px] p-2 md:p-3  rounded-2xl bg-white dark:bg-[#717171] transition-all duration-200 ease-in-out text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 placeholder:text-gray-400 dark:placeholder-gray-300   resize-none overflow-y-auto scrollbar-hide leading-relaxed relative z-10"
    value={inputMessage} // 👈 CLEAN: Only inputMessage, no live transcript
    onChange={handleInputChange}
    onKeyDown={(e) => {
      const isMobile = isMobileDevice();

      if (e.key === "Enter") {
        if (isMobile) {
          // Mobile: Enter = new line, Shift+Enter = send
          if (e.shiftKey) {
            e.preventDefault();
            if (!loading) {
              handleSendMessage();
            }
          }
          // Let Enter create new line naturally (don't preventDefault)
        } else {
          // Desktop: Enter = send, Shift+Enter = new line
          if (!e.shiftKey) {
            e.preventDefault();
            if (!loading) {
              handleSendMessage();
            }
          }
          // Let Shift+Enter create new line naturally
        }
      }
    }}
    rows="1"
    placeholder={
      isUploading ? "Processing audio..." : isRecording ? "" : "Explore anything...." // 👈 Empty placeholder when recording
    }
  />

  {/* Voice Visualizer - Only show when recording and textarea is empty */}
  {isRecording && inputMessage.length === 0 && (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <VoiceVisualizer isRecording={true} />
    </div>
  )}

  {/* Processing Indicator */}
  {isUploading && inputMessage.length === 0 && (
    <div className="absolute top-3 left-3 flex items-center text-sm font-bold font-centurygothic text-black dark:text-white z-20 animate-pulse pointer-events-none">
      <svg
        className="w-4 h-4 mr-2 animate-spin"
        fill="none"
        viewBox="0 0 24 24">
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
      Transcribing...
    </div>
  )}
</div>

        {/* Buttons Section */}
        <div className="buttons flex justify-between  ">
          <div className="flex w-2/4 gap-2 md:gap-3 md:p-2 ">
            {/* Upload Button */}
            <div className="relative">
              <div
                className="cursor-pointer border-[0.5px] border-gray-800 dark:border-gray-300 rounded-full p-2 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  if (isGuest) return handleLoginPrompt();
                  fileInputRef.current.click();
                }}
                onMouseEnter={() => setShowUploadTooltip(true)}
                onMouseLeave={() => setShowUploadTooltip(false)}>
                <span className="md:block hidden">
                  <Paperclip size={16} />
                </span>
                <span className="block md:hidden">
                  <Paperclip size={12} />
                </span>
              </div>
              {showLoginPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                  <div className="relative w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-xl text-center text-black dark:text-white transition-all duration-300">
                    {/* Close Button */}
                    <button
                      onClick={() => setShowLoginPrompt(false)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      aria-label="Close">
                      <X className="w-5 h-5" />
                    </button>

                    {/* Heading */}
                    <h2 className="text-xl font-medium mb-2">
                      Sign in to continue
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Please log in or create an account to use this feature.
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-center gap-3 flex-wrap">
                      <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
                        Login / Sign Up
                      </button>
                      <button
                        onClick={() => setShowLoginPrompt(false)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm rounded-md text-gray-800 dark:text-white transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showUploadTooltip && (
                <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-1 md:px-2 py-1 text-[9px] md:text-xs text-white bg-zinc-900 rounded-lg shadow-md whitespace-nowrap">
                  Upload file
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                  border-l-[6px] border-l-transparent 
                  border-r-[6px] border-r-transparent 
                  border-t-[6px] border-t-zinc-900"
                  />
                </div>
              )}
            </div>

            {/* Mic Button */}
            {/* Mic Button */}
            <div className="relative">
              <div
                className={`cursor-pointer border-[0.5px] text-black dark:text-white border-gray-800 dark:border-gray-300 rounded-full p-2 
${
  isRecording
    ? "bg-red-500 animate-pulse text-white"
    : "hover:bg-gray-300 dark:hover:bg-gray-700"
} transition-all duration-300 ${!isGuest ? " " : ""}`}
                onClick={() => {
                  if (isGuest) {
                    handleLoginPrompt();
                    return;
                  }
                  // if (!isGuest) return; // Disable for logged-in users
                  isRecording ? stopRecording() : startRecording();
                }}
                onMouseEnter={() => setShowMicTooltip(true)}
                onMouseLeave={() => setShowMicTooltip(false)}>
                {/* {isRecording ? <MicOff size={16} /> : <Mic size={16} />} */}
                <span className="md:block hidden">
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}{" "}
                </span>

                <span className="block md:hidden">
                  {isRecording ? <MicOff size={12} /> : <Mic size={12} />}{" "}
                </span>
              </div>

           {showMicTooltip && (
  <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-900  rounded-lg shadow-md">
    {isRecording ? "Stop (Live)" : "Dictate"} {/* 👈 Show "Live" when recording */}
    <div
      className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
      border-l-[6px] border-l-transparent 
      border-r-[6px] border-r-transparent 
      border-t-[6px] border-t-zinc-900"
    />
  </div>
)}
            </div>
            {/* voice mode  */}
           <div className="voice-mode-section">
  <div className="relative voice-controls text-gray-800 dark:text-white">
    <button
      onMouseEnter={() => setvoiceTooltip(true)}
      onMouseLeave={() => setvoiceTooltip(false)}
      onClick={() => {
        if (isGuest) {
          handleLoginPrompt();
          return;
        }
        startVoiceMode();
      }}
      disabled={isVoiceMode || isProcessing}
      className={`btn-voice font-bold px-4 py-2 rounded-xl shadow-md transition-all duration-300 ${
        isVoiceMode
          ? "bg-red-600 text-white cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 text-white"
      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}>
      <span className="md:block hidden text-xs md:text-base items-center gap-2">
        <AudioLines size={20} />
      </span>
      <span className="block md:hidden text-xs md:text-base items-center gap-2">
        <AudioLines size={12} />
      </span>
      {voiceTooltip && (
        <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-900 rounded-lg shadow-md whitespace-nowrap">
          {isGuest
            ? "Login for Voice Mode"
            : isVoiceMode
            ? "Voice Active"
            : "Voice Mode"}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900" />
        </div>
      )}
    </button>
  </div>

  {/* SINGLE VOICE OVERLAY - PROPERLY RESPONSIVE */}
  {showVoiceOverlay && !isGuest && (
    <div className="fixed inset-0 z-[90] bg-gradient-to-t from-gray-900 via-gray-700 to-transparent backdrop-blur-lg text-white flex items-center justify-center shadow-2xl px-4 py-4">
      
      {/* MOBILE ONLY */}
      <div className="block  md:hidden w-full max-w-sm">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Mobile Animation */}
          <div className="w-20 h-20 relative">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 border-r-green-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="./logo.png"
                className="w-8 h-8 block dark:hidden"
                alt="Logo"
              />
              <img
                src="./q.png"
                className="w-8 h-8 hidden dark:block"
                alt="Logo"
              />
            </div>
          </div>

          {/* Mobile Status */}
          <div className="text-sm font-semibold text-center">
            {isProcessing && (
              <p className="text-yellow-400 animate-pulse">Initializing...</p>
            )}
            {isAISpeaking && (
              <p className="text-blue-400 animate-pulse">AI is responding...</p>
            )}
            {!isProcessing && !isAISpeaking && connectionStatus === "connected" && (
              <p className="text-green-400">Listening for speech...</p>
            )}
          </div>

          {/* Mobile Transcript */}
          <div className="w-full p-3 bg-black/40 rounded-lg backdrop-blur-sm border border-green-400/30">
            <p className="text-sm text-white min-h-[40px] break-words text-center">
              {voiceTranscript || "Listening for speech..."}
            </p>
          </div>

          {/* Mobile Stop Button */}
          <button
            onClick={stopVoiceMode}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full">
            🛑 Stop Voice
          </button>
        </div>
      </div>

      {/* DESKTOP ONLY */}
      <div className="hidden md:block w-full max-w-4xl">
        <div className="flex flex-col items-center justify-center gap-8">
          {/* Desktop Animation */}
          <div className="w-32 h-32 relative">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 border-r-green-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="./logo.png"
                className="w-12 h-12 block dark:hidden"
                alt="Logo"
              />
              <img
                src="./q.png"
                className="w-12 h-12 hidden dark:block"
                alt="Logo"
              />
            </div>
          </div>

          {/* Desktop Status */}
          <div className="text-lg font-semibold text-center">
            {isProcessing && (
              <p className="text-yellow-400 animate-pulse">Initializing voice mode...</p>
            )}
            {isAISpeaking && (
              <p className="text-blue-400 animate-pulse">AI is responding...</p>
            )}
            {!isProcessing && !isAISpeaking && connectionStatus === "connected" && (
              <p className="text-green-400">Listening for speech...</p>
            )}
          </div>

          {/* Desktop Transcript */}
          <div className="w-full max-w-2xl p-4 bg-black/40 rounded-lg backdrop-blur-sm border border-green-400/30">
            <p className="text-base text-white min-h-[60px] break-words text-center">
              {voiceTranscript || "Listening for speech..."}
            </p>
          </div>

          {/* Desktop Stop Button */}
          <button
            onClick={stopVoiceMode}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full">
            🛑 Stop Voice Mode
          </button>
        </div>
      </div>
    </div>
  )}
</div>



            {/* Hidden File Input */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-center items-center">
            <button
              onClick={handleSendMessage}
              className="ml-2 p-2 border border-blue-500 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
              disabled={loading}>
              {loading ? (
                // 🌀 Rotating icon while loading (disabled)
                <CirclePause className="w-5 h-5 animate-spin  text-white" />
              ) : (
                <>
                  {/* Show different size icons for responsive views */}
                  <span className="md:block hidden">
                    <Send size={16} />
                  </span>
                  <span className="block md:hidden">
                    <Send size={12} />
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="mx-auto text-gray-400 dark:text-gray-700 text-xs md:text-sm font-mono font-bold">
        AI generated content for reference only
      </p>
    {/* Live Transcript Overlay for Dictate Mode */}
{showLiveTranscript && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 max-w-lg w-full border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isRecording ? "Listening..." : "Processing..."}
          </h3>
        </div>
        
        {/* Close/Stop Button */}
        <button
          onClick={stopRecording}
          className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <X size={16} />
          )}
        </button>
      </div>

      {/* Live Transcript Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[150px] max-h-[300px] overflow-y-auto">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Live Transcript:
        </div>
        
        {/* 👈 NEW: Show full accumulated transcript */}
        <div className="text-base text-gray-800 dark:text-white leading-relaxed space-y-1">
          {/* Accumulated (Final) Transcript */}
          {accumulatedTranscript && (
            <div className="text-gray-800 dark:text-white">
              {accumulatedTranscript}
            </div>
          )}
          
          {/* Current (Interim) Transcript */}
          {liveTranscriptText && liveTranscriptText !== "Listening..." && liveTranscriptText !== "Processing..." && (
            <div className="text-blue-600 dark:text-blue-400 italic">
              {liveTranscriptText}
              {isRecording && (
                <span className="inline-block w-1 h-5 bg-blue-500 ml-1 animate-pulse"></span>
              )}
            </div>
          )}
          
          {/* Initial State */}
          {!accumulatedTranscript && (!liveTranscriptText || liveTranscriptText === "Listening...") && (
            <div className="italic text-gray-500 dark:text-gray-400">
              {liveTranscriptText || "Start speaking..."}
            </div>
          )}
          
          {/* Processing State */}
          {liveTranscriptText === "Processing..." && (
            <div className="italic text-yellow-600 dark:text-yellow-400">
              Processing final transcript...
            </div>
          )}
        </div>
        
        {/* Transcript Status */}
        <div className="mt-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            {accumulatedTranscript && (
              <span className="text-green-600 dark:text-green-400">✓ {accumulatedTranscript.split(' ').length} words captured</span>
            )}
          </div>
          <div>
            {liveTranscriptText && liveTranscriptText !== "Listening..." && liveTranscriptText !== "Processing..." && (
              <span className={isTranscriptFinal ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}>
                {isTranscriptFinal ? "✓ Final" : "⏳ Interim"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        {isRecording ? (
          <div>
            <div>Speak clearly into your microphone</div>
            <div className="mt-1 text-blue-600 dark:text-blue-400">Blue text shows current speech, black text is finalized</div>
          </div>
        ) : (
          "Finalizing transcription..."
        )}
      </div>

      {/* Audio Visualizer (Optional) */}
      {isRecording && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.div>
)}

  
    </div>
  );
};

export default ChatArea;
