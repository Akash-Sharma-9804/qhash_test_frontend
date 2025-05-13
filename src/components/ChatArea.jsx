import React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Send,
  Mic,
  Copy,
  MicOff,
  CircleUserRound,
  Paperclip,
  X,
  Speech,
  AudioLines,
  ArrowDown,
  CircleArrowDown,
  Sparkles,
} from "lucide-react";
//
// import { FaMicrophone, FaStop, FaPlayCircle } from 'react-icons/fa';
// import { IoClose } from 'react-icons/io5';
import { motion } from "framer-motion";
import VoiceVisualizer from "./VoiceVisualizer";
import RecordRTC from "recordrtc";
import Navbar from "./Navbar";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { streamAudio } from "../utils/streamAudio";
// import { useSelector, useDispatch } from "react-redux";
import ChatbotMarkdown from "./ChatbotMarkdown";
import {
  fetchConversationHistory,
  sendMessage,
  uploadFiles,
  fetchConversations,
  uploadFinalAudio,
} from "../api_Routes/api";
import {
  setMessages,
  addMessage,
  setActiveConversation,
  updateMessage,
  renameConversationRedux,
  setConversations,
  addConversation,
  removeMessage,
} from "../store/chatSlice2";
import { toast } from "react-toastify";
import MessageFiles from "./MessageFiles";
import { v4 as uuidv4 } from "uuid";
// import AudioVisualizer from 'react-audio-visualize';
import RadialVisualizer from "./RadialVisualizer";
import { FaMicrophone, FaStop, FaPause, FaPlay } from "react-icons/fa";
const ChatArea = () => {
  const [loading, setLoading] = useState(false);
  const [botTyping, setBotTyping] = useState("");
  const [greeting, setGreeting] = useState("");
  const chatEndRef = useRef(null);

  // greeting text
  const [showGreeting, setShowGreeting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

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

  const conversations = useSelector((state) => state.chat.conversations);

  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");

  const [isUploading, setIsUploading] = useState(false); // For final transcription

  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

  // scroll button prop
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  

  // const API_BASE_URL = "https://quantumhash-backend-1.onrender.com/api"; // Replace with your backend URL

  const WSS_BASE_URL = import.meta.env.VITE_WSS_API_BASE_URL;

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
        console.log("Fetched history:", data.history);
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

  const conversationMessages = messages[activeConversation] || [];

  // greeting text function starts

  // const generateGreeting = () => {
  //   const greetingText = " Hacking the Quantum, no limits!....";
  //   let index = 0;
  //   let typedText = "";

  //   const interval = setInterval(() => {
  //     if (index < greetingText.length) {
  //       typedText += greetingText[index];
  //       setGreeting(typedText);
  //       index++;
  //     } else {
  //       clearInterval(interval);
  //       setGreeting(greetingText); // Keep the full greeting
  //     }
  //   }, 60);
  // };
  // test
  // const generateGreeting = () => {
  //   const greetingOptions = [
  //     "Explore Like Never Before. The Quantum Way!!!",
  //     "Say Hello to the Quantum Future",
  //     "I'm QuantumAI, bringing intelligence to the conversation.",
  //   ];

  //   const selectedGreeting =
  //     greetingOptions[Math.floor(Math.random() * greetingOptions.length)];

  //   let index = 0;
  //   let typedText = "";

  //   const interval = setInterval(() => {
  //     if (index < selectedGreeting.length) {
  //       typedText += selectedGreeting[index];
  //       setGreeting(typedText + '<span class="blinker">|</span>');
  //       index++;
  //     } else {
  //       clearInterval(interval);
  //       setGreeting(selectedGreeting + '<span class="blinker">|</span>');
  //     }
  //   }, 60);
  // };
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
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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

  // greeting text function ends

  // 5th useeffect
  // useEffect(() => {
  //   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, botTyping]);

  // 5th useEffect - Scroll to bottom when messages update or bot is typing
  useEffect(() => {
    const messagesForConversation = messages[activeConversation];

    if (!messagesForConversation || messagesForConversation.length === 0)
      return;

    const scrollToBottom = () => {
      // Wait for DOM to update first
      setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
          console.log("Scrolled to bottom after switching conversation.");
        }
      }, 100); // 100ms gives React time to render
    };

    scrollToBottom();
  }, [activeConversation, messages[activeConversation]?.length]);

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

  // working handlesend message function starts

  // const handleSendMessage = async () => {
  //   if (!inputMessage.trim() && files.length === 0) return;

  //   const token = localStorage.getItem("token");
  //   const user_id = user?.user_id || localStorage.getItem("user_id");
  //   const conv_id =
  //     activeConversation || localStorage.getItem("conversation_id");

  //   textareaRef.current.style.height = "44px";

  //   if (!token) {
  //     console.error("🚨 Missing token.");
  //     return;
  //   }

  //   if (!user_id) {
  //     console.error("🚨 Missing user_id.");
  //     return;
  //   }

  //   // ✅ 1. Prepare user message text (without appending file names - we'll show them separately)
  //   const plainText = inputMessage.trim();

  //   // Create user message without embedding file names in the text
  //   const userMessage = {
  //     id: Date.now(),
  //     message: plainText,
  //     sender: "user",
  //     files: files.map((f) => ({ name: f.name, type: f.type })),
  //   };

  //   const initialConvId = conv_id || "temp";
  //   dispatch(
  //     addMessage({ conversationId: initialConvId, message: userMessage })
  //   );

  //   setInputMessage("");
  //   setBotTyping(true);
  //   setFiles([]);
  //   try {
  //     // ✅ 2. Prepare FormData for upload
  //     const formData = new FormData();
  //     if (plainText) formData.append("message", plainText);
  //     formData.append("user_id", user_id);
  //     if (conv_id) formData.append("conversation_id", conv_id);
  //     files.forEach((file) => {
  //       formData.append("files", file);
  //     });

  //     // ✅ 3. Upload files
  //     const uploadResponse = await uploadFiles(formData, token, (event) => {
  //       const percent = Math.round((event.loaded * 100) / event.total);
  //       const progressMap = {};
  //       files.forEach((file) => {
  //         progressMap[file.name] = percent;
  //       });
  //       setUploadProgress(progressMap);
  //     });

  //     const finalConversationId =
  //       uploadResponse?.data?.conversation_id ||
  //       uploadResponse?.conversation_id;

  //     if (!activeConversation && finalConversationId) {
  //       dispatch(setActiveConversation(finalConversationId));
  //     }

  //     // ✅ 4. Extract metadata to send to chatbot
  //     const uploaded_file_metadata = uploadResponse?.data?.files || [];

  //     // Update the user message in redux with the proper file metadata
  //     if (uploaded_file_metadata.length > 0) {
  //       // Update the message with file names from the backend
  //       dispatch(
  //         updateMessage({
  //           conversationId: finalConversationId || initialConvId,
  //           id: userMessage.id,
  //           files: uploaded_file_metadata,
  //         })
  //       );
  //     }

  //     // ✅ 5. Send message to chatbot if there's a user message
  //     if (plainText || files.length > 0) {
  //       const chatRes = await sendMessage(
  //         finalConversationId,
  //         plainText,
  //         user_id,
  //         token,
  //         uploadResponse?.data?.extracted_summary_raw,
  //         uploaded_file_metadata
  //       );

  //       const aiResponse = chatRes?.response || "🧠 No AI response received.";
  //       const responseFiles = chatRes?.files || [];

  //       const botMessage = {
  //         id: Date.now() + 1,
  //         message: aiResponse,
  //         sender: "bot",
  //         response: aiResponse,
  //         files: responseFiles,
  //       };

  //       dispatch(
  //         addMessage({
  //           conversationId: finalConversationId,
  //           message: botMessage,
  //         })
  //       );

  //       // ✅ stop typing immediately after bot response is added
  //       setBotTyping(false);

  //       // ✅ 6. Rename is handled by the backend — now refresh conversations list in Sidebar
  //       const updatedConversations = await fetchConversations(token);
  //       dispatch(setConversations(updatedConversations?.conversations || []));

  //       // ✅ 7. Fetch updated conversation list after rename
  //       const currentConv = conversations.find(
  //         (c) => c.id === finalConversationId
  //       );
  //       if (currentConv?.name === "New Conversation") {
  //         const updatedData = await fetchConversations(token);
  //         if (updatedData?.conversations) {
  //           dispatch(setConversations(updatedData.conversations));
  //           const currentId = localStorage.getItem("conversation_id");
  //           if (currentId) {
  //             dispatch(setActiveConversation(Number(currentId)));
  //           }
  //         }
  //       }
  //     } else if (files.length > 0) {
  //       // ✅ 8. No user message, only files
  //       toast.info(
  //         uploadResponse?.data?.extracted_summary ||
  //           "🧠 Files received, but no text was extractable.",
  //         { position: "bottom-right" }
  //       );
  //       setBotTyping(false); // ✅ stop here too
  //     }
  //   } catch (error) {
  //     console.error("❌ Error sending message:", error);
  //     dispatch(
  //       addMessage({
  //         conversationId: conv_id,
  //         message: {
  //           id: Date.now() + 1,
  //           message: "❌ Failed to get a response.",
  //           sender: "bot",
  //           response: "❌ Failed to get a response.",
  //         },
  //       })
  //     );
  //     toast.error("❌ Message or file upload failed.");
  //     setBotTyping(false); // ✅ also stop here in error
  //   } finally {
  //     // ✅ 9. Cleanup

  //     setUploadProgress({});
  //   }
  // };

  // test
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && files.length === 0) return;

    const token = localStorage.getItem("token");
    const user_id = user?.user_id || localStorage.getItem("user_id");
    const conv_id =
      activeConversation || localStorage.getItem("conversation_id");

    textareaRef.current.style.height = "44px";

    if (!token) {
      console.error("🚨 Missing token.");
      return;
    }

    if (!user_id) {
      console.error("🚨 Missing user_id.");
      return;
    }

    // ✅ 1. Prepare user message text (without appending file names - we'll show them separately)
    const plainText = inputMessage.trim();

    // Create user message without embedding file names in the text
    const userMessage = {
      id: Date.now(),
      message: plainText,
      sender: "user",
      files: files.map((f) => ({ name: f.name, type: f.type })),
    };

    dispatch(addMessage({ conversationId: conv_id, message: userMessage }));

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

      // ✅ 5. Send message to chatbot if there's a user message
      if (plainText || files.length > 0) {
        const chatRes = await sendMessage(
          finalConversationId,
          plainText,
          user_id,
          token,
          uploadResponse?.data?.extracted_summary_raw,
          uploaded_file_metadata
        );

        const aiResponse = chatRes?.response || "🧠 No AI response received.";
        const responseFiles = chatRes?.files || [];

        const botMessage = {
          id: Date.now() + 1,
          message: aiResponse,
          sender: "bot",
          response: aiResponse,
          files: responseFiles,
        };

        dispatch(
          addMessage({
            conversationId: finalConversationId,
            message: botMessage,
          })
        );

        // ✅ stop typing immediately after bot response is added
        setBotTyping(false);

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
    } finally {
      // ✅ 9. Cleanup
      setUploadProgress({});
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

  // textarea animation
  const canvasRef = useRef(null);

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
    socketRef.current = new WebSocket(`${WSS_BASE_URL}`);

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

  // voice mode realtime AI
  //   const SILENCE_TIMEOUT_MS = 3000; // shorter silence timeout for quicker interaction
  //   const STOP_DELAY_MS = 200;
  //   const AUDIO_CHUNK_MS = 500;

  //   const [isProcessing, setIsProcessing] = useState(false);
  //   const [isResponding, setIsResponding] = useState(false);

  //   const mediaRecorderRef = useRef(null);
  //   const audioStreamRef = useRef(null);
  //   const voiceWsRef = useRef(null);
  //   const silenceTimerRef = useRef(null);
  //   const isSilenceDetectedRef = useRef(false);

  //   const blobToBase64 = (blob) => {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const base64data = reader.result.split(",")[1];
  //         resolve(base64data);
  //       };
  //       reader.onerror = reject;
  //       reader.readAsDataURL(blob);
  //     });
  //   };

  //   useEffect(() => {
  //     return () => {
  //       stopAivoice();
  //     };
  //   }, []);

  //   const startAivoice = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         console.error("No token found");
  //         return;
  //       }

  //       if (voiceWsRef.current) {
  //         stopMicrophoneStream();
  //         voiceWsRef.current.close();
  //       }

  //       voiceWsRef.current = new WebSocket(
  //         `ws://localhost:5001/api/voice/ws?token=${token}`
  //       );
  //       voiceWsRef.current.binaryType = "arraybuffer";

  //       voiceWsRef.current.onopen = () => {
  //         console.log("✅ Voice WebSocket connected");
  //         startMicrophoneStream();
  //       };

  //       voiceWsRef.current.onmessage = (event) => {
  //         const data = JSON.parse(event.data);

  //         if (data.type === "interim") {
  //           console.log("📝 Interim:", data.transcript);
  //         } else if (data.type === "processing") {
  //           console.log("⚙️ Processing AI response...");
  //           setIsProcessing(true);
  //         } else if (data.type === "userMessage") {
  //           dispatch(
  //             addMessage({
  //               conversation_id: data.conversation_id,
  //               sender: "user",
  //               text: data.message,
  //               audioUrl: data.audioUrl,
  //             })
  //           );
  //           console.log("📤 User message:", data.message);
  //         } else if (data.type === "aiMessage") {
  //           console.log("🤖 AI response:", data.message);
  //           dispatch(
  //             addMessage({
  //               conversation_id: data.conversation_id,
  //               sender: "ai",
  //               text: data.message,
  //             })
  //           );
  //           playTTS(data.message);
  //           setIsResponding(false);
  //           setIsProcessing(false);

  //           console.log("🔄 Restarting microphone...");
  //           startMicrophoneStream();
  //         } else if (data.type === "conversation_created") {
  //           console.log("🆕 New conversation:", data.conversation_id);
  //         } else if (data.type === "error") {
  //           console.error("🚨 Server error:", data.error);
  //           stopAivoice();
  //         }
  //       };

  //       voiceWsRef.current.onclose = () => {
  //         console.log("❌ Voice WebSocket closed");
  //         stopMicrophoneStream();
  //       };

  //       voiceWsRef.current.onerror = (err) => {
  //         console.error("🚨 Voice WebSocket error:", err);
  //         stopAivoice();
  //       };
  //     } catch (error) {
  //       console.error("Failed to start AI voice mode:", error);
  //     }
  //   };

  //   const stopAivoice = () => {
  //     if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  //     stopMicrophoneStream();

  //     if (voiceWsRef.current) {
  //       try {
  //         if (voiceWsRef.current.readyState === WebSocket.OPEN) {
  //           voiceWsRef.current.send(
  //             JSON.stringify({ type: "control", action: "stop" })
  //           );
  //         }
  //         voiceWsRef.current.close();
  //       } catch (err) {
  //         console.error("Error closing WebSocket:", err);
  //       }
  //       voiceWsRef.current = null;
  //     }

  //     setAiRecording(false);
  //     setIsProcessing(false);
  //     setIsResponding(false);
  //     isSilenceDetectedRef.current = false;

  //     console.log("🛑 Stopped AI voice mode");
  //   };

  //   const startMicrophoneStream = async () => {
  //     try {
  //       if (isResponding || isSilenceDetectedRef.current) return;

  //       if (audioStreamRef.current || mediaRecorderRef.current) {
  //         stopMicrophoneStream();
  //       }

  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       audioStreamRef.current = stream;

  //       const mediaRecorder = new MediaRecorder(stream, {
  //         mimeType: "audio/webm;codecs=opus",
  //       });
  //       mediaRecorderRef.current = mediaRecorder;

  //       mediaRecorder.ondataavailable = async (event) => {
  //         if (
  //           voiceWsRef.current &&
  //           voiceWsRef.current.readyState === WebSocket.OPEN &&
  //           !isSilenceDetectedRef.current
  //         ) {
  //           const base64Audio = await blobToBase64(event.data);

  // voiceWsRef.current.send(
  //   JSON.stringify({
  //     type: "transcribe",
  //     audio_data: base64Audio,
  //   })
  // );

  // console.log("📤 Sent base64 audio chunk");
  // resetSilenceTimer();

  //         }
  //       };

  //       mediaRecorder.start(AUDIO_CHUNK_MS);

  //       setAiRecording(true);
  //       isSilenceDetectedRef.current = false;
  //       console.log("🎙️ Microphone recording started");
  //     } catch (err) {
  //       console.error("Could not start microphone:", err);
  //     }
  //   };

  //   const stopMicrophoneStream = () => {
  //     if (mediaRecorderRef.current) {
  //       try {
  //         if (mediaRecorderRef.current.state !== "inactive") {
  //           mediaRecorderRef.current.stop();
  //           console.log("🎤 Microphone stopped");
  //         }
  //       } catch (err) {
  //         console.error("Error stopping media recorder:", err);
  //       }
  //       mediaRecorderRef.current = null;
  //     }

  //     if (audioStreamRef.current) {
  //       audioStreamRef.current.getTracks().forEach((track) => track.stop());
  //       audioStreamRef.current = null;
  //     }
  //   };

  //   const resetSilenceTimer = () => {
  //     if (isResponding) return;

  //     if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

  //     silenceTimerRef.current = setTimeout(() => {
  //       if (
  //         voiceWsRef.current &&
  //         voiceWsRef.current.readyState === WebSocket.OPEN
  //       ) {
  //         console.log("🤫 Silence detected, sending stop signal...");
  //         isSilenceDetectedRef.current = true;
  //         voiceWsRef.current.send(
  //           JSON.stringify({ type: "control", action: "stop" })
  //         );

  //         setTimeout(() => {
  //           stopMicrophoneStream();
  //           setIsResponding(true);
  //         }, STOP_DELAY_MS);
  //       }
  //     }, SILENCE_TIMEOUT_MS);
  //   };

  //   const playTTS = (text) => {
  //     const utterance = new SpeechSynthesisUtterance(text);
  //     utterance.lang = "en-US";
  //     speechSynthesis.speak(utterance);
  //     console.log("🔊 Speaking AI response...");
  //   };

  // working part 08/05/2025

  // const [isliveRecording, setIsliveRecording] = useState(false);
  //   const [isProcessing, setIsProcessing] = useState(false);
  //   const [isResponding, setIsResponding] = useState(false);

  //   const mediaRecorderRef = useRef(null);
  //   const audioStreamRef = useRef(null);
  //   const voiceWsRef = useRef(null);
  //   const silenceTimerRef = useRef(null);
  //   const isSilenceDetectedRef = useRef(false);

  //   const startAivoice = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       audioStreamRef.current = stream;

  //       const mediaRecorder = new MediaRecorder(stream, {
  //         mimeType: "audio/webm",
  //         audioBitsPerSecond: 64000,
  //       });

  //               const token = localStorage.getItem("token");
  //               console.log(token);
  //       const ws = new WebSocket(`ws://localhost:5001/api/voice/ws?token=${token}`); // Adjust to your backend address
  //       voiceWsRef.current = ws;

  //       ws.onopen = () => {
  //         console.log("✅ WebSocket connected");

  //         // Send conversation ID if stored
  //         const storedConversationId = localStorage.getItem("conversation_id");
  //         if (storedConversationId) {
  //           ws.send(
  //             JSON.stringify({
  //               type: "control",
  //               conversation_id: storedConversationId,
  //             })
  //           );
  //         }
  //       };

  //       ws.onmessage = (event) => {
  //         const data = JSON.parse(event.data);

  //         if (data.type === "aiMessage") {
  //           console.log("🤖 AI:", data.message);
  //           setIsResponding(false);
  //         } else if (data.type === "userMessage") {
  //           console.log("🧑 You:", data.message);
  //           if (data.conversation_id) {
  //             localStorage.setItem("conversation_id", data.conversation_id);
  //           }
  //         } else if (data.type === "processing") {
  //           setIsResponding(true);
  //         } else if (data.type === "error") {
  //           console.error("❌ Error:", data.error);
  //         }
  //       };

  //       mediaRecorder.ondataavailable = (event) => {
  //         if (event.data.size > 0 && !isSilenceDetectedRef.current && voiceWsRef.current?.readyState === 1) {
  //           const reader = new FileReader();
  //           reader.onloadend = () => {
  //             const base64Audio = reader.result.split(",")[1];
  //             voiceWsRef.current.send(
  //               JSON.stringify({
  //                 type: "transcribe",
  //                 audio_data: base64Audio,
  //               })
  //             );
  //             setIsProcessing(true);
  //           };
  //           reader.readAsDataURL(event.data);
  //         }
  //       };

  //       mediaRecorder.onstart = () => {
  //         console.log("🎙️ Recording started");
  //         setIsliveRecording(true);
  //       };

  //       mediaRecorder.onstop = () => {
  //         console.log("⏹️ Recording stopped");
  //         setIsliveRecording(false);
  //         clearTimeout(silenceTimerRef.current);
  //       };

  //       mediaRecorderRef.current = mediaRecorder;
  //       mediaRecorder.start(3000); // Record chunks every 3 seconds

  //       detectSilence(stream);

  //     } catch (err) {
  //       console.error("🎤 Voice error:", err);
  //     }
  //   };

  //   const detectSilence = (stream) => {
  //     const audioContext = new AudioContext();
  //     const analyser = audioContext.createAnalyser();
  //     const microphone = audioContext.createMediaStreamSource(stream);
  //     const data = new Uint8Array(analyser.frequencyBinCount);

  //     analyser.fftSize = 2048;
  //     microphone.connect(analyser);

  //     const checkSilence = () => {
  //       analyser.getByteFrequencyData(data);
  //       const volume = data.reduce((a, b) => a + b, 0) / data.length;

  //       if (volume < 10) {
  //         if (!isSilenceDetectedRef.current) {
  //           silenceTimerRef.current = setTimeout(() => {
  //             isSilenceDetectedRef.current = true;
  //             console.log("🔇 Silence detected, pausing audio sending");
  //           }, 4000); // 4s silence triggers pause
  //         }
  //       } else {
  //         if (isSilenceDetectedRef.current) {
  //           console.log("🎤 Resumed speaking");
  //         }
  //         isSilenceDetectedRef.current = false;
  //         clearTimeout(silenceTimerRef.current);
  //       }

  //       requestAnimationFrame(checkSilence);
  //     };

  //     checkSilence();
  //   };

  //   const stopAiVoice = () => {
  //     mediaRecorderRef.current?.stop();
  //     audioStreamRef.current?.getTracks().forEach((track) => track.stop());

  //     if (voiceWsRef.current?.readyState === 1) {
  //       voiceWsRef.current.send(JSON.stringify({ type: "control", action: "stop" }));
  //       voiceWsRef.current.close();
  //     }

  //     setIsliveRecording(false);
  //     setIsProcessing(false);
  //     setIsResponding(false);
  //   };

  //   const startNewConversation = () => {
  //     localStorage.removeItem("conversation_id");
  //     console.log("🆕 New conversation started");
  //   };

  // test

  // const [isliveRecording, setIsliveRecording] = useState(false);
  //   const [isProcessing, setIsProcessing] = useState(false);
  //   const [isResponding, setIsResponding] = useState(false);

  //   const mediaRecorderRef = useRef(null);
  //   const audioStreamRef = useRef(null);
  //   const voiceWsRef = useRef(null);
  //   const silenceTimerRef = useRef(null);
  //   const isSilenceDetectedRef = useRef(false);

  //   const startAivoice = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       audioStreamRef.current = stream;

  //       const token = localStorage.getItem("token");
  //       const ws = new WebSocket(`ws://localhost:5001/api/voice/ws?token=${token}`);
  //       voiceWsRef.current = ws;

  //       ws.onopen = () => {
  //         console.log("✅ WebSocket connected");
  //         const storedConversationId = localStorage.getItem("conversation_id");
  //         if (storedConversationId) {
  //           ws.send(JSON.stringify({ type: "control", conversation_id: storedConversationId }));
  //         }
  //       };

  //       ws.onmessage = (event) => {
  //         const data = JSON.parse(event.data);

  //         if (data.type === "aiMessage") {
  //           console.log("🤖 AI:", data.message);
  //           setIsResponding(false);
  //           setIsProcessing(false);

  //           // Restart voice input after AI response
  //           continueVoiceLoop();
  //         } else if (data.type === "userMessage") {
  //           console.log("🧑 You:", data.message);
  //           if (data.conversation_id) {
  //             localStorage.setItem("conversation_id", data.conversation_id);
  //           }
  //         } else if (data.type === "processing") {
  //           setIsResponding(true);
  //         } else if (data.type === "error") {
  //           console.error("❌ Error:", data.error);
  //         }
  //       };

  //       // Start recording first time
  //       startRecorder(stream);

  //       detectSilence(stream);
  //     } catch (err) {
  //       console.error("🎤 Voice error:", err);
  //     }
  //   };

  //   const startRecorder = (stream) => {
  //     const mediaRecorder = new MediaRecorder(stream, {
  //       mimeType: "audio/webm",
  //       audioBitsPerSecond: 64000,
  //     });

  //     mediaRecorder.ondataavailable = (event) => {
  //       if (event.data.size > 0 && !isSilenceDetectedRef.current && voiceWsRef.current?.readyState === 1) {
  //         const reader = new FileReader();
  //         reader.onloadend = () => {
  //           const base64Audio = reader.result.split(",")[1];
  //           voiceWsRef.current.send(
  //             JSON.stringify({
  //               type: "transcribe",
  //               audio_data: base64Audio,
  //             })
  //           );
  //           setIsProcessing(true);
  //         };
  //         reader.readAsDataURL(event.data);
  //       }
  //     };

  //     mediaRecorder.onstart = () => {
  //       console.log("🎙️ Recording started");
  //       setIsliveRecording(true);
  //     };

  //     mediaRecorder.onstop = () => {
  //       console.log("⏹️ Recording stopped");
  //       setIsliveRecording(false);
  //     };

  //     mediaRecorderRef.current = mediaRecorder;
  //     mediaRecorder.start(3000); // Send audio chunks every 3 seconds
  //   };

  //   const continueVoiceLoop = () => {
  //     if (!audioStreamRef.current) return;
  //     startRecorder(audioStreamRef.current);
  //   };

  //   const detectSilence = (stream) => {
  //     const audioContext = new AudioContext();
  //     const analyser = audioContext.createAnalyser();
  //     const microphone = audioContext.createMediaStreamSource(stream);
  //     const data = new Uint8Array(analyser.frequencyBinCount);

  //     analyser.fftSize = 2048;
  //     microphone.connect(analyser);

  //     const checkSilence = () => {
  //       analyser.getByteFrequencyData(data);
  //       const volume = data.reduce((a, b) => a + b, 0) / data.length;

  //       if (volume < 10) {
  //         if (!isSilenceDetectedRef.current) {
  //           silenceTimerRef.current = setTimeout(() => {
  //             isSilenceDetectedRef.current = true;
  //             console.log("🔇 Silence detected, pausing audio sending");

  //             // Pause recording temporarily
  //             mediaRecorderRef.current?.stop();
  //           }, 3000); // 3s silence triggers pause
  //         }
  //       } else {
  //         if (isSilenceDetectedRef.current) {
  //           console.log("🎤 Resumed speaking");
  //         }
  //         isSilenceDetectedRef.current = false;
  //         clearTimeout(silenceTimerRef.current);
  //       }

  //       requestAnimationFrame(checkSilence);
  //     };

  //     checkSilence();
  //   };

  //   const stopAiVoice = () => {
  //     mediaRecorderRef.current?.stop();
  //     audioStreamRef.current?.getTracks().forEach((track) => track.stop());

  //     if (voiceWsRef.current?.readyState === 1) {
  //       voiceWsRef.current.send(JSON.stringify({ type: "control", action: "stop" }));
  //       voiceWsRef.current.close();
  //     }

  //     setIsliveRecording(false);
  //     setIsProcessing(false);
  //     setIsResponding(false);
  //   };

  // test2
  const [isliveRecording, setIsliveRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const voiceWsRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSilenceDetectedRef = useRef(false);
  const silenceEndConfirmTimerRef = useRef(null);
  const hasAudioBeenSentRef = useRef(false);

  const startAivoice = async () => {
    try {
      // 🧠 Noise suppression enabled
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;

      const token = localStorage.getItem("token");
      const ws = new WebSocket(
        `ws://localhost:5001/api/voice/ws?token=${token}`
        // `wss://quantumhash-backend-1.onrender.com/api/voice/ws?token=${token}`
        // `${WSS_BASE_URL}`
      );
      voiceWsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");

        const storedConversationId = localStorage.getItem("conversation_id");
        if (storedConversationId) {
          ws.send(
            JSON.stringify({
              type: "control",
              conversation_id: storedConversationId,
            })
          );
        }
      };

      //  working
      // ws.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   const conversationId =
      //     data.conversation_id || localStorage.getItem("conversation_id");

      //   if (!conversationId) {
      //     console.error("❌ Missing conversation_id in WebSocket data.");
      //     return;
      //   }

      //   // Ensure it's active in Redux
      //   if (!activeConversation) {
      //     localStorage.setItem("conversation_id", conversationId);
      //     dispatch(setActiveConversation(Number(conversationId)));
      //   }

      //   // 🎤 User voice message
      //   if (data.type === "userMessage") {
      //     console.log("🧑 You:", data.message);

      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now(),
      //           message: data.message,
      //           sender: "user",
      //           timestamp: new Date().toISOString(),
      //           files: [], // Optional: add if you're sending voice files
      //         },
      //       })
      //     );
      //   }

      //   // 🤖 AI Response
      //   else if (data.type === "aiMessage") {
      //     console.log("🤖 AI:", data.message);

      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now() + 1,
      //           message: data.message,
      //           sender: "bot",
      //           response: data.message,
      //           timestamp: new Date().toISOString(),
      //           files: data.files || [], // In case AI response includes files
      //         },
      //       })
      //     );

      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();

      //     // Optional: refresh conversations if new one created
      //     if (data.refreshSidebar) {
      //       fetchConversations(token).then((updated) =>
      //         dispatch(setConversations(updated.conversations))
      //       );
      //     }
      //   } else if (data.type === "transcriptionTooShort") {
      //     console.warn("⚠️ Transcription too short");
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   } else if (data.type === "processing") {
      //     setIsResponding(true);
      //   } else if (data.type === "error") {
      //     console.error("❌ Error:", data.error);
      //     alert(data.error);
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   }
      // };
      // ws.onmessage = async (event) => {
      //   // 🧠 TTS Binary Audio Stream
      //   // if (event.data instanceof Blob) {
      //   //   const audioUrl = URL.createObjectURL(event.data);
      //   //   const audio = new Audio(audioUrl);
      //   //   await audio.play();
      //   //   return;
      //   // }

      //   // 🧠 Normal JSON Messages (aiMessage, userMessage, etc.)
      //     const data = JSON.parse(event.data);
      //   const conversationId =
      //     data.conversation_id || localStorage.getItem("conversation_id");

      //   if (!conversationId) {
      //     console.error("❌ Missing conversation_id in WebSocket data.");
      //     return;
      //   }

      //   // Ensure active conversation is set
      //   if (!activeConversation) {
      //     localStorage.setItem("conversation_id", conversationId);
      //     dispatch(setActiveConversation(Number(conversationId)));
      //   }

      //   if (data.type === "userMessage") {
      //     console.log("🧑 You:", data.message);
      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now(),
      //           message: data.message,
      //           sender: "user",
      //           timestamp: new Date().toISOString(),
      //           files: [],
      //         },
      //       })
      //     );
      //   } else if (data.type === "aiMessage") {
      //     console.log("🤖 AI:", data.message);
      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now() + 1,
      //           message: data.message,
      //           sender: "bot",
      //           response: data.message,
      //           timestamp: new Date().toISOString(),
      //           files: data.files || [],
      //         },
      //       })
      //     );

      //     // Stream the AI response as audio
      //         await streamAudio(data.message); // Pass the AI response text to streamAudio

      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();

      //     if (data.refreshSidebar) {
      //       fetchConversations(token).then((updated) =>
      //         dispatch(setConversations(updated.conversations))
      //       );
      //     }
      //   } else if (data.type === "transcriptionTooShort") {
      //     console.warn("⚠️ Transcription too short");
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   } else if (data.type === "processing") {
      //     setIsResponding(true);
      //   } else if (data.type === "error") {
      //     console.error("❌ Error:", data.error);
      //     alert(data.error);
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   }
      // };
      // test working
      // ws.onmessage = async (event) => {
      //   const data = JSON.parse(event.data);
      //   const conversationId = data.conversation_id || localStorage.getItem("conversation_id");

      //   if (!conversationId) {
      //     console.error("❌ Missing conversation_id in WebSocket data.");
      //     return;
      //   }

      //   // Ensure active conversation is set
      //   if (!activeConversation) {
      //     localStorage.setItem("conversation_id", conversationId);
      //     dispatch(setActiveConversation(Number(conversationId)));
      //   }

      //   if (data.type === "userMessage") {
      //     console.log("🧑 You:", data.message);
      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now(),
      //           message: data.message,
      //           sender: "user",
      //           timestamp: new Date().toISOString(),
      //           files: [],
      //         },
      //       })
      //     );
      //   } else if (data.type === "aiMessage") {
      //     console.log("🤖 AI:", data.message);

      //     // Play the TTS audio first
      //     try {
      //       await streamAudio(data.message); // Stream the AI response audio
      //     } catch (error) {
      //       console.error("❌ Error playing audio:", error);
      //     }

      //     // After the audio finishes, show the AI response text
      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now() + 1,
      //           message: data.message,
      //           sender: "bot",
      //           response: data.message,
      //           timestamp: new Date().toISOString(),
      //           files: data.files || [],
      //         },
      //       })
      //     );

      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();

      //     if (data.refreshSidebar) {
      //       fetchConversations(token).then((updated) =>
      //         dispatch(setConversations(updated.conversations))
      //       );
      //     }
      //   } else if (data.type === "transcriptionTooShort") {
      //     console.warn("⚠️ Transcription too short");
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   } else if (data.type === "processing") {
      //     setIsResponding(true);
      //   } else if (data.type === "error") {
      //     console.error("❌ Error:", data.error);
      //     alert(data.error);
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   }
      // };

      // ws.onmessage = async (event) => {
      //   const data = JSON.parse(event.data);
      //   const conversationId = data.conversation_id || localStorage.getItem("conversation_id");

      //   if (!conversationId) {
      //     console.error("❌ Missing conversation_id in WebSocket data.");
      //     return;
      //   }

      //   // Ensure active conversation is set
      //   if (!activeConversation) {
      //     localStorage.setItem("conversation_id", conversationId);
      //     dispatch(setActiveConversation(Number(conversationId)));
      //   }
      // if (data.type === "userMessage") {
      //     console.log("🧑 You:", data.message);
      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now(),
      //           message: data.message,
      //           sender: "user",
      //           timestamp: new Date().toISOString(),
      //           files: [],
      //         },
      //       })
      //     )}
      //  else if (data.type === "aiMessage") {
      //     console.log("🤖 AI:", data.message);

      //     // Pause recording while TTS is playing
      //     setIsTTSPlaying(true);
      //     // mediaRecorderRef.current?.stop();
      // // Stop media recording with event listener
      //     if (mediaRecorderRef.current) {
      //         mediaRecorderRef.current.onstop = () => {
      //             console.log("Media recorder stopped successfully");
      //         };
      //         mediaRecorderRef.current?.stop();
      //     }

      //     // Play the TTS audio first
      //     try {
      //       await streamAudio(data.message); // Stream the AI response audio
      //     } catch (error) {
      //       console.error("❌ Error playing audio:", error);
      //     }

      //     // After the audio finishes, resume recording and show the AI response text
      //     setIsTTSPlaying(false); // TTS has finished
      //   mediaRecorderRef.current?.start(); // Resume recording

      //     dispatch(
      //       addMessage({
      //         conversationId,
      //         message: {
      //           id: Date.now() + 1,
      //           message: data.message,
      //           sender: "bot",
      //           response: data.message,
      //           timestamp: new Date().toISOString(),
      //           files: data.files || [],
      //         },
      //       })
      //     );

      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();

      //     if (data.refreshSidebar) {
      //       fetchConversations(token).then((updated) =>
      //         dispatch(setConversations(updated.conversations))
      //       );
      //     }
      //   } else if (data.type === "transcriptionTooShort") {
      //     console.warn("⚠️ Transcription too short");
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   } else if (data.type === "processing") {
      //     setIsResponding(true);
      //   } else if (data.type === "error") {
      //     console.error("❌ Error:", data.error);
      //     alert(data.error);
      //     setIsResponding(false);
      //     setIsProcessing(false);
      //     continueVoiceLoop();
      //   }
      // };

      // 🟢 Start first recording cycle

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const conversationId =
          data.conversation_id || localStorage.getItem("conversation_id");

        if (!conversationId) {
          console.error("❌ Missing conversation_id in WebSocket data.");
          return;
        }

        // Ensure active conversation is set
        if (!activeConversation) {
          localStorage.setItem("conversation_id", conversationId);
          dispatch(setActiveConversation(Number(conversationId)));
        }

        // 🧑 User Message
        if (data.type === "userMessage") {
          console.log("🧑 You:", data.message);
          dispatch(
            addMessage({
              conversationId,
              message: {
                id: Date.now(),
                message: data.message,
                sender: "user",
                timestamp: new Date().toISOString(),
                files: [],
              },
            })
          );
        }

        // 🤖 AI Message with TTS playback
        else if (data.type === "aiMessage") {
          console.log("🤖 AI:", data.message);
          setIsTTSPlaying(true);

          // Stop recording while playing TTS
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => {
              console.log("🎤 Recording paused for TTS playback.");
            };
            mediaRecorderRef.current.stop();
          }

          try {
            await streamAudio(data.message); // ⏯️ Play audio first
          } catch (err) {
            console.error("❌ Error during TTS playback:", err);
          }

          // Now display AI response
          dispatch(
            addMessage({
              conversationId,
              message: {
                id: Date.now() + 1,
                message: data.message,
                sender: "bot",
                response: data.message,
                timestamp: new Date().toISOString(),
                files: data.files || [],
              },
            })
          );

          setIsTTSPlaying(false);
          setIsResponding(false);
          setIsProcessing(false);
          continueVoiceLoop();

          if (data.refreshSidebar) {
            const token = localStorage.getItem("token");
            fetchConversations(token).then((updated) =>
              dispatch(setConversations(updated.conversations))
            );
          }
        }

        // ⚠️ Short Transcription
        else if (data.type === "transcriptionTooShort") {
          console.warn("⚠️ Transcription too short");
          setIsResponding(false);
          setIsProcessing(false);
          continueVoiceLoop();
        }

        // ⏳ AI is processing
        else if (data.type === "processing") {
          setIsResponding(true);
        }

        // ❌ Error handling
        else if (data.type === "error") {
          console.error("❌ Error:", data.error);
          alert(data.error);
          setIsResponding(false);
          setIsProcessing(false);
          continueVoiceLoop();
        }
      };

      startRecorder(stream);
      detectSilence(stream);
    } catch (err) {
      console.error("🎤 Voice error:", err);
    }
  };

  const startRecorder = (stream) => {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
      audioBitsPerSecond: 64000,
    });

    hasAudioBeenSentRef.current = false;

    mediaRecorder.ondataavailable = (event) => {
      if (
        event.data.size > 0 &&
        !isSilenceDetectedRef.current &&
        voiceWsRef.current?.readyState === 1
      ) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(",")[1];
          if (base64Audio.length > 50) {
            voiceWsRef.current.send(
              JSON.stringify({
                type: "transcribe", // 🚀 Match backend: send for transcription
                audio_data: base64Audio,
              })
            );
            hasAudioBeenSentRef.current = true;
            setIsProcessing(true);
          }
        };
        reader.readAsDataURL(event.data);
      }
    };

    mediaRecorder.onstart = () => {
      console.log("🎙️ Recording started");
      setIsliveRecording(true);
    };

    mediaRecorder.onstop = () => {
      console.log("⏹️ Recording stopped");
      setIsliveRecording(false);

      if (!hasAudioBeenSentRef.current) {
        console.warn("⚠️ No audio sent. Retrying...");
        continueVoiceLoop();
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(3000); // 🔄 send audio every 3 seconds
  };

  const continueVoiceLoop = () => {
    if (!audioStreamRef.current) return;
    startRecorder(audioStreamRef.current); // 🔁 restart recording
  };

  const detectSilence = (stream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const data = new Uint8Array(analyser.frequencyBinCount);

    analyser.fftSize = 2048;
    microphone.connect(analyser);

    const checkSilence = () => {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;

      if (volume < 10) {
        if (!isSilenceDetectedRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            isSilenceDetectedRef.current = true;
            console.log("🔇 Silence detected, waiting for confirmation...");

            silenceEndConfirmTimerRef.current = setTimeout(() => {
              console.log("🛑 Confirmed silence — stopping recorder");
              mediaRecorderRef.current?.stop();
            }, 2000);
          }, 3000);
        }
      } else {
        if (isSilenceDetectedRef.current) {
          console.log("🎤 User resumed speaking — cancelling silence stop");
        }
        isSilenceDetectedRef.current = false;
        clearTimeout(silenceTimerRef.current);
        clearTimeout(silenceEndConfirmTimerRef.current);
      }

      requestAnimationFrame(checkSilence);
    };

    checkSilence();
  };

  const stopAiVoice = () => {
    mediaRecorderRef.current?.stop();
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());

    if (voiceWsRef.current?.readyState === 1) {
      voiceWsRef.current.send(
        JSON.stringify({ type: "control", action: "stop" })
      );
      voiceWsRef.current.close();
    }

    setIsliveRecording(false);
    setIsProcessing(false);
    setIsResponding(false);
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-y-auto bg-white dark:bg-gradient-to-r dark:from-zinc-700 dark:to-slate-900 transition-colors duration-300">
      <Navbar />
      {/* Chat Area starts */}
      <div
        ref={chatContainerRef}
        className=" relative flex-1 h-[calc(100vh-160px)] w-full  md:p-4  mt-20 md:mt-0 space-y-6 overflow-auto mx-auto bg-white dark:bg-gradient-to-r dark:from-zinc-700 dark:to-slate-900 transition-colors duration-300">
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
                        className="relative p-3 rounded-lg mt-2 break-words text-sm shadow-md bg-[#f4f4f5] dark:bg-indigo-500 text-[#1e293b] dark:text-white max-w-2xl w-fit self-end ml-auto">
                        <div className="flex items-start gap-2">
                          <div className="rounded-full">
                            <CircleUserRound
                              size={20}
                              color="black"
                              strokeWidth={2.25}
                            />
                          </div>
                          <div className="flex flex-col w-full mr-7 overflow-auto text-justify text-xs md:text-base space-y-2 font-centurygothic">
                            {/* <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {msg.message}
                            </ReactMarkdown> */}
                            <ChatbotMarkdown content={msg.message} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* BOT RESPONSE */}
                    {msg.response && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-3 rounded-lg break-words text-sm shadow-md backdrop-blur-2xl bg-white/10 border border-white/20 text-gray-800 dark:text-white max-w-full self-start mr-auto mt-3">
                        <div className="flex items-start gap-2">
                          <div className="p-1 rounded-full">
                            <img
                              src="./logo.png"
                              className="h-5 w-5"
                              alt="Bot Logo"
                            />
                          </div>
                          <div className="flex flex-col w-full mr-7 overflow-auto text-xs md:text-base text-justify space-y-2 font-centurygothic">
                            {/* <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {msg.response}
                            </ReactMarkdown> */}
                            <ChatbotMarkdown content={msg.response} />
                          </div>
                        </div>
                        {/* copy button  */}
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(msg.response)
                          }
                          className="absolute top-2 right-2 z-10 p-1 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition">
                          <Copy size={14} />
                        </button>
                      </motion.div>
                    )}

                    {msg.response && (
                      <hr className="border-t-[1px] border-gray-600 dark:border-gray-600 w-full mx-auto my-5 opacity-50" />
                    )}
                  </div>
                ))}

              {/* ✅ Bot Typing Animation */}
              {(botTyping || isProcessing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="p-3 rounded-lg w-32 md:w-80 bg-gray-500 font-centurygothic text-white self-start ml-2 mb-2  md:ml-0 mr-auto mt-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-500 p-1 rounded-full">
                      <img
                        src="./logo.png"
                        className="h-5 w-5 text-2xl animate-walkingBot"
                        alt="Bot Logo"
                      />
                    </div>
                    <span className="animate-typingDots text-xs md:text-lg font-centurygothic">
                      Thinking
                    </span>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            // ✅ Greeting when no messages yet
            showGreeting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`absolute bottom-72 w-fit gap-3 md:w-3/5 flex font-centurygothic flex-col items-center justify-center text-center text-gray-800 dark:text-white`}>
                <img src="./logo.png" className="w-16 h-16  " alt="" />
                <span className="md:text-3xl text-base font-extrabold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                  Quantum<span className="text-base md:text-4xl">Ai</span>
                </span>

                <h2 className="md:text-3xl text-base font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                  {greeting}
                  {/* <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text">{showCursor ? "|" : ""}</span> */}
                </h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5 }}
                  className="text-base md:text-2xl font-bold text-gray-500 dark:text-gray-300">
                  {getTimeBasedGreeting()}, {user?.username}
                </motion.p>
                {/* <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5 }}
                  className="text-base md:text-lg text-gray-500 dark:text-gray-300">
                  How can i help you today?
                </motion.p> */}
              </motion.div>
            )
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
      {showScrollButton && (
        <button
          onMouseEnter={() => setscrollTooltip(true)}
          onMouseLeave={() => setscrollTooltip(false)}
          onClick={scrollToBottom}
          className={`absolute bottom-[150px]  right-0 md:right-10 transform -translate-x-1/2 z-50 p-1  rounded-full shadow-lg bg-white dark:bg-gray-800 border border-black dark:border-white transition text-black dark:text-white`}
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
      <div className="flex flex-col  mx-auto    mb-3 mt-2 w-[95%] sm:w-[70%] shadow-2xl rounded-3xl bg-white dark:bg-gray-800  p-2 transition-colors duration-300">
        {/* File Previews Section — ✅ UPDATED LIKE CHATGPT */}
        

        {/* test  */}
<div className="w-full flex gap-3 mb-1 md:mb-3 flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-visible">
  {files.map((file, index) => (
    <div
      key={index}
      className="relative p-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-sm w-[150px] flex-shrink-0 flex items-center gap-2"
    >
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
        onClick={() => removeFile(index)}
      >
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

        {/* 
<div className="relative w-full">
  {/* Textarea Input */}
        {/* <textarea
    ref={textareaRef}
    className="w-full h-auto max-h-36 min-h-[44px] p-3  rounded-2xl bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 placeholder:text-gray-400 dark:placeholder-gray-300 transition-all duration-300 resize-none overflow-y-auto scrollbar-hide leading-relaxed relative z-10"
    value={inputMessage + (isRecording ? transcriptBuffer : "")}
    onChange={handleInputChange}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }}
    rows="1"
    placeholder={isRecording ? "" : "Ask me anything..."}
  /> */}

        {/* Text Area with Voice Visualizer */}
        <div className="relative w-full">
          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            className="w-full h-auto text-xs md:text-base max-h-36 min-h-[35px] md:min-h-[44px] p-2 md:p-3  rounded-2xl bg-white dark:bg-gray-700 transition-all duration-200 ease-in-out text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 placeholder:text-gray-400 dark:placeholder-gray-300   resize-none overflow-y-auto scrollbar-hide leading-relaxed relative z-10"
            value={inputMessage + (isRecording ? transcriptBuffer : "")}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
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
                onClick={() => fileInputRef.current.click()}
                onMouseEnter={() => setShowUploadTooltip(true)}
                onMouseLeave={() => setShowUploadTooltip(false)}>
                <span className="md:block hidden">
                  <Paperclip size={16} />
                </span>
                <span className="block md:hidden">
                  <Paperclip size={12} />
                </span>
              </div>

              {showUploadTooltip && (
                <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-900 rounded-lg shadow-md whitespace-nowrap">
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
            <div className="relative">
              <div
                className={`cursor-pointer border-[0.5px] text-black dark:text-white border-gray-800 dark:border-gray-300 rounded-full p-2 
      ${
        isRecording
          ? "bg-red-500 animate-pulse text-white"
          : "hover:bg-gray-300 dark:hover:bg-gray-700"
      } transition-all duration-300`}
                onClick={isRecording ? stopRecording : startRecording}
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

            {/* Voice Assistant Button WORKING*/}
            {/* <div className="voice-controls text-gray-800 dark:text-white">
              {aiRecording ? (
                <button onClick={stopAiVoice} className="btn-stop">
                  🛑 Stop
                </button>
              ) : (
                <button onClick={startAivoice} className="btn-start font-bold">
                  <span className=" text-xs md:text-base flex">
                    🎙 Start Voice
                  </span>
                </button>
              )}
              {isProcessing && <p>⏳ AI thinking...</p>}
            </div> */}

            {/* test */}

            {/* <div className="voice-controls text-gray-800 dark:text-white">
      {isliveRecording ? (
        <button onClick={stopAiVoice} className="btn-stop px-4 py-2 bg-red-600 text-white rounded-xl shadow-md">
          🛑 Stop
        </button>
      ) : (
        <button onClick={startAivoice} className="btn-start font-bold px-4 py-2 bg-green-600 text-white rounded-xl shadow-md">
          <span className="text-xs md:text-base flex items-center gap-2">
            🎙 Start Voice
          </span>
        </button>
      )}

      <div className="mt-2 text-sm">
        {isProcessing && <p className="text-yellow-500">⏳ AI thinking...</p>}
        {isResponding && <p className="text-green-500">🤖 Responding...</p>}
        {!isProcessing && !isResponding && isliveRecording && (
          <p className="text-blue-500">🎧 Listening...</p>
        )}
      </div>
    </div> */}

            <div className="relative voice-controls text-gray-800 dark:text-white">
              <button
                onMouseEnter={() => setvoiceTooltip(true)}
                onMouseLeave={() => setvoiceTooltip(false)}
                onClick={() => {
                  startAivoice();
                  setShowVoiceOverlay(true);
                }}
                className="btn-start font-bold px-4 py-2 bg-green-600  text-white rounded-xl shadow-md">
                <span className="md:block hidden text-xs md:text-base   items-center gap-2">
                  <AudioLines size={20} />
                </span>
                <span className="block md:hidden text-xs md:text-base    items-center gap-2">
                  <AudioLines size={12} />
                </span>
                {voiceTooltip && (
                  <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-900  rounded-lg shadow-md whitespace-nowrap">
                    Voice Mode
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                  border-l-[6px] border-l-transparent 
                  border-r-[6px] border-r-transparent 
                  border-t-[6px] border-t-zinc-900"
                    />
                  </div>
                )}
              </button>
            </div>
            {/* voice overlay container  */}
            {showVoiceOverlay && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-0 left-0 md:left-60 transform -translate-x-1/2 w-full md:w-[80%] h-[180px]  bg-gradient-to-t from-gray-800 via-gray-500 to-transparent backdrop-blur-lg   rounded-2xl text-white z-50 flex flex-col items-center justify-center shadow-2xl transition-all">
                <div className="md:flex items-center justify-center gap-10 mb-4">
                  <div className=" w-52 flex items-center justify-center flex-col">
                    <div className=" w-20 h-20  md:w-40 md:h-40  ">
                      <RadialVisualizer audioStream={audioStreamRef.current} />
                    </div>
                    {/* Voice status */}
                    <div className="  text-sm font-semibold text-center h-6 flex items-center">
                      {isProcessing && (
                        <p className="text-yellow-400 animate-pulse">
                          ⏳ AI thinking...
                        </p>
                      )}
                      {isResponding && (
                        <p className="text-green-400 animate-pulse">
                          🤖 Responding...
                        </p>
                      )}
                      {!isProcessing && !isResponding && isliveRecording && (
                        <div className="text-blue-400 flex items-center gap-1">
                          <span>🎧 Listening</span>
                          <span className="animate-typingDots ml-1"></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stop button */}
                  <button
                    onClick={() => {
                      stopAiVoice();
                      setShowVoiceOverlay(false);
                    }}
                    className=" mt-5 md:mt-0 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition duration-300">
                    🛑 Stop Voice
                  </button>
                </div>
              </motion.div>
            )}

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
             <span  className="md:block hidden"> <Send size={16} /></span>
              <span  className="block md:hidden"> <Send size={12} /></span>
            </button>
          </div>
        </div>
      </div>

      {/* Tailwind Typing Animation */}
      <style>
        {`
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

  /* Customize scrollbar for modern and slim look */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
    transition: background-color 0.3s;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }

  ::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 10px;
  }

  /* Dark mode scrollbar */
  .dark ::-webkit-scrollbar-track {
    background-color: #1f2937;
  }

  .dark ::-webkit-scrollbar-thumb {
    background-color: #4b5563;
  }

  .dark ::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280;
  }
    /* Hide scrollbar for textarea */
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.scrollbar-hide {
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
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



`}
      </style>
    </div>
  );
};

export default ChatArea;
