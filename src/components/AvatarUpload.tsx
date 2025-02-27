import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentUrl?: string
  userName: string
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({ currentUrl, userName, onUploadComplete }: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  })
  const [loading, setLoading] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Obtenir les initiales pour l'avatar par défaut
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  // Gérer la sélection du fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier le type et la taille
      try {
        if (!file.type.startsWith('image/')) {
          throw new Error('Veuillez sélectionner une image')
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('L\'image ne doit pas dépasser 5MB')
        }

        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
        setIsOpen(true)
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  // Recadrer l'image
  const cropImage = useCallback(async () => {
    if (!imageRef.current || !selectedFile) return null

    const canvas = document.createElement('canvas')
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height
    const pixelRatio = window.devicePixelRatio
    
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    // Convertir le canvas en blob
    return new Promise<File>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], selectedFile.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(file)
          }
        },
        'image/jpeg',
        1
      )
    })
  }, [crop, selectedFile])

  // Sauvegarder l'avatar
  const handleSave = async () => {
    try {
      setLoading(true)
      const croppedImage = await cropImage()
      if (!croppedImage) throw new Error('Erreur lors du recadrage')

      const url = await auth.uploadAvatar(croppedImage)
      onUploadComplete?.(url)
      setIsOpen(false)
      toast.success('Avatar mis à jour avec succès')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'avatar')
    } finally {
      setLoading(false)
    }
  }

  // Supprimer l'avatar
  const handleDelete = async () => {
    try {
      setLoading(true)
      const url = await auth.deleteAvatar()
      onUploadComplete?.(url)
      toast.success('Avatar supprimé avec succès')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression de l\'avatar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentUrl} alt={userName} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <label className="cursor-pointer p-2">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <span className="text-white text-sm">Modifier</span>
          </label>
        </div>
      </div>

      {currentUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          Supprimer l'avatar
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'avatar</DialogTitle>
            <DialogDescription>
              Recadrez votre image pour l'adapter au format avatar
            </DialogDescription>
          </DialogHeader>
          
          {previewUrl && (
            <div className="mt-4">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Aperçu"
                  className="max-h-[400px] w-auto"
                />
              </ReactCrop>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
