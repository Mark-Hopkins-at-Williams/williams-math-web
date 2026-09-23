import { useState, useEffect } from 'react'
import FieldShell from './FieldShell'
import { getData } from '../../adminApi'

const ReferenceListField = ({ field, value, onChange, error }) => {
  const [options, setOptions] = useState([])
  const selected = value || []

  useEffect(() => {
    getData(field.refFile).then((data) => {
      const list = data[field.refArrayPath] || []
      setOptions(list.map((item) => ({
        value: item[field.refIdField],
        label: field.refLabelField ? `${item[field.refIdField]} — ${item[field.refLabelField]}` : item[field.refIdField],
      })))
    }).catch(() => setOptions([]))
  }, [field.refFile, field.refArrayPath])

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id])
  }

  return (
    <FieldShell field={field} error={error}>
      <div className="admin-checkbox-list">
        {options.map((opt) => (
          <label key={opt.value} className="admin-checkbox-item">
            <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} />
            {opt.label}
          </label>
        ))}
        {options.length === 0 ? <div>no options available yet</div> : null}
      </div>
    </FieldShell>
  )
}

export default ReferenceListField
