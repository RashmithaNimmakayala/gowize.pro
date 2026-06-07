import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { PasswordInput } from '../components/PasswordInput'
import { GoogleIcon } from '../components/GoogleIcon'
import { useToast } from '../components/Toast'
import { COUNTRIES, STATES_BY_COUNTRY } from '../lib/locations'
import { cn } from '@/lib/utils'

const COUNTRY_CODES = [
  { flag: '🇮🇳', dial: '+91', name: 'India' },
  { flag: '🇺🇸', dial: '+1', name: 'United States' },
  { flag: '🇬🇧', dial: '+44', name: 'United Kingdom' },
  { flag: '🇦🇪', dial: '+971', name: 'UAE' },
  { flag: '🇦🇺', dial: '+61', name: 'Australia' },
  { flag: '🇸🇬', dial: '+65', name: 'Singapore' },
  { flag: '🇩🇪', dial: '+49', name: 'Germany' },
  { flag: '🇫🇷', dial: '+33', name: 'France' },
  { flag: '🇯🇵', dial: '+81', name: 'Japan' },
  { flag: '🇨🇳', dial: '+86', name: 'China' },
  { flag: '🇧🇷', dial: '+55', name: 'Brazil' },
  { flag: '🇿🇦', dial: '+27', name: 'South Africa' },
  { flag: '🇵🇰', dial: '+92', name: 'Pakistan' },
  { flag: '🇧🇩', dial: '+880', name: 'Bangladesh' },
]

export function SignupPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [mobile, setMobile] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [stateName, setStateName] = useState('')
  const [country, setCountry] = useState('India')
  const [zipcode, setZipcode] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [issues, setIssues] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const mismatch = confirm.length > 0 && password !== confirm
  const stateOptions = STATES_BY_COUNTRY[country] ?? []

  const pwChecks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
    { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const passwordValid = pwChecks.every((c) => c.ok)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    // Collect everything wrong so the dialog can explain it all at once.
    const found = pwChecks.filter((c) => !c.ok).map((c) => `Password needs ${c.label.toLowerCase()}`)
    if (password !== confirm) found.push('Password and confirmation must match')
    if (found.length > 0) {
      setIssues(found)
      setDialogOpen(true)
      return
    }

    setSubmitting(true)
    // UI-only for now — real account creation is wired up later.
    window.setTimeout(() => {
      setSubmitting(false)
      toast.show('Sign-up is UI-only for now')
      navigate('/')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground mb-3">
            <Leaf className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">GoWize</h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Start tracking what expires before it does.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => toast.show('Google sign-up coming soon')}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Jane Doe"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  required
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  aria-invalid={password.length > 0 && !passwordValid}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {pwChecks.map((c) => (
                      <li
                        key={c.label}
                        className={cn(
                          'flex items-center gap-1.5 text-xs',
                          c.ok ? 'text-emerald-600' : 'text-muted-foreground',
                        )}
                      >
                        {c.ok ? (
                          <Check className="size-3.5" />
                        ) : (
                          <X className="size-3.5 opacity-50" />
                        )}
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <PasswordInput
                  id="confirm"
                  required
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  aria-invalid={mismatch}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {mismatch && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile">Mobile number</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-28 shrink-0" aria-label="Country code">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.dial} value={c.dial}>
                          {c.flag} {c.dial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="mobile"
                    type="tel"
                    required
                    placeholder="98765 43210"
                    autoComplete="tel"
                    className="flex-1"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr1">Address line 1</Label>
                <Input
                  id="addr1"
                  required
                  placeholder="House no., street"
                  autoComplete="address-line1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr2">
                  Address line 2 <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="addr2"
                  placeholder="Apartment, landmark"
                  autoComplete="address-line2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  {stateOptions.length > 0 ? (
                    <Select value={stateName} onValueChange={setStateName}>
                      <SelectTrigger id="state" className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="state"
                      required
                      placeholder="State / region"
                      autoComplete="address-level1"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="zip">Zipcode</Label>
                  <Input
                    id="zip"
                    required
                    placeholder="ZIP / PIN"
                    autoComplete="postal-code"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={country}
                  onValueChange={(v) => {
                    setCountry(v)
                    setStateName('') // states differ per country
                  }}
                >
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Create account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password requirements not met</DialogTitle>
            <DialogDescription>
              Please fix the following before creating your account:
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {issues.map((i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <X className="size-4 text-destructive shrink-0 mt-0.5" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Got it</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
