import { supabase } from '@/lib/supabase'

/**
 * Servicio para gestionar archivos privados en Supabase Storage.
 */
export class StorageService {
  private static readonly BUCKET_NAME = 'fotos_personas'
  private static readonly SIGNED_URL_TTL_SECONDS = 60 * 60

  /**
   * Convertir imagen a formato WebP.
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
   * Subir foto de persona a un bucket privado.
   *
   * Retorna el path interno del objeto, no una URL publica.
   */
  static async uploadPersonaFoto(
    file: File,
    userId: string,
    personaId?: string,
    sedeId?: string | null
  ): Promise<string> {
    try {
      const webpBlob = await this.convertToWebP(file)
      const timestamp = Date.now()
      const fileName = `${personaId || 'temp'}_${timestamp}.webp`
      const ownerSedeId = sedeId || await this.getUserSedeId(userId)
      const filePath = ownerSedeId
        ? `${ownerSedeId}/${userId}/${fileName}`
        : `${userId}/${fileName}`

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, webpBlob, {
          contentType: 'image/webp',
          upsert: false,
        })

      if (error) throw error

      return data.path
    } catch (error: any) {
      throw new Error('Error al subir foto: ' + error.message)
    }
  }

  /**
   * Crear una URL temporal para mostrar una foto privada.
   */
  static async createSignedUrl(pathOrUrl: string | null): Promise<string | null> {
    try {
      const filePath = this.extractFilePath(pathOrUrl)
      if (!filePath) return null

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, this.SIGNED_URL_TTL_SECONDS)

      if (error) throw error
      return data.signedUrl
    } catch (error) {
      console.warn('Error al crear URL firmada:', error)
      return null
    }
  }

  /**
   * Eliminar archivo de Storage usando path privado o URL publica antigua.
   */
  static async deleteFile(pathOrUrl: string): Promise<void> {
    try {
      const filePath = this.extractFilePath(pathOrUrl)
      if (!filePath) return

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) throw error
    } catch (error: any) {
      console.warn('Error al eliminar foto:', error.message)
    }
  }

  /**
   * Eliminar foto anterior y subir nueva.
   */
  static async replacePersonaFoto(
    oldPathOrUrl: string | null,
    newFile: File,
    userId: string,
    personaId?: string,
    sedeId?: string | null
  ): Promise<string> {
    if (oldPathOrUrl) {
      await this.deleteFile(oldPathOrUrl)
    }

    return await this.uploadPersonaFoto(newFile, userId, personaId, sedeId)
  }

  private static async getUserSedeId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('sede_id')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('No se pudo obtener sede del usuario:', error.message)
      return null
    }

    return data?.sede_id || null
  }

  /**
   * Acepta paths nuevos ("user/file.webp") y URLs publicas antiguas.
   */
  private static extractFilePath(pathOrUrl: string | null): string | null {
    if (!pathOrUrl) return null

    if (!pathOrUrl.includes('://')) {
      return pathOrUrl.split('?')[0]
    }

    if (!pathOrUrl.includes(`${this.BUCKET_NAME}/`)) {
      return null
    }

    const urlParts = pathOrUrl.split(`${this.BUCKET_NAME}/`)
    if (urlParts.length < 2) return null

    return urlParts[1].split('?')[0]
  }
}
