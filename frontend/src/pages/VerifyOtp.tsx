import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Leaf, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '../lib/authContext'
import { api } from '../lib/api'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Email is passed via navigation state from Signup
  const email: string = (location.state as { email?: string })?.email ?? ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')
  const [countdown, setCountdown] = useState(60)

  // Countdown for resend button
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function handleDigit(index: number, value: string) {
    const ch = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = ch
    setDigits(next)
    if (ch && index < 5) refs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) return
    setSubmitting(true)
    setError('')
    try {
      const payload = await api.verifyOtp(email, code)
      login(payload)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function onResend() {
    setResending(true)
    setResendMsg('')
    setError('')
    try {
      await api.resendOtp(email)
      setResendMsg('A new code has been sent.')
      setCountdown(60)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground mb-3">
            <Leaf className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">GoWize</h1>
          <p className="text-sm text-muted-foreground">Verify your email</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter verification code</CardTitle>
            <CardDescription>
              We sent a 6-digit code to{' '}
              <span className="font-medium text-foreground">{email || 'your email'}</span>.
              It expires in 10 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <Input
                    key={i}
                    ref={(el) => { refs.current[i] = el }}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>

              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              {resendMsg && <p className="text-xs text-emerald-600 text-center">{resendMsg}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting || digits.join('').length < 6}
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Verify'}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {countdown}s
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onResend}
                    disabled={resending}
                  >
                    {resending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
                    Resend code
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Wrong email?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up again
          </Link>
        </p>
      </div>
    </div>
  )
}
