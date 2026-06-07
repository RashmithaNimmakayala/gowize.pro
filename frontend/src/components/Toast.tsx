import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

interface ToastState {
  show: (message: string) => void
}

const ToastContext = createContext<ToastState | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const show = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(t)
  }, [visible, message])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
          visible ? 'opacity-100 translate-y-0 bottom-24' : 'opacity-0 translate-y-3 bottom-20'
        }`}
        role="status"
        aria-live="polite"
      >
        {message && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-full shadow-lg text-sm font-medium">
            <Check size={16} className="text-emerald-400" />
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
