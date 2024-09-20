//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from "./components/ui/sonner"
import {SocketProvider} from "./context/socketContext.jsx";
createRoot(document.getElementById('root')).render(
  //<StrictMode>
  
  <SocketProvider>
    <App />
    <Toaster  duration={1500} />
    </SocketProvider>
    
  //</StrictMode>,
)
