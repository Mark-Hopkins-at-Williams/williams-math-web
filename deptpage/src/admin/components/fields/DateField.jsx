import FieldShell from './FieldShell'
import { toISODate, fromISODate } from '../../utils/slugify'

const DateField = ({ field, value, onChange, error }) => (
  <FieldShell field={field} error={error}>
    <input
      type="date"
      value={toISODate(value)}
      onChange={(e) => onChange(fromISODate(e.target.value))}
    />
  </FieldShell>
)

export default DateField
