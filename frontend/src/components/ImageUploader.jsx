import { useRef, useState } from 'react'
import { adminUploads } from '../api/admin.js'
import { readError } from '../api/client.js'
import styles from './ImageUploader.module.css'

const ACCEPT = 'image/jpeg,image/png,image/webp'
const MAX_BYTES = 5 * 1024 * 1024

export default function ImageUploader({ images, onAdd, onRemove, max = 8, disabled }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)

  const full = images.length >= max

  async function handleFiles(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''

    if (!files.length) return

    setError('')
    setUploading(true)

    try {
      for (const file of files) {
        if (images.length + 1 > max) break

        if (file.size > MAX_BYTES) {
          throw new Error(`${file.name} is larger than 5 MB.`)
        }

        const { uploadUrl, url } = await adminUploads.presign({
          contentType: file.type,
          size: file.size
        })

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        })

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name} (${response.status}).`)
        }

        await onAdd(url)
      }
    } catch (err) {
      setError(err.response ? readError(err) : err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(image) {
    setError('')
    setRemovingId(image.id)

    try {
      await onRemove(image)
    } catch (err) {
      setError(readError(err))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {images.map((image, index) => (
          <figure key={image.id} className={styles.tile}>
            <img src={image.url} alt="" className={styles.image} />

            {index === 0 && <span className={styles.cover}>Cover</span>}

            <button
              type="button"
              disabled={disabled || removingId === image.id}
              onClick={() => handleRemove(image)}
              className={styles.remove}
            >
              Remove
            </button>
          </figure>
        ))}

        {!full && (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className={styles.add}
          >
            {uploading ? 'Uploading' : 'Add image'}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleFiles}
        className={styles.input}
      />

      <p className={styles.hint}>
        JPEG, PNG or WebP, up to 5 MB. The first image is the one shown in the shop.
      </p>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
