import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletContextProvider } from './context/WalletContextProvider'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </StrictMode>,
)
