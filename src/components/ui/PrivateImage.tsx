import React, { useEffect, useState } from 'react'
import { StorageService } from '@/services/storage.service'

interface PrivateImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  path: string | null | undefined
  fallback?: React.ReactNode
}

export const PrivateImage: React.FC<PrivateImageProps> = ({
  path,
  fallback = null,
  alt,
  ...imgProps
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadSignedUrl = async () => {
      if (!path) {
        setSignedUrl(null)
        return
      }

      const url = await StorageService.createSignedUrl(path)
      if (active) {
        setSignedUrl(url)
      }
    }

    loadSignedUrl()

    return () => {
      active = false
    }
  }, [path])

  if (!path || !signedUrl) {
    return <>{fallback}</>
  }

  return <img src={signedUrl} alt={alt} {...imgProps} />
}
