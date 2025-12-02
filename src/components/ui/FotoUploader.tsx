// src/components/ui/FotoUploader.tsx
import React, { useState } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { StorageService } from '@/services/storage.service'
import { supabase } from '@/lib/supabase'

/**
 * Componente para subir foto de perfil a Supabase Storage
 * 
 * ¿Cómo funciona?
 * 1. Usuario selecciona imagen
 * 2. Se comprime si es > 1MB
 * 3. Se convierte a WebP (85% calidad)
 * 4. Se sube a Supabase Storage
 * 5. Se retorna la URL pública
 * 
 * Ventajas vs Base64:
 * - No llena localStorage
 * - Más rápido (CDN)
 * - Mejor compresión (WebP)
 * - Escalable
 */

interface FotoUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  personaId?: string // Opcional: ID de la persona (si ya existe)
}

export const FotoUploader: React.FC<FotoUploaderProps> = ({
  value,
  onChange,
  personaId
}) => {
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }

    setLoading(true)

    try {
      // Opciones de compresión
      const options = {
        maxSizeMB: 1,          // Máximo 1MB
        maxWidthOrHeight: 1920, // Máxima resolución
        useWebWorker: true,
        fileType: file.type as string
      }

      // Comprimir imagen si es mayor a 1MB
      let fileToUpload = file

      if (file.size > 1024 * 1024) {
        try {
          fileToUpload = await imageCompression(file, options)
        } catch (error) {
          console.error('Error en compresión, usando original:', error)
          // Si falla la compresión, intentamos usar la original si no es gigante
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('La imagen es demasiado grande y no se pudo comprimir')
          }
        }
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No autenticado')
      }

      // Subir a Supabase Storage (reemplaza foto anterior si existe)
      const publicUrl = await StorageService.replacePersonaFoto(
        value, // URL anterior (se eliminará)
        fileToUpload,
        user.id,
        personaId
      )

      onChange(publicUrl)
      setLoading(false)
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert(error.message || 'Error al subir la imagen')
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      setLoading(true)
      await StorageService.deleteFile(value)
      onChange(null)
    } catch (error) {
      console.error('Error removing image:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Foto de Perfil
      </label>

      <div className="flex items-center gap-4">
        {/* Preview de la foto */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-green-200 flex items-center justify-center">
            {value ? (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Botón para quitar foto */}
          {value && !loading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input de archivo */}
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Subiendo...' : 'Subir Foto'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Máximo 2MB • JPG, PNG o GIF
          </p>
          <p className="text-xs text-gray-400">
            Se convertirá a WebP automáticamente
          </p>
        </div>
      </div>
    </div>
  )
}