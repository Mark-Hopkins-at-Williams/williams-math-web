import FieldShell from './FieldShell'

const SelectField = ({ field, value, onChange, error }) => (
  <FieldShell field={field} error={error}>
    <select
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(e) => {
        const raw = e.target.value
        const option = field.options.find((opt) => String(opt.value) === raw)
        onChange(option ? option.value : raw)
      }}
    >
      <option value="" disabled>
        select...
      </option>
      {field.options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  </FieldShell>
)

export default SelectField
