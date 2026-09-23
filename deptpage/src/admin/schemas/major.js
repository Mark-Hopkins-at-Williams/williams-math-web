import MajorPathEditor from '../components/MajorPathEditor'

export const requirementsSchema = {
  file: 'major.json',
  arrayPath: 'requirements',
  idField: 'id',
  label: 'Major Requirement',
  fields: [
    { key: 'id', type: 'text', label: 'id', required: true, unique: true },
    { key: 'title', type: 'text', label: 'title', required: true },
    { key: 'info', type: 'text', label: 'info shown to students', required: true, multiline: true },
    {
      key: 'prereqs',
      type: 'reference-list',
      label: 'prerequisites (student must have ALL of these)',
      refFile: 'major.json',
      refArrayPath: 'requirements',
      refIdField: 'id',
      refLabelField: 'title',
    },
    { key: 'error', type: 'text', label: 'error message if prerequisites not met', multiline: true },
    {
      key: 'recommended',
      type: 'reference-list',
      label: 'recommended (student should have at least ONE of these)',
      refFile: 'major.json',
      refArrayPath: 'requirements',
      refIdField: 'id',
      refLabelField: 'title',
    },
    { key: 'warning', type: 'text', label: 'warning message if none of the recommended courses were taken', multiline: true },
  ],
  listColumns: ['id', 'title'],
}

const SEMESTER_SLOTS = ['0', '1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b']

export const pathsSchema = {
  file: 'major.json',
  arrayPath: 'paths',
  idField: 'id',
  label: 'Major Path',
  fields: [
    { key: 'id', type: 'text', label: 'name', required: true, unique: true },
    { key: 'icon', type: 'text', label: 'icon (single emoji)', required: true },
    { key: 'description', type: 'text', label: 'description', required: true, multiline: true },
  ],
  listColumns: ['icon', 'id', 'description'],
  extraField: {
    key: 'path',
    default: () => SEMESTER_SLOTS.map((semester) => ({ semester, courses: [] })),
  },
  ExtraComponent: MajorPathEditor,
}

export const majorComponentOptions = ['MajorPlanningAssistant']
