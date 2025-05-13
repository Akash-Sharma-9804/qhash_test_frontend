// import { createSlice } from "@reduxjs/toolkit";
// import { createNewConversation ,login, signup } from "../api_Routes/api";

// const initialState = {
//   user: null,
//   token: null,
//   conversationId: null, // Store the latest conversation ID
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.conversationId = action.payload.conversationId;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.conversationId = null;
//     },
//   },
// });

// export const { setUser, logout } = authSlice.actions;

// // Async Thunk to handle Login + Auto-create Conversation
// // export const loginUser = (credentials) => async (dispatch) => {
// //   try {
// //     const data = await login(credentials);

// //     if (!data.token) {
// //       throw new Error("No token received from backend");
// //     }

// //     console.log("✅ Received Token:", data.token);

// //     localStorage.setItem("token", data.token);
// //     console.log("✅ Token stored:", localStorage.getItem("token"));

// //     const newConversation = await createNewConversation(data.token);

// //     dispatch(setUser({ 
// //       user: data.user, 
// //       token: data.token, 
// //       conversationId: newConversation.id 
// //     }));

// //   } catch (error) {
// //     console.error("❌ Login failed:", error);
// //   }
// // };

// export const loginUser = (credentials) => async (dispatch) => {
//   try {
//     const data = await login(credentials); // this has token, user, conversation_id

//     console.log("🔍 Raw API Response:", data);

//     if (!data?.token || !data?.user?.user_id || !data?.conversation_id) {
//       throw new Error("❌ Missing token, user_id, or conversation_id");
//     }

//     console.log("✅ Received Token:", data.token);
//     console.log("✅ Conversation ID from Login:", data.conversation_id);

//     dispatch(setUser({
//       user: data.user,
//       token: data.token,
//       conversationId: data.conversation_id,
//     }));

//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user_id", data.user.user_id);
//     localStorage.setItem("conversation_id", data.conversation_id);

//     return { payload: data }; // ✅ Pass entire data as payload
//   } catch (error) {
//     console.error("❌ Login failed:", error);
//     return { error: error.message };
//   }
// };









// // Async Thunk to handle Signup + Auto-create Conversation
// export const signupUser = (credentials) => async (dispatch) => {
//   try {
//     const data = await signup(credentials);
//     const newConversation = await createNewConversation(data.token);

//     dispatch(setUser({ user: data.user, token: data.token, conversationId: newConversation.id }));
//   } catch (error) {
//     console.error("Signup failed:", error);
//   }
// };

// export default authSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import { createNewConversation, login, signup } from "../api_Routes/api";

// Hydrate state from localStorage
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  conversationId: localStorage.getItem("conversation_id") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.conversationId = action.payload.conversationId;

      // ✅ Save to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("conversation_id", action.payload.conversationId);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.conversationId = null;

      // ✅ Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("conversation_id");
    },
  },
});

export const { setUser, logout } = authSlice.actions;

// ✅ Login Thunk
export const loginUser = (credentials) => async (dispatch) => {
  try {
    const data = await login(credentials); // this has token, user, conversation_id

    console.log("🔍 Raw API Response:", data);

    if (!data?.token || !data?.user?.user_id || !data?.conversation_id) {
      throw new Error("❌ Missing token, user_id, or conversation_id");
    }

    console.log("✅ Received Token:", data.token);
    console.log("✅ Conversation ID from Login:", data.conversation_id);

    dispatch(setUser({
      user: data.user,
      token: data.token,
      conversationId: data.conversation_id,
    }));

    return { payload: data }; // ✅ Return the full data
  } catch (error) {
    console.error("❌ Login failed:", error);
    return { error: error.message };
  }
};

// ✅ Signup Thunk
export const signupUser = (credentials) => async (dispatch) => {
  try {
    const data = await signup(credentials);
    

    dispatch(setUser({
      user: data.user,
      token: data.token,
      conversationId: data.conversation_id,
    }));
    return { payload: data };
  } catch (error) {
    console.error("❌ Signup failed:", error);
    return { error: error.message };  
  }
};

export default authSlice.reducer;
