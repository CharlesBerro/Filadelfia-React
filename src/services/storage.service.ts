import { supabase } from '@/lib/supabase'

/**
 * Servicio para gestionar archivos en Supabase Storage
 */
export class StorageService {
    private static readonly BUCKET_NAME = 'fotos_personas'

    /**
     * Convertir imagen a formato WebP
     */
    static async convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('No se pudo obtener contexto del canvas'))
                    return
                }

                ctx.drawImage(img, 0, 0)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Error al convertir imagen a WebP'))
                        }
                    },
                    'image/webp',
                    quality
                )
            }

            img.onerror = () => reject(new Error('Error al cargar imagen'))
            img.src = URL.createObjectURL(file)
        })
    }

    /**
     * Subir foto de persona a Supabase Storage
     * 
     * @param file - Archivo de imagen
     * @param userId - ID del usuario que sube la foto
     * @param personaId - ID de la persona (opcional, usar 'temp' si aún no existe)
     * @returns URL pública de la imagen
     */
    static async uploadPersonaFoto(
        file: File,
        userId: string,
        personaId?: string
    ): Promise<string> {
        try {
            // Convertir a WebP
            const webpBlob = await this.convertToWebP(file)

            // Generar nombre único
            const timestamp = Date.now()
            const fileName = `${personaId || 'temp'}_${timestamp}.webp`
            const filePath = `${userId}/${fileName}`

            // Subir a Storage
            const { data, error } = await supabase.storage
                .from(this.BUCKET_NAME)
                .upload(filePath, webpBlob, {
                    contentType: 'image/webp',
                    upsert: false
                })

            if (error) throw error

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(this.BUCKET_NAME)
                .getPublicUrl(data.path)

            return publicUrl
        } catch (error: any) {
            throw new Error('Error al subir foto: ' + error.message)
        }
    }

    /**
     * Eliminar archivo de Storage usando su URL
     */
    static async deleteFile(url: string): Promise<void> {
        try {
            if (!url || !url.includes(this.BUCKET_NAME)) {
                return // No es una URL de nuestro bucket
            }

            // Extraer path del archivo desde la URL
            const urlParts = url.split(`${this.BUCKET_NAME}/`)
            if (urlParts.length < 2) return

            const filePath = urlParts[1].split('?')[0] // Remover query params si existen

            const { error } = await supabase.storage
                .from(this.BUCKET_NAME)
                .remove([filePath])

            if (error) throw error
        } catch (error: any) {
            // No lanzar error si el archivo no existe
            console.warn('Error al eliminar foto:', error.message)
        }
    }

    /**
     * Eliminar foto anterior y subir nueva
     */
    static async replacePersonaFoto(
        oldUrl: string | null,
        newFile: File,
        userId: string,
        personaId?: string
    ): Promise<string> {
        // Eliminar foto anterior si existe
        if (oldUrl) {
            await this.deleteFile(oldUrl)
        }

        // Subir nueva foto
        return await this.uploadPersonaFoto(newFile, userId, personaId)
    }
}
