import axios from "axios";

// const API_BASE_URL = "https://quantumhash-backend-1.onrender.com/api"; // Replace with your backend URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Login API
// export const login = async (credentials) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
//     console.log("🔍 Raw Axios Response:", response); // Check raw response
//     console.log("🔍 Response Data:", response.data); // Ensure .data exists

//     return response.data; // ✅ Return actual data
//   } catch (error) {
//     if (error.response) {
//       console.error("❌ Login API Error (Response):", error.response.data);
//     } else if (error.request) {
//       console.error("❌ Login API Error (No Response):", error.request);
//     } else {
//       console.error("❌ Login API Error (Other):", error.message);
//     }
//     return null; // Prevents breaking the app
//   }
// };

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
    console.log("🔍 Raw Axios Response:", response); // Check raw response
    console.log("🔍 Response Data:", response.data); // Ensure .data exists

    return response.data; // ✅ Return actual data
  } catch (error) {
    let errorMsg = "Login failed!";
    if (error.response) {
      console.error("❌ Login API Error (Response):", error.response.data);
      errorMsg = error.response.data?.error || errorMsg;
    } else if (error.request) {
      console.error("❌ Login API Error (No Response):", error.request);
      errorMsg = "No response from server.";
    } else {
      console.error("❌ Login API Error (Other):", error.message);
      errorMsg = error.message;
    }

    // ❌ Throw the error to be caught by the thunk
    throw new Error(errorMsg);
  }
};

 
 

