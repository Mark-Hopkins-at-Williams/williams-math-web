export const isUnique = (records, idField, value, excludeIndex = -1) => (
  !records.some((record, index) => index !== excludeIndex && record[idField] === value)
)

// Appends -2, -3, ... to `base` until it doesn't collide with any sibling
// record's value for `key`.
export const generateUniqueValue = (records, key, base) => {
  let candidate = base
  let n = 2
  while (!isUnique(records, key, candidate)) {
    candidate = `${base}-${n}`
    n += 1
  }
  return candidate
}

// For schemas whose id is an internal key rather than meaningful content
// (schema.generateId), derives one from the record instead of asking the
// user to type it.
export const generateUniqueId = (schema, record, siblingRecords) => (
  generateUniqueValue(siblingRecords, schema.idField, schema.generateId(record))
)

// Same idea as generateUniqueValue, but for file paths: the -2, -3, ...
// disambiguator goes before the extension (articles/foo-2.md), not after it
// (articles/foo.md-2, which generateUniqueValue would produce).
export const generateUniqueArticlePath = (records, key, basePath) => {
  const dot = basePath.lastIndexOf('.')
  const stem = dot === -1 ? basePath : basePath.slice(0, dot)
  const ext = dot === -1 ? '' : basePath.slice(dot)
  let candidate = basePath
  let n = 2
  while (!isUnique(records, key, candidate)) {
    candidate = `${stem}-${n}${ext}`
    n += 1
  }
  return candidate
}

const isEmpty = (value) => (
  value === undefined || value === null || value === '' ||
  (Array.isArray(value) && value.length === 0)
)

// Returns { [fieldKey]: message } for every required-but-empty field, plus
// a duplicate-id error when applicable. Field types that reference other
// collections (reference / reference-list) are validated structurally by
// only ever offering real ids as choices, so they don't need a check here.
// `articleContents` (keyed by field key) is checked instead of `record` for
// 'article' fields, since the record only holds the auto-generated file
// path -- the thing that's actually "required" is the markdown text itself.
export const validateRecord = (schema, record, siblingRecords, currentIndex, articleContents = {}) => {
  const errors = {}
  for (const field of schema.fields) {
    if (!field.required) continue
    const value = field.type === 'article' ? articleContents[field.key] : record[field.key]
    if (isEmpty(value)) {
      errors[field.key] = `${field.label || field.key} is required`
    }
  }
  if (schema.idField) {
    const idValue = record[schema.idField]
    if (!isEmpty(idValue) && !isUnique(siblingRecords, schema.idField, idValue, currentIndex)) {
      errors[schema.idField] = `${schema.idField} must be unique - "${idValue}" is already used`
    }
  }
  return errors
}
