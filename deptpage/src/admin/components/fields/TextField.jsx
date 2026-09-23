import FieldShell from './FieldShell'

const TextField = ({ field, value, onChange, error }) => (
  <FieldShell field={field} error={error}>
    {field.multiline ? (
      <textarea
        rows={field.rows || 4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </FieldShell>
)

export default TextField
