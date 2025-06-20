import React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Mic,
  Copy,
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

const ChatArea = ({ isGuest }) => {
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
      files: files.map((f) => ({ name: f.name, type: f.type })),
    };
    dispatch(addMessage({ conversationId: conv_id, message: userMessage }));
    setLoading(true); // 🔐 Disable send button here
    setInputMessage("");
    setBotTyping(true);
    setFiles([]);

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
      // Update the user message in redux with the proper file metadata
      if (uploaded_file_metadata.length > 0) {
        // Update the message with file names from the backend
        dispatch(
          updateMessage({
            conversationId: finalConversationId,
            id: userMessage.id,
            files: uploaded_file_metadata,
          })
        );
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
                        streamData.error || "❌ Failed to get a response.",
                      isStreaming: false,
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

  // ✅ Remove selected file
  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
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

  // ✅ Call this to start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    recorderRef.current = RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm;codecs=opus",
      recorderType: RecordRTC.StereoAudioRecorder,
      timeSlice: 1000,
      ondataavailable: (blob) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(blob);
        }
      },
    });

    const token = localStorage.getItem("token");
    console.log("🎙️ Token:", token);
    socketRef.current = new WebSocket(`${WSS_BASE_URL}?token=${token}`);

    socketRef.current.onopen = () => {
      console.log("🎙️ Voice WebSocket connected");
      recorderRef.current.startRecording();
      setIsRecording(true);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "transcript") {
        const transcript = data.transcript;

        if (transcript) {
          console.log("📝 Live transcription:", transcript);

          if (voiceMode) {
            // Optional: live display or buffer — or just ignore for pure realtime AI
            setTranscriptBuffer(transcript);
          } else {
            // Dictation mode (untouched)
            setTranscriptBuffer((prev) => prev + " " + transcript + " ");
          }
        }
      }
    };

    socketRef.current.onclose = () => {
      console.log("🔌 WebSocket closed");
    };

    socketRef.current.onerror = (err) => {
      console.error("❌ WebSocket Error:", err);
    };
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      setIsUploading(true);
      setIsRecording(false);
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
            setInputMessage(""); // Ensure placeholder falls back to "Ask me anything..."
          }
        } catch (err) {
          console.error("⚠️ Upload or transcription error", err);
        } finally {
          setIsUploading(false);
          setTranscriptBuffer("");

          setVoiceMode(false); // reset
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



  return (
   <div className="flex flex-col w-full h-screen md:h-screen overflow-y-auto bg-white dark:bg-[#121212] transition-colors duration-300 fixed md:relative inset-0 md:inset-auto z-40 md:z-auto" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>

      <Navbar isGuest={isGuest} />
      {/* Chat Area starts */}
      <div
        ref={chatContainerRef}
        onWheel={handleUserScrollInterruption} // Detect mouse wheel
        onTouchMove={handleUserScrollInterruption} // Detect touch scroll
       className=" relative flex-1 h-[calc(100dvh-120px)] md:h-[calc(100vh-160px)] w-full scrollbar-hover md:p-4 mt-16 md:mt-0 space-y-6 overflow-auto mx-auto bg-white dark:bg-[#121212] transition-colors duration-300"

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
            value={inputMessage + (isRecording ? transcriptBuffer : "")}
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
              isUploading ? "" : isRecording ? "" : "Explore anything...."
            }
          />

          {/* Voice Visualizer */}
          {isRecording &&
            inputMessage.length === 0 &&
            transcriptBuffer.length === 0 && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <VoiceVisualizer isRecording={true} />
              </div>
            )}
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
                  {isRecording ? "Stop" : "Dictate"}
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
                    // ✅ Add guest check here - same as mic button
                    if (isGuest) {
                      handleLoginPrompt();
                      return;
                    }
                     if (!isGuest) {
          return; // Do nothing for logged-in users
        }
                    startVoiceMode();
                  }}
                  disabled={isVoiceMode || isProcessing }
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
                      {!isGuest
  ? "Coming Soon" // ✅ Check logged-in users FIRST
  : isGuest
  ? "Login for Voice Mode" 
                        : isVoiceMode
                        ? "Voice Active"
                        : "Voice Mode"}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900" />
                    </div>
                  )}
                </button>
              </div>

              {/* Professional Voice Overlay - Custom Layout */}
              {showVoiceOverlay && !isGuest && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="fixed bottom-0 left-0 right-0 w-screen h-screen md:h-full  md:transform md:-translate-x-1/2 md:w-screen bg-gradient-to-t from-gray-900 via-gray-700 to-transparent backdrop-blur-lg rounded-t-2xl md:rounded-2xl text-white z-50 flex flex-col md:flex-row items-center justify-center shadow-2xl px-4 md:px-6 py-4">
                  {/* MOBILE LAYOUT: Vertical Stack */}
                  <div className="flex flex-col md:hidden items-center justify-center gap-4 w-full">
                    {/* 1. Rotating Green Animation */}
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 border-r-green-400 rotating-border"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-green-300 border-l-green-300 rotating-border-reverse"></div>
                        <div className="absolute inset-4 rounded-full bg-green-400/20 pulsing-glow"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className={`transition-all duration-300 ${
                              isAISpeaking ? "animate-bounce" : "animate-pulse"
                            }`}>
                            <img
                              src="./logo.png"
                              className="w-6 h-6 block dark:hidden"
                              alt="Logo"
                            />
                            <img
                              src="./q.png"
                              className="w-6 h-6 hidden dark:block"
                              alt="Logo"
                            />
                          </div>
                        </div>
                        {/* Bigger and darker ripples */}
                        <div className="absolute -inset-4 rounded-full border-2 border-green-500/60 animate-ping"></div>
                        <div className="absolute -inset-8 rounded-full border-2 border-green-600/50 animate-ping animation-delay-300"></div>
                        <div className="absolute -inset-12 rounded-full border border-green-700/40 animate-ping animation-delay-600"></div>
                      </div>
                    </div>

                    {/* 2. Status Display */}
                    <div className="text-sm font-semibold text-center">
                      {isProcessing && (
                        <p className="text-yellow-400 animate-pulse flex items-center gap-2 justify-center">
                          <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce status-dot"></span>
                          Initializing voice mode...
                        </p>
                      )}
                      {isAISpeaking && (
                        <p className="text-blue-400 animate-pulse flex items-center gap-2 justify-center">
                          <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce status-dot"></span>
                          AI is responding...
                        </p>
                      )}
                      {!isProcessing &&
                        !isAISpeaking &&
                        connectionStatus === "connected" && (
                          <p className="text-green-400 flex items-center gap-2 justify-center">
                            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse status-dot"></span>
                            Listening for speech...
                          </p>
                        )}
                      <div className="text-xs mt-1 flex items-center gap-1 justify-center">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            connectionStatus === "connected"
                              ? "bg-green-400 connection-pulse"
                              : "bg-red-400"
                          }`}></span>
                        <span className="text-gray-400">
                          {connectionStatus === "connected"
                            ? "Connected"
                            : "Disconnected"}
                        </span>
                      </div>
                    </div>

                    {/* 3. Live Transcript */}
                    <div className="w-full max-w-sm">
                      <div className="p-3  flex flex-col items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm border border-green-400/30 transcript-glow">
                        <div className="text-xs text-green-300 mb-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                          Live Transcript:
                        </div>
                        <p className="text-sm text-white min-h-[40px] break-words">
                          {voiceTranscript || "Listening for speech..."}
                        </p>
                      </div>
                    </div>

                    {/* 4. Stop Button */}
                    <button
                      disabled={!socketOpen}
                      onClick={() => {
                        console.log("🖱️ Stop button clicked");
                        stopVoiceMode();
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 min-w-[120px] justify-center relative overflow-hidden text-sm">
                      <span className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></span>
                      <span className="relative z-10 flex items-center gap-2">
                        <span>🛑</span>
                        Stop Voice
                      </span>
                    </button>
                  </div>

                  {/* DESKTOP LAYOUT: Horizontal */}
                  <div className="hidden md:flex md:flex-col items-center justify-center gap-5 w-full max-w-4xl">
                    {/* 1. Rotating Green Animation and Status Display (Top) */}
                    <div className="flex flex-col gap-10  mt-32">
                      <div className="flex items-center justify-center">
                        <div className="w-40 h-40 relative">
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 border-r-green-400 rotating-border"></div>
                          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-green-300 border-l-green-300 rotating-border-reverse"></div>
                          <div className="absolute inset-4 rounded-full bg-green-400/20 pulsing-glow"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`transition-all duration-300 ${
                                isAISpeaking
                                  ? "animate-bounce"
                                  : "animate-pulse"
                              }`}>
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
                            </div>
                          </div>
                          <div className="absolute -inset-2 rounded-full border border-green-400/30 animate-ping"></div>
                          <div className="absolute -inset-4 rounded-full border border-green-400/20 animate-ping animation-delay-300"></div>
                        </div>
                      </div>
                      {/* Status Display (Top) */}
                      <div className="text-sm font-semibold text-center">
                        {isProcessing && (
                          <p className="text-yellow-400 animate-pulse flex items-center gap-2 justify-center">
                            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce status-dot"></span>
                            Initializing voice mode...
                          </p>
                        )}
                        {isAISpeaking && (
                          <p className="text-blue-400 animate-pulse flex items-center gap-2 justify-center">
                            <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce status-dot"></span>
                            AI is responding...
                          </p>
                        )}
                        {!isProcessing &&
                          !isAISpeaking &&
                          connectionStatus === "connected" && (
                            <p className="text-green-400 flex items-center gap-2 justify-center">
                              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse status-dot"></span>
                              Listening for speech...
                            </p>
                          )}
                        <div className="text-xs mt-1 flex items-center gap-1 justify-center">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              connectionStatus === "connected"
                                ? "bg-green-400 connection-pulse"
                                : "bg-red-400"
                            }`}></span>
                          <span className="text-gray-400">
                            {connectionStatus === "connected"
                              ? "Connected"
                              : "Disconnected"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* 2. Status + Live Transcript Div */}
                    <div className="flex flex-col items-center justify-center p-10  gap-5 w-full  ">
                      {/* Live Transcript (Bottom) */}
                      <div className="w-full">
                        <div className="p-3 flex flex-col items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm border border-green-400/30 transcript-glow">
                          <div className="text-xs text-green-300 mb-1 flex items-center  gap-1">
                            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                            Live Speech
                          </div>
                          <p className="text-sm text-white min-h-[40px] break-words">
                            {voiceTranscript || "Listening for speech..."}
                          </p>
                        </div>
                      </div>
                      {/* 3. Stop Button + WebSocket Status Div */}
                      <div className="flex flex-col gap-4 items-center">
                        {/* WebSocket Status */}
                        <div className="text-xs text-gray-400 bg-black/20 rounded-lg p-2 space-y-1">
                          <div className="flex justify-between gap-4">
                            <span>Status:</span>
                            <span
                              className={
                                connectionStatus === "connected"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }>
                              {connectionStatus === "connected"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span>Audio Stream:</span>
                            <span
                              className={
                                isVoiceMode ? "text-green-400" : "text-red-400"
                              }>
                              {isVoiceMode ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        {/* Stop Button */}
                        <button
                          disabled={!socketOpen}
                          onClick={() => {
                            console.log("🖱️ Stop button clicked");
                            stopVoiceMode();
                          }}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 min-w-[140px] justify-center relative overflow-hidden">
                          <span className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></span>
                          <span className="relative z-10 flex items-center gap-2">
                            <span>🛑</span>
                            <span>Stop Voice</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
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
      {/* Tailwind Typing Animation */}
      <style>
        {`
/* ✅ Voice Mode Ripple Animations */
.ripple-wave {
  animation: rippleWave 2s ease-in-out infinite;
}

@keyframes rippleWave {
  0% {
    transform: translateX(-100%) skewX(-15deg);
    opacity: 0;
  }
  50% {
    transform: translateX(0%) skewX(-15deg);
    opacity: 1;
  }
  100% {
    transform: translateX(100%) skewX(-15deg);
    opacity: 0;
  }
}

.processing-pulse {
  animation: processingPulse 1.5s ease-in-out infinite;
}

@keyframes processingPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

.hover-ripple {
  animation: hoverRipple 2s ease-out infinite;
}

@keyframes hoverRipple {
  0% {
    transform: translateX(-100%) rotate(45deg);
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(100%) rotate(45deg);
    opacity: 0;
  }
}

/* Voice Active State */
.voice-active {
  box-shadow: 
    0 0 0 0 rgba(239, 68, 68, 0.7),
    0 0 0 10px rgba(239, 68, 68, 0.3),
    0 0 0 20px rgba(239, 68, 68, 0.1);
  animation: voiceActivePulse 2s infinite;
}

@keyframes voiceActivePulse {
  0% {
    box-shadow: 
      0 0 0 0 rgba(239, 68, 68, 0.7),
      0 0 0 10px rgba(239, 68, 68, 0.3),
      0 0 0 20px rgba(239, 68, 68, 0.1);
  }
  70% {
    box-shadow: 
      0 0 0 10px rgba(239, 68, 68, 0),
      0 0 0 20px rgba(239, 68, 68, 0),
      0 0 0 40px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 
      0 0 0 0 rgba(239, 68, 68, 0),
      0 0 0 10px rgba(239, 68, 68, 0),
      0 0 0 20px rgba(239, 68, 68, 0);
  }
}

/* Processing State */
.processing-state {
  box-shadow: 
    0 0 0 0 rgba(251, 191, 36, 0.7),
    0 0 0 8px rgba(251, 191, 36, 0.3);
  animation: processingStatePulse 1.5s infinite;
}

@keyframes processingStatePulse {
  0%, 100% {
    box-shadow: 
      0 0 0 0 rgba(251, 191, 36, 0.7),
      0 0 0 8px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 
      0 0 0 8px rgba(251, 191, 36, 0),
      0 0 0 16px rgba(251, 191, 36, 0);
  }
}

/* Click Ripple Effect */
.btn-voice-ripple:active::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  animation: clickRipple 0.6s ease-out;
  z-index: 10;
}

@keyframes clickRipple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

/* Status Dots */
.status-dot {
  box-shadow: 0 0 10px currentColor;
  animation: statusDotPulse 2s infinite;
}

@keyframes statusDotPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 20px currentColor;
  }
}

/* Connection Pulse */
.connection-pulse {
  animation: connectionPulse 2s infinite;
}

@keyframes connectionPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}

/* Stop Button Ripple */
.stop-pulse {
  animation: stopPulse 2s infinite;
}

@keyframes stopPulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

/* Transcript Glow */
.transcript-glow {
  animation: transcriptGlow 3s infinite;
}

@keyframes transcriptGlow {
  0%, 100% {
    border-color: rgba(34, 197, 94, 0.3);
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
  }
  50% {
    border-color: rgba(34, 197, 94, 0.6);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  }
}

/* ✅ Rotating Green Animation */
.rotating-border {
  animation: rotateBorder 2s linear infinite;
}

.rotating-border-reverse {
  animation: rotateBorderReverse 3s linear infinite;
}

.pulsing-glow {
  animation: pulsingGlow 2s ease-in-out infinite;
}

@keyframes rotateBorder {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotateBorderReverse {
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes pulsingGlow {
  0%, 100% {
    background-color: rgba(34, 197, 94, 0.2);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
    transform: scale(1);
  }
  50% {
    background-color: rgba(34, 197, 94, 0.4);
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
    transform: scale(1.1);
  }
}

/* Animation delay for ripple effects */
.animation-delay-300 {
  animation-delay: 0.3s;
}

/* Status Dots */
.status-dot {
  box-shadow: 0 0 10px currentColor;
  animation: statusDotPulse 2s infinite;
}

@keyframes statusDotPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 20px currentColor;
  }
}

/* Connection Pulse */
.connection-pulse {
  animation: connectionPulse 2s infinite;
}

@keyframes connectionPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}

/* Transcript Glow */
.transcript-glow {
  animation: transcriptGlow 3s infinite;
}

@keyframes transcriptGlow {
  0%, 100% {
    border-color: rgba(34, 197, 94, 0.3);
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
  }
  50% {
    border-color: rgba(34, 197, 94, 0.6);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  }
}

/* Add these professional animations to your existing styles */
@keyframes wave1 {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}

@keyframes wave2 {
  0%, 100% { height: 8px; }
  50% { height: 20px; }
}

@keyframes wave3 {
  0%, 100% { height: 6px; }
  50% { height: 12px; }
}

@keyframes wave4 {
  0%, 100% { height: 10px; }
  50% { height: 18px; }
}

@keyframes professionalPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes statusGlow {
  0%, 100% { 
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  50% { 
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4);
  }
}

.animate-wave1 { animation: wave1 0.8s infinite ease-in-out; }
.animate-wave2 { animation: wave2 0.8s infinite ease-in-out 0.1s; }
.animate-wave3 { animation: wave3 0.8s infinite ease-in-out 0.2s; }
.animate-wave4 { animation: wave4 0.8s infinite ease-in-out 0.3s; }

.animate-professional-pulse {
  animation: professionalPulse 2s infinite;
}

.animate-status-glow {
  animation: statusGlow 2s infinite;
}

/* Professional voice mode transitions */
.voice-mode-enter {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.voice-mode-enter-active {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.voice-mode-exit {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.voice-mode-exit-active {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Professional status indicator */
.status-indicator {
  position: relative;
  overflow: hidden;
}

.status-indicator::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.status-indicator:hover::before {
  left: 100%;
}



        @keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-bounce-slow {
  animation: bounce-slow 1.2s infinite;
}

.drop-shadow-glow {
  filter: drop-shadow(0 0 5px rgba(59,130,246,0.7));
}

  /* Typing Animation */
  @keyframes typingDots {
    0%, 20% {
      content: '';
    }
    40% {
      content: '.';
    }
    60% {
      content: '..';
    }
    80%, 100% {
      content: '...';
    }
  }

  .animate-typingDots::after {
  display: inline-block;
  content: '...';
  animation: typingDots 1.5s steps(4, end) infinite;
  font-size: 1.5rem; /* Increase size */
  font-weight: bold; /* Make it bold */
  line-height: 1;
}


  // .animate-typingDots::after {
  //   display: inline-block;
  //   content: '';
  //   animation: typingDots 1.5s steps(4, end) infinite;
  // }
 /* Customize scrollbar with minimal darker colors */
  ::-webkit-scrollbar {
    width: 11px;
    height: 11px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
    transition: all 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #374151;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }

  /* Dark mode scrollbar - fixed width */
  .dark ::-webkit-scrollbar {
    width: 11px;
    height: 11px;
  }

  .dark ::-webkit-scrollbar-thumb {
    background-color: #4b5563;
  }

  .dark ::-webkit-scrollbar-thumb:hover {
    background-color: #374151;
  }

  .dark ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Hide scrollbar for textarea */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

@keyframes wave1 {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}

@keyframes wave2 {
  0%, 100% { height: 40%; }
  50% { height: 90%; }
}

@keyframes wave3 {
  0%, 100% { height: 60%; }
  50% { height: 70%; }
}

@keyframes wave4 {
  0%, 100% { height: 30%; }
  50% { height: 80%; }
}

.animate-wave1 {
  animation: wave1 1s infinite ease-in-out;
}

.animate-wave2 {
  animation: wave2 1s infinite ease-in-out;
}

.animate-wave3 {
  animation: wave3 1s infinite ease-in-out;
}

.animate-wave4 {
  animation: wave4 1s infinite ease-in-out;
}

// voice part 

.voice-assistant {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: #e5e7eb;
  font-size: 0.875rem;
}

.status-badge.recording {
  background-color: #ef4444;
  color: white;
  animation: pulse 1.5s infinite;
}

.interim-transcript {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  max-height: 100px;
  overflow-y: auto;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes botWalk {
  0% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
}

.animate-walkingBot {
  animation: botWalk 0.8s infinite;
}

// greeting animation blinker 
.blinker {
  display: inline-block;
  width: 1ch;
  animation: blink 1s step-start infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

//realtime ai animation

.btn-start {
  @apply px-4 py-2 bg-green-600 text-white rounded-xl shadow-md;
}

.btn-stop {
  @apply px-4 py-2 bg-red-600 text-white rounded-xl shadow-md;
}
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes typingDots {
  0% {
    content: '';
  }
  33% {
    content: '.';
  }
  66% {
    content: '..';
  }
  100% {
    content: '...';
  }
}

.animate-float {
  animation: float 2s ease-in-out infinite;
}

.animate-typingDots::after {
  content: '';
  animation: typingDots 1s steps(3, end) infinite;
}

// response select css 
.select-text {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

.select-none {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}
// double-click select text 





`}
      </style>
    </div>
  );
};

export default ChatArea;
