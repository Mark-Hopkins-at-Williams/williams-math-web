const FieldShell = ({ field, error, children }) => (
  <div className="admin-field">
    <label className="admin-field-label">
      {field.label || field.key}
      {field.required ? ' *' : ''}
    </label>
    {children}
    {field.hint ? <div className="admin-field-hint">{field.hint}</div> : null}
    {error ? <div className="admin-field-error">{error}</div> : null}
  </div>
)

export default FieldShell
