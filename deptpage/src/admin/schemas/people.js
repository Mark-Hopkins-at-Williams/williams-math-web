export default {
  file: 'people.json',
  arrayPath: 'people',
  idField: 'id',
  label: 'Person',
  fields: [
    { key: 'id', type: 'text', label: 'name', required: true, unique: true },
    { key: 'photo', type: 'image', label: 'photo', imageDir: 'people', required: true },
    {
      key: 'role',
      type: 'select',
      label: 'role',
      required: true,
      options: [
        { value: 'faculty', label: 'faculty' },
        { value: 'staff', label: 'staff' },
        { value: 'emeriti', label: 'emeriti' },
        { value: 'affiliate', label: 'affiliate' },
      ],
    },
    { key: 'title', type: 'text', label: 'title', required: true },
    { key: 'office', type: 'text', label: 'office' },
    { key: 'webpage', type: 'text', label: 'webpage' },
    { key: 'interests', type: 'text', label: 'interests', multiline: true },
  ],
  listColumns: ['id', 'role', 'title', 'office'],
  sortBy: { key: 'id', direction: 'asc' },
}
