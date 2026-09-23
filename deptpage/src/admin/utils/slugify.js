export const slugify = (text) => (
  (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled'
)

export const suggestArticlePath = (title) => `articles/${slugify(title)}.md`

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// "Month D, YYYY" (the format every data/*.json date field uses, parsed via
// Date.parse elsewhere in the app) <-> "YYYY-MM-DD" (native <input type=date>).
// Both conversions stay entirely in local-time components so no UTC/local
// mismatch can shift the date by a day.
export const toISODate = (humanDate) => {
  if (!humanDate) return ''
  const d = new Date(humanDate)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const fromISODate = (isoDate) => {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

// "Month D, YYYY" for right now, in local time (for date fields that default
// to today on create).
export const today = () => {
  const d = new Date()
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
