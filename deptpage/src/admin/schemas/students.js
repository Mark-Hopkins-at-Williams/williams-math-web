export default {
  file: 'students.json',
  arrayPath: 'groups',
  idField: 'abbreviation',
  label: 'Student Group',
  pluralLabel: 'Student Groups',
  fields: [
    { key: 'abbreviation', type: 'text', label: 'abbreviation', required: true, unique: true },
    { key: 'name', type: 'text', label: 'full name', required: true },
    { key: 'description', type: 'text', label: 'description (markdown links ok: [text](url))', required: true, multiline: true },
    { key: 'webpage', type: 'text', label: 'webpage' },
    { key: 'photo', type: 'image', label: 'photo (optional, shown below the title)', imageDir: 'students' },
    { key: 'details', type: 'string-list', label: 'extra paragraphs (markdown links ok)', multiline: true, itemLabel: 'paragraph' },
    {
      key: 'leadership',
      type: 'repeatable-group',
      label: 'leadership',
      itemLabel: 'leader',
      subfields: [
        { key: 'name', type: 'text', label: 'name' },
        { key: 'role', type: 'text', label: 'role (e.g. President)' },
        { key: 'year', type: 'text', label: 'class year' },
        { key: 'photo', type: 'image', label: 'photo', imageDir: 'students' },
      ],
    },
    { key: 'gallery', type: 'string-image-array', label: 'gallery photos', imageDir: 'students' },
  ],
  listColumns: ['abbreviation', 'name'],
}
