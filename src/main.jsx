import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
 import { Provider } from 'react-redux'
import App from './App.jsx'
import {store} from "./store/Store2.js"
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "675573596771-ooa4fuom0lbbv4cp13khq76897udqqll.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <Provider store={store}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
