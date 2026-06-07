import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, ChevronLeft, Loader2 } from 'lucide-react'
import { fileToCompressedBlob } from '../lib/photo'
import { api } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CapturePage() {
  const navigate = useNavigate()
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePhoto(file: File) {
    setError(null)
    setProcessing(true)
    try {
      const blob = await fileToCompressedBlob(file)
      const result = await api.scan(blob)
      sessionStorage.setItem('scanResult', JSON.stringify(result))
      navigate('/capture/confirm')
    } catch (e) {
      console.error(e)
      setError("Couldn't scan that image. Make sure the backend is running, then try again.")
      setProcessing(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handlePhoto(file)
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="-ml-2">
            <ChevronLeft className="size-6" />
          </Button>
          <h1 className="font-semibold text-lg">Add an item</h1>
        </div>
      </header>

      <div className="px-4 py-6 pb-24">
        <p className="text-sm text-muted-foreground mb-6">
          Take or upload a photo. We'll read the barcode and expiry date for you.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={processing}
            className="flex flex-col items-center justify-center aspect-square bg-primary/5 border-2 border-primary/20 rounded-2xl hover:bg-primary/10 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="size-9 text-primary mb-2 animate-spin" />
            ) : (
              <Camera className="size-9 text-primary mb-2" />
            )}
            <span className="font-semibold">{processing ? 'Processing…' : 'Take photo'}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Use camera</span>
          </button>
          <button
            onClick={() => uploadRef.current?.click()}
            disabled={processing}
            className="flex flex-col items-center justify-center aspect-square bg-blue-500/5 border-2 border-blue-500/20 rounded-2xl hover:bg-blue-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <ImageIcon className="size-9 text-blue-600 mb-2" />
            <span className="font-semibold">Upload</span>
            <span className="text-xs text-muted-foreground mt-0.5">From gallery</span>
          </button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="hidden"
        />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <Card className="mt-8 gap-2 py-4">
          <div className="px-4">
            <h3 className="font-semibold text-sm mb-2">Tips for a clean scan</h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Make sure the expiry date is clearly visible</li>
              <li>Include the barcode if you can &mdash; we'll auto-fill the product name</li>
              <li>Avoid glare and shadows on the label</li>
            </ul>
          </div>
        </Card>
      </div>
    </>
  )
}
