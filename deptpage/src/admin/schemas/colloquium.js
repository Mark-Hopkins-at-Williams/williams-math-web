export default {
  file: 'colloquium.json',
  arrayPath: 'events',
  idField: null, // no natural unique key in this collection; routed by array index
  label: 'Colloquium Event',
  fields: [
    { key: 'title', type: 'text', label: 'talk title' },
    { key: 'abstract', type: 'text', label: 'abstract', multiline: true },
    { key: 'speaker', type: 'text', label: 'speaker', required: true },
    { key: 'affiliation', type: 'text', label: 'affiliation', required: true },
    { key: 'bio', type: 'text', label: 'speaker bio', multiline: true },
    { key: 'photo', type: 'image', label: 'photo', imageDir: 'colloquium' },
    { key: 'date', type: 'date', label: 'date', required: true },
    { key: 'time', type: 'text', label: 'time', hint: 'defaults to 2:35pm if left blank' },
    { key: 'location', type: 'text', label: 'location', hint: 'defaults to Wachenheim 113 if left blank' },
  ],
  listColumns: ['date', 'speaker', 'title'],
  sortBy: { key: 'date', direction: 'asc', type: 'date' },
}
