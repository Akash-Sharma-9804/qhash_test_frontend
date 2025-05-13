// import { createSlice } from "@reduxjs/toolkit";


// const initialState = {
//   conversations: [],
//   activeConversation: null,
//   messages: {}, // ✅ Per-conversation messages
// };

// const chatSlice2 = createSlice({
//   name: "chat",
//   initialState,
//   reducers: {
//     setConversations: (state, action) => {
//       state.conversations = Array.isArray(action.payload) ? action.payload : [action.payload];
//     },
//     setActiveConversation: (state, action) => {
//       state.activeConversation = action.payload;
//       if (!state.messages[action.payload]) {
//         state.messages[action.payload] = [];
//       }
//     },
//     addConversation: (state, action) => {
//       state.conversations.unshift(action.payload);
//     },
//     setMessages: (state, action) => {
//       const { conversationId, messages } = action.payload;
//       console.log("📦 Setting messages in Redux for:", conversationId, messages); // <-- Add this
//       state.messages[conversationId] = messages;
//     },
//     removeConversationFromRedux: (state, action) => {
//       state.conversations = state.conversations.filter(
//         (conv) => conv.id !== action.payload
//       );
//     },    
//     renameConversationRedux: (state, action) => {
//       const { id, newName } = action.payload;
//       state.conversations = state.conversations.map((conv) =>
//         conv.id === id ? { ...conv, name: newName } : conv
//       );
//     },
    
//     addMessage: (state, action) => {
//       const { conversationId, message } = action.payload;
    
//       if (!state.messages[conversationId]) {
//         state.messages[conversationId] = [];
//       }
    
//       state.messages[conversationId].push(message);
//     }
//     ,
//     updateMessage: (state, action) => {
//       const { conversationId, id, response } = action.payload;
    
//       if (!state.messages[conversationId]) return;
    
//       state.messages[conversationId] = state.messages[conversationId].map((msg) =>
//         msg.id === id ? { ...msg, response } : msg
//       );
//     }
    
// ,  clearChatData: (state) => {
//   state.conversations = [];
//   state.activeConversation = null;
//   state.messages = {};
//   localStorage.removeItem("conversation_id"); // fix key name
// },

//     resetChat: (state) => {
//       state.activeConversation = null;
//     },
//   },
// });

// export const {
//   setConversations,
//   setActiveConversation,
//   addConversation,
//   setMessages,
//   addMessage,
//   updateMessage,
//   clearChatData,
//   renameConversationRedux,
//   removeConversationFromRedux,
//   resetChat,
// } = chatSlice2.actions;

// export default chatSlice2.reducer;


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {}, // ✅ Per-conversation messages
};

const chatSlice2 = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = Array.isArray(action.payload) ? action.payload : [action.payload];
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      if (!state.messages[action.payload]) {
        state.messages[action.payload] = [];
      }
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      console.log("📦 Setting messages in Redux for:", conversationId, messages); // <-- Add this
      state.messages[conversationId] = messages;
    },
    removeConversationFromRedux: (state, action) => {
      state.conversations = state.conversations.filter(
        (conv) => conv.id !== action.payload
      );
    },
    renameConversationRedux: (state, action) => {
      const { id, newName } = action.payload;
      state.conversations = state.conversations.map((conv) =>
        conv.id === id ? { ...conv, name: newName } : conv
      );
    },

    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Adding files to the message object (if files are present)
      const newMessage = {
        ...message,
        files: message.files || [], // Ensure files array is present
      };

      state.messages[conversationId].push(newMessage);
    },

    updateMessage: (state, action) => {
      const { conversationId, id, response, files } = action.payload;
    
      if (!state.messages[conversationId]) return;
    
      state.messages[conversationId] = state.messages[conversationId].map((msg) =>
        msg.id === id
          ? {
              ...msg,
              ...(response && { response }),
              ...(files && { files }),
            }
          : msg
      );
    },
    

    clearChatData: (state) => {
      state.conversations = [];
      state.activeConversation = null;
      state.messages = {};
      localStorage.removeItem("conversation_id"); // fix key name
    },

    resetChat: (state) => {
      state.activeConversation = null;
    },
    removeMessage: (state, action) => {
      const { conversationId, id } = action.payload;
      const conversation = state.messages[conversationId];
      if (conversation) {
        state.messages[conversationId] = conversation.filter(
          (msg) => msg.id !== id
        );
      }
    },
    
  },
});

export const {
  setConversations,
  setActiveConversation,
  addConversation,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  clearChatData,
  renameConversationRedux,
  removeConversationFromRedux,
  resetChat,
} = chatSlice2.actions;

export default chatSlice2.reducer;
