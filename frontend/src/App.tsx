import React, { useState } from 'react'
import { StoreProvider } from './StoreProvider'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/AdminDashboard'
import AuthPage from './pages/AuthPage'

type View = 'landing' | 'login' | 'admin'

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing')

  return (
    <StoreProvider>
      {view === 'landing' && (
        <LandingPage onAdminClick={() => setView('login')} />
      )}
      {view === 'login' && (
        <AuthPage
          onSuccess={() => setView('admin')}
          onBack={() => setView('landing')}
        />
      )}
      {view === 'admin' && (
        <AdminDashboard onLogout={() => setView('landing')} />
      )}
    </StoreProvider>
  )
}

export default App
