import FieldShell from './FieldShell'

const StringListField = ({ field, value, onChange, error }) => {
  const items = value || []

  const updateItem = (i, v) => {
    const next = [...items]
    next[i] = v
    onChange(next)
  }
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const addItem = () => onChange([...items, ''])
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <FieldShell field={field} error={error}>
      <div className="admin-string-list">
        {items.map((item, i) => (
          <div key={i} className="admin-string-list-row">
            {field.multiline ? (
              <textarea rows={3} value={item} onChange={(e) => updateItem(i, e.target.value)} />
            ) : (
              <input type="text" value={item} onChange={(e) => updateItem(i, e.target.value)} />
            )}
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
            <button type="button" onClick={() => removeItem(i)}>remove</button>
          </div>
        ))}
        <button type="button" onClick={addItem}>+ add {field.itemLabel || 'item'}</button>
      </div>
    </FieldShell>
  )
}

export default StringListField
