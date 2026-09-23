import { useState, useEffect } from 'react'
import FieldShell from './FieldShell'
import { uploadImage, listImages } from '../../adminApi'

// Collapsed to a single clickable box: the current photo (or a placeholder)
// when idle, opening into upload/choose-existing/remove controls when
// clicked. Keeps the common case (this field already has the right photo)
// visually out of the way instead of always showing the full toolbar.
const ImagePickerField = ({ field, value, onChange, error }) => {
  const [managing, setManaging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showExisting, setShowExisting] = useState(false)
  const [existing, setExisting] = useState([])

  useEffect(() => {
    if (!showExisting) return
    listImages(field.imageDir).then(setExisting).catch(() => setExisting([]))
  }, [showExisting, field.imageDir])

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const path = await uploadImage(field.imageDir, file)
      onChange(path)
      setManaging(false)
      setShowExisting(false)
    } catch (err) {
      window.alert(`upload failed: ${err.message}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (!managing) {
    return (
      <FieldShell field={field} error={error}>
        <button type="button" className="admin-image-box" onClick={() => setManaging(true)}>
          {value ? <img src={value} alt="" /> : <span className="admin-image-box-placeholder">+ upload a photo</span>}
        </button>
      </FieldShell>
    )
  }

  return (
    <FieldShell field={field} error={error}>
      <div className="admin-image-manager">
        <div className="admin-image-manager-header">
          <span>{value ? value : 'no image selected'}</span>
          <button type="button" onClick={() => setManaging(false)}>done</button>
        </div>
        {value ? (
          <div className="admin-image-preview">
            <img src={value} alt="" />
          </div>
        ) : null}
        <div className="admin-image-actions">
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
          <button type="button" onClick={() => setShowExisting((s) => !s)}>
            {showExisting ? 'hide existing images' : 'choose existing image'}
          </button>
          {value ? (
            <button type="button" onClick={() => onChange('')}>
              remove
            </button>
          ) : null}
        </div>
        {showExisting ? (
          <div className="admin-image-grid">
            {existing.map((path) => (
              <button
                type="button"
                key={path}
                className={`admin-image-thumb ${path === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(path)
                  setShowExisting(false)
                  setManaging(false)
                }}
              >
                <img src={path} alt="" />
              </button>
            ))}
            {existing.length === 0 ? <div>no images in images/{field.imageDir} yet</div> : null}
          </div>
        ) : null}
      </div>
    </FieldShell>
  )
}

export default ImagePickerField
