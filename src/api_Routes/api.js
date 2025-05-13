import axios from "axios";

// const API_BASE_URL = "https://quantumhash-backend-1.onrender.com/api"; // Replace with your backend URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Login API
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
    console.log("🔍 Raw Axios Response:", response); // Check raw response
    console.log("🔍 Response Data:", response.data); // Ensure .data exists

    return response.data; // ✅ Return actual data
  } catch (error) {
    if (error.response) {
      console.error("❌ Login API Error (Response):", error.response.data);
    } else if (error.request) {
      console.error("❌ Login API Error (No Response):", error.request);
    } else {
      console.error("❌ Login API Error (Other):", error.message);
    }
    return null; // Prevents breaking the app
  }
};



// Signup API
export const signup = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, credentials);
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
 

export const sendMessage = async (
  conversationId,
  message,
  userId,
  token,
  extracted_summary_raw = "",
  uploaded_file_metadata = [] // ⬅️ New param!
) => {
  const response = await axios.post(
    `${API_BASE_URL}/chat`,
    {
      userMessage: message,
      conversation_id: conversationId,
      user_id: userId,
      extracted_summary: extracted_summary_raw,
      uploaded_file_metadata // ✅ Pass this to backend
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
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
export const deleteConversation = async (id, token, dispatch) => {
  try {
    await axios.patch(`${API_BASE_URL}/chat/conversations/${id}/delete`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
 
    
  } catch (error) {
    console.error("❌ Error deleting conversation:", error);
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
 


  