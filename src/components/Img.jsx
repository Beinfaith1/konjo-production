import { useState } from 'react'
import { photoUrl, srcSet } from '../data/projects'
export default function Img({ photo, size = 'm', sizes = '100vw', eager = false, className = '', fit, ...rest }) {
  const [ok, setOk] = useState(false)
  return (
    <img
      ref={(el) => { if (el?.complete && el.naturalWidth) setOk(true) }}
      className={`img ${ok ? 'is-loaded' : ''} ${className}`}
      src={photoUrl(photo, size)} srcSet={srcSet(photo)} sizes={sizes}
      width={photo.w} height={photo.h} alt={photo.alt}
      loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : undefined}
      onLoad={() => setOk(true)} style={fit ? { objectFit: fit } : undefined} {...rest}
    />
  )
}
