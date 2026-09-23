import FieldShell from './FieldShell'
import { uploadImage } from '../../adminApi'

const StringImageArrayField = ({ field, value, onChange, error }) => {
  const items = value || []

  const addFromFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const path = await uploadImage(field.imageDir, file)
      onChange([...items, path])
    } catch (err) {
      window.alert(`upload failed: ${err.message}`)
    } finally {
      e.target.value = ''
    }
  }
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <FieldShell field={field} error={error}>
      <div className="admin-image-grid">
        {items.map((path, i) => (
          <div key={path + i} className="admin-image-grid-item">
            <img src={path} alt="" />
            <div className="admin-image-actions">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
              <button type="button" onClick={() => removeItem(i)}>remove</button>
            </div>
          </div>
        ))}
      </div>
      <input type="file" accept="image/*" onChange={addFromFile} />
    </FieldShell>
  )
}

export default StringImageArrayField
