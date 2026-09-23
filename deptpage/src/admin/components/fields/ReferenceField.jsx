import { useState, useEffect } from 'react'
import FieldShell from './FieldShell'
import { getData } from '../../adminApi'

// Single-select drawing its options from another collection (or another
// array within the same file), so an invalid reference is never typeable.
const ReferenceField = ({ field, value, onChange, error }) => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    getData(field.refFile).then((data) => {
      const list = data[field.refArrayPath] || []
      setOptions(list.map((item) => ({
        value: item[field.refIdField],
        label: field.refLabelField ? `${item[field.refIdField]} — ${item[field.refLabelField]}` : item[field.refIdField],
      })))
    }).catch(() => setOptions([]))
  }, [field.refFile, field.refArrayPath])

  return (
    <FieldShell field={field} error={error}>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export default ReferenceField