// Fetch user, token, and conversation ID from Google callback route
export const fetchGoogleCallbackData = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google/callback`,credentials );
console.log("🔍 Google Callback Response:", response);
console.log("🔍 Response Data:", response.data); // Ensure .data exists

    if (!response.ok) {
      throw new Error("❌ Google login failed");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Google login failed");
    }

    return data; // Return the data containing token, user, and conversation_id
  } catch (error) {
    console.error("❌ Error in API call:", error.message);
    throw error; // Rethrow the error to be caught in the Redux action
  }
};


export const initiateGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

 

// Signup API


export const signup = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, credentials);
  return response.data;
};


// New: Verify OTP API
export const verifyOtp = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, data);
  return response.data;
};

// New: Resend OTP API
export const resendOtp = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, data); 
  // Assuming resend is the same endpoint as signup sending OTP again
  return response.data;
};

export const sendForgotPasswordOtp = async (email) => {
  const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const response = await axios.post(`${API_BASE_URL}/auth/verify-reset-otp`, { email, otp });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
  const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
    email,
    otp,
    newPassword,
    confirmPassword,
  });
  return response.data;
};


// Fetch user's conversations
export const fetchConversations = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch conversation history
export const fetchConversationHistory = async (conversationId, token) => {
  const response = await axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// export const fetchConversationHistory = async (conversationId, token) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     // Check if response.data is an array
//     if (Array.isArray(response.data)) {
//       // If it's an array, proceed with mapping over it
//       const messages = response.data.map((msg) => ({
//         ...msg,
//         file_names: msg.file_names ? JSON.parse(msg.file_names) : [], // Parse file_names if available
//       }));

//       return messages;
//     } else {
//       // If it's not an array, log and return an empty array or some fallback
//       console.error("Expected an array but received:", response.data);
//       return [];
//     }
//   } catch (error) {
//     console.error("❌ Error fetching chat history:", error);
//     return []; // Return an empty array on error
//   }
// };




// Send a message
 

// export const sendMessage = async (
//   conversationId,
//   message,
//   userId,
//   token,
//   extracted_summary_raw = "",
//   uploaded_file_metadata = [] // ⬅️ New param!
// ) => {
//   const response = await axios.post(
//     `${API_BASE_URL}/chat`,
//     {
//       userMessage: message,
//       conversation_id: conversationId,
//       user_id: userId,
//       extracted_summary: extracted_summary_raw,
//       uploaded_file_metadata // ✅ Pass this to backend
//     },
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
//   return response.data;
// };
  
export const sendMessage = async (
  conversationId,
  message,
  userId,
  token,
  extracted_summary_raw = "",
  uploaded_file_metadata = [],
  onStreamChunk = null // Callback for streaming chunks
) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userMessage: message,
      conversation_id: conversationId,
      user_id: userId,
      extracted_summary: extracted_summary_raw,
      uploaded_file_metadata
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let buffer = '';
  let fullResponse = '';
  let metadata = null;
  let suggestions = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            
            switch (data.type) {
              case 'start':
                metadata = data;
                if (onStreamChunk) {
                  onStreamChunk({ type: 'start', data: metadata });
                }
                break;
                
              case 'content':
                fullResponse += data.content;
                if (onStreamChunk) {
                  onStreamChunk({ 
                    type: 'content', 
                    content: data.content,
                    fullResponse: fullResponse 
                  });
                }
                break;
                
              case 'end':
                suggestions = data.suggestions || [];
                if (onStreamChunk) {
                  onStreamChunk({ 
                    type: 'end', 
                    suggestions: suggestions,
                    fullResponse: fullResponse 
                  });
                }
                break;
                
              case 'error':
                throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('Error parsing streaming data:', parseError);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    response: fullResponse,
    suggestions: suggestions,
    files: metadata?.uploaded_files || [],
    conversation_id: metadata?.conversation_id || conversationId,
    ...metadata
  };
};


// Create a new conversation (Auto-call on Login/Signup)
  export const createNewConversation = async (token) => {
  const response = await axios.post(
    `${API_BASE_URL}/chat/create-conversation`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ✅ Upload files
export const uploadFiles = async (formData, token) => {
  if (!token) {
      throw new Error("🚨 No authentication token found!");
  }

  return await axios.post(`${API_BASE_URL}/files/upload-files`, formData, {
    headers: { 
      Authorization: `Bearer ${token}`, // ✅ Ensure token is passed
      "Content-Type": "multipart/form-data"
    },
    withCredentials: true, // <- ✅ important
  });
};

// rename conversations 
export const renameConversation = async (conversationId, newName, token) => {
  const response = await axios.put(
    `${API_BASE_URL}/chat/rename/${conversationId}`,
    { name: newName },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// soft delete function 
export const deleteConversation = async (id, token) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/chat/conversations/${id}/delete`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the backend response
  } catch (error) {
    console.error("❌ Error deleting conversation:", error);
    throw error;
  }
};

// voice upload 
// api.js
export const uploadFinalAudio = async (blob, token) => {
  try {
    const formData = new FormData();
    formData.append("audio", blob, "voice.webm");

    const res = await fetch(`${API_BASE_URL}/voice/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    return data.transcript;
  } catch (err) {
    console.error("❌ Final audio upload failed:", err);
    return "";
  }
};

// Send a message from voice (used by startRealtimeAI)
 
export const fetchUserDetails = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/userDetails`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

// guest mode 
export const sendGuestMessage = async (plainText, onStream) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/guest-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: plainText,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let suggestions = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          switch (data.type) {
            case 'start':
              onStream?.({
                type: 'start',
                data: data
              });
              break;
            case 'content':
              fullResponse += data.content;
              onStream?.({
                type: 'content',
                content: data.content,
                fullResponse: fullResponse
              });
              break;
            case 'end':
              suggestions = data.suggestions || [];
              onStream?.({
                type: 'end',
                fullResponse: data.full_response || fullResponse,
                suggestions: suggestions
              });
              break;
            case 'error':
              onStream?.({
                type: 'error',
                error: data.error
              });
              throw new Error(data.error);
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
        }
      }
    }

    return {
      response: fullResponse,
      suggestions: suggestions
    };
  } catch (error) {
    console.error("❌ Error sending guest message:", error);
    throw error;
  }
};

  