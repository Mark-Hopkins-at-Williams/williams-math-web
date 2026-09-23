const SEMESTER_LABELS = {
  '0': 'before Williams',
  '1a': 'year 1, fall',
  '1b': 'year 1, spring',
  '2a': 'year 2, fall',
  '2b': 'year 2, spring',
  '3a': 'year 3, fall',
  '3b': 'year 3, spring',
  '4a': 'year 4, fall',
  '4b': 'year 4, spring',
}

// The 9 semester slots are fixed (README: "semester 0" is pre-Williams
// credit, semesters 1a-4b are the 8 real semesters) -- this editor only
// ever edits each slot's course list, never adds/removes/reorders slots.
const MajorPathEditor = ({ value, onChange, requirements }) => {
  const slots = value || []

  const toggleCourse = (slotIndex, reqId) => {
    onChange(slots.map((slot, i) => {
      if (i !== slotIndex) return slot
      const courses = slot.courses.includes(reqId)
        ? slot.courses.filter((c) => c !== reqId)
        : [...slot.courses, reqId]
      return { ...slot, courses }
    }))
  }

  return (
    <div className="admin-field">
      <label className="admin-field-label">semester plan</label>
      <div className="admin-major-path-grid">
        {slots.map((slot, i) => (
          <div key={slot.semester} className="admin-major-path-slot">
            <div className="admin-major-path-slot-header">
              {slot.semester} — {SEMESTER_LABELS[slot.semester] || ''}
            </div>
            <div className="admin-checkbox-list">
              {requirements.map((req) => (
                <label key={req.id} className="admin-checkbox-item">
                  <input
                    type="checkbox"
                    checked={slot.courses.includes(req.id)}
                    onChange={() => toggleCourse(i, req.id)}
                  />
                  {req.id}
                </label>
              ))}
              {requirements.length === 0 ? <div>add major requirements first</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MajorPathEditor
