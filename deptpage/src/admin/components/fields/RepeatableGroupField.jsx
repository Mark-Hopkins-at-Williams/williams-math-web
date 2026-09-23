import FieldShell from './FieldShell'
import { uploadImage } from '../../adminApi'

// Deliberately doesn't go through the generic field dispatcher (which would
// create a circular import): subfields here are always simple leaves
// (text / image), matching every real use (e.g. student-group leadership).
const renderSubfield = (sub, value, onChange) => {
  if (sub.type === 'image') {
    return (
      <div className="admin-subfield" key={sub.key}>
        <label>{sub.label || sub.key}</label>
        {value ? <img className="admin-thumb" src={value} alt="" /> : null}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0]
            if (!file) return
            try {
              onChange(await uploadImage(sub.imageDir, file))
            } catch (err) {
              window.alert(`upload failed: ${err.message}`)
            } finally {
              e.target.value = ''
            }
          }}
        />
      </div>
    )
  }
  return (
    <div className="admin-subfield" key={sub.key}>
      <label>{sub.label || sub.key}</label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

const emptyItem = (subfields) => Object.fromEntries(subfields.map((f) => [f.key, '']))

const RepeatableGroupField = ({ field, value, onChange, error }) => {
  const items = value || []

  const updateItem = (i, key, v) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [key]: v } : item)))
  }
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const addItem = () => onChange([...items, emptyItem(field.subfields)])
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <FieldShell field={field} error={error}>
      <div className="admin-repeatable-group">
        {items.map((item, i) => (
          <div key={i} className="admin-repeatable-group-item">
            {field.subfields.map((sub) => renderSubfield(sub, item[sub.key], (v) => updateItem(i, sub.key, v)))}
            <div className="admin-repeatable-group-controls">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>move up</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}>move down</button>
              <button type="button" onClick={() => removeItem(i)}>remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addItem}>+ add {field.itemLabel || 'item'}</button>
      </div>
    </FieldShell>
  )
}

export default RepeatableGroupField
