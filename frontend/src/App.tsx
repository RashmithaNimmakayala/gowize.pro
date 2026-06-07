import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { DashboardPage } from './pages/Dashboard'
import { CapturePage } from './pages/Capture'
import { ConfirmCardPage } from './pages/ConfirmCard'
import { ItemDetailPage } from './pages/ItemDetail'
import { SettingsPage } from './pages/Settings'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/Signup'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { BottomNav } from './components/BottomNav'
import { Sidebar } from './components/Sidebar'
import { ItemsProvider } from './lib/itemsStore'
import { ToastProvider } from './components/Toast'

/** App chrome (sidebar on desktop, bottom nav on mobile) wrapping the main pages. */
function AppLayout() {
  return (
    <div className="min-h-screen bg-muted/30 md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <ItemsProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone, full-screen (no app chrome) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Everything else inside the app shell */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/capture" element={<CapturePage />} />
              <Route path="/capture/confirm" element={<ConfirmCardPage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ItemsProvider>
  )
}

export default App
