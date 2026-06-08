import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, ChevronLeft, Loader2, X, ScanLine } from 'lucide-react'
import { fileToCompressedBlob } from '../lib/photo'
import { api } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Shot {
  id: string
  file: File
  previewUrl: string
}

export function CapturePage() {
  const navigate = useNavigate()
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [shots, setShots] = useState<Shot[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  function addFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return
    setError(null)
    setShots((prev) => [
      ...prev,
      ...images.map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) })),
    ])
  }

  function removeShot(id: string) {
    setShots((prev) => {
      const target = prev.find((s) => s.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((s) => s.id !== id)
    })
  }

  async function scanShots() {
    if (shots.length === 0 || processing) return
    setError(null)
    setProcessing(true)
    try {
      const blobs = await Promise.all(shots.map((s) => fileToCompressedBlob(s.file)))
      const result = await api.scan(blobs)
      sessionStorage.setItem('scanResult', JSON.stringify(result))
      shots.forEach((s) => URL.revokeObjectURL(s.previewUrl))
      navigate('/capture/confirm')
    } catch (e) {
      console.error(e)
      setError("Couldn't scan those photos. Make sure the backend is running, then try again.")
      setProcessing(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    addFiles(files)
    e.target.value = ''
  }

  function onDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (!processing) setDragActive(true)
  }

  function onDragLeave(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setDragActive(false)
  }

  function onDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setDragActive(false)
    if (processing) return
    addFiles(Array.from(e.dataTransfer.files ?? []))
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-2xl flex items-center gap-2 px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="-ml-2">
            <ChevronLeft className="size-6" />
          </Button>
          <h1 className="font-semibold text-lg">Add an item</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-24 md:pb-10">
        <p className="text-sm text-muted-foreground mb-6">
          Add one or more photos &mdash; e.g. the front label and the back where the expiry
          date is. We'll read across all of them and fill in the details for you.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {shots.length > 0 && (
          <div className="mb-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {shots.map((shot, i) => (
              <div key={shot.id} className="relative aspect-square rounded-xl overflow-hidden border">
                <img src={shot.previewUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeShot(shot.id)}
                  disabled={processing}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-50"
                >
                  <X className="size-3.5" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={processing}
            className="flex flex-col items-center justify-center aspect-square bg-primary/5 border-2 border-primary/20 rounded-2xl hover:bg-primary/10 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Camera className="size-9 text-primary mb-2" />
            <span className="font-semibold">{shots.length > 0 ? 'Add another' : 'Take photo'}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Use camera</span>
          </button>
          <button
            onClick={() => uploadRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            disabled={processing}
            className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 ${
              dragActive
                ? 'bg-blue-500/15 border-blue-500/50'
                : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
            }`}
          >
            <ImageIcon className="size-9 text-blue-600 mb-2" />
            <span className="font-semibold">{dragActive ? 'Drop to upload' : 'Upload'}</span>
            <span className="text-xs text-muted-foreground mt-0.5">From gallery, or drag & drop</span>
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
          multiple
          onChange={onFileChange}
          className="hidden"
        />

        {shots.length > 0 && (
          <Button onClick={scanShots} disabled={processing} className="w-full mt-4 h-12 text-base">
            {processing ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Scanning…
              </>
            ) : (
              <>
                <ScanLine className="size-5" />
                Scan {shots.length} photo{shots.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        <Card className="mt-8 gap-2 py-4">
          <div className="px-4">
            <h3 className="font-semibold text-sm mb-2">Tips for a clean scan</h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Add multiple photos if the info is split across sides &mdash; e.g. front + back</li>
              <li>Make sure the expiry date is clearly visible in at least one photo</li>
              <li>Include the barcode if you can &mdash; we'll auto-fill the product name</li>
              <li>Avoid glare and shadows on the label</li>
            </ul>
          </div>
        </Card>
      </div>
    </>
  )
}
