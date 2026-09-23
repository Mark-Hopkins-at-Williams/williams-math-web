export const catalogSchema = {
  file: 'courses.json',
  arrayPath: 'catalog',
  idField: 'id',
  label: 'Course',
  fields: [
    { key: 'id', type: 'text', label: 'course id (e.g. MATH 150)', required: true, unique: true },
    { key: 'title', type: 'text', label: 'title', required: true },
    { key: 'description', type: 'text', label: 'description', required: true, multiline: true },
  ],
  listColumns: ['id', 'title'],
  sortBy: { key: 'id', direction: 'asc' },
}

// e.g. "Fall 2026" -> "f26", "Spring 2027" -> "s27".
const semesterCode = (semester) => {
  const match = /^(\w+)\s+(\d{4})$/.exec((semester || '').trim())
  if (!match) return 'unknown'
  const [, season, year] = match
  return `${season[0].toLowerCase()}${year.slice(-2)}`
}

// e.g. "CSCI 134" -> "csci134".
const courseCode = (course) => (course || '').toLowerCase().replace(/\s+/g, '')

export const sectionsSchema = {
  file: 'courses.json',
  arrayPath: 'sections',
  idField: 'id',
  label: 'Course Section',
  // id is an internal key (e.g. "f26-csci134-1"), not something to type by
  // hand -- generate it from the fields that already spell it out.
  generateId: (record) => `${semesterCode(record.semester)}-${courseCode(record.course)}-${record.sectionNumber}`,
  fields: [
    {
      key: 'course',
      type: 'reference',
      label: 'course',
      required: true,
      refFile: 'courses.json',
      refArrayPath: 'catalog',
      refIdField: 'id',
      refLabelField: 'title',
    },
    { key: 'semester', type: 'text', label: 'semester (e.g. Fall 2026)', required: true },
    { key: 'sectionNumber', type: 'text', label: 'section number', columnLabel: 'section number', required: true },
    {
      key: 'instructors',
      type: 'reference-string-list',
      label: 'instructors',
      itemLabel: 'instructor',
      refFile: 'people.json',
      refArrayPath: 'people',
      refIdField: 'id',
      // Affiliate faculty currently teach too (e.g. Daniel Aalberts), not
      // just role === 'faculty'.
      refFilter: (person) => person.role === 'faculty' || person.role === 'affiliate',
    },
    { key: 'lecture', type: 'text', label: 'lecture time', required: true },
    { key: 'webpage', type: 'text', label: 'course webpage', required: true },
  ],
  listColumns: ['course', 'semester', 'sectionNumber'],
  sortBy: { key: 'semester', direction: 'asc' },
}
