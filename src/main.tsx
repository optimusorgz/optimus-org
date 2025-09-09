import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="380989427015-pvnh85g5e986rc3rranlpulp3hr56703.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
