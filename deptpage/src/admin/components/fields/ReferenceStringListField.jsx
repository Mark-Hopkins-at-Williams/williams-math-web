import { useState, useEffect } from 'react'
import FieldShell from './FieldShell'
import { getData } from '../../adminApi'

// Row-based list like StringListField, but each row is a dropdown of
// existing records from another collection (see ReferenceField) instead of
// free text -- e.g. course instructors can only ever be a real people.json
// entry, never a typo'd or since-renamed name.
const ReferenceStringListField = ({ field, value, onChange, error }) => {
  const items = value || []
  const [options, setOptions] = useState([])

  useEffect(() => {
    getData(field.refFile).then((data) => {
      const list = data[field.refArrayPath] || []
      const filtered = field.refFilter ? list.filter(field.refFilter) : list
      setOptions(filtered.map((item) => ({
        value: item[field.refIdField],
        label: field.refLabelField ? `${item[field.refIdField]} — ${item[field.refLabelField]}` : item[field.refIdField],
      })))
    }).catch(() => setOptions([]))
  }, [field.refFile, field.refArrayPath, field.refFilter])

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
            <select value={item} onChange={(e) => updateItem(i, e.target.value)}>
              <option value="">-- select --</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>move up</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}>move down</button>
            <button type="button" onClick={() => removeItem(i)}>remove</button>
          </div>
        ))}
        <button type="button" onClick={addItem}>+ add {field.itemLabel || 'item'}</button>
        {options.length === 0 ? <div>no options available yet</div> : null}
      </div>
    </FieldShell>
  )
}

export default ReferenceStringListField
