import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardPage } from './pages/Dashboard'
import { CapturePage } from './pages/Capture'
import { ConfirmCardPage } from './pages/ConfirmCard'
import { ItemDetailPage } from './pages/ItemDetail'
import { SettingsPage } from './pages/Settings'
import { BottomNav } from './components/BottomNav'
import { Sidebar } from './components/Sidebar'
import { ItemsProvider } from './lib/itemsStore'
import { ToastProvider } from './components/Toast'

function App() {
  return (
    <ItemsProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-muted/30 md:flex">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/capture" element={<CapturePage />} />
                <Route path="/capture/confirm" element={<ConfirmCardPage />} />
                <Route path="/items/:id" element={<ItemDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
            <BottomNav />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ItemsProvider>
  )
}

export default App
