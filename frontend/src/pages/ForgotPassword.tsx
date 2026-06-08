import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Loader2, MailCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    // UI-only for now — real reset email is wired up later.
    window.setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground mb-3">
            <Leaf className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">GoWize</h1>
          <p className="text-sm text-muted-foreground">Reset your password</p>
        </div>

        <Card>
          {sent ? (
            <CardContent className="flex flex-col items-center text-center gap-3 py-2">
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                <MailCheck className="size-6" />
              </div>
              <div>
                <h2 className="font-semibold">Check your email</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  If an account exists for <span className="font-medium text-foreground">{email}</span>,
                  we've sent a link to reset your password.
                </p>
              </div>
              <Button asChild className="w-full mt-2">
                <Link to="/login">Back to sign in</Link>
              </Button>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Use a different email
              </button>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Forgot password?</CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a link to reset it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Send reset link'}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>

        <Link
          to="/login"
          className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      </div>
    </div>
  )
}
