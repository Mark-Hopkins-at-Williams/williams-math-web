import { slugify, today } from '../utils/slugify'

export default {
  file: 'news.json',
  arrayPath: 'articles',
  idField: 'id',
  label: 'News Article',
  // id is an internal key, not meaningful content -- generate it from the
  // title instead of asking for it.
  generateId: (record) => `article-${slugify(record.title)}`,
  fields: [
    { key: 'date', type: 'date', label: 'date', required: true, default: () => today() },
    { key: 'title', type: 'text', label: 'title', required: true },
    { key: 'photo', type: 'image', label: 'photo', imageDir: 'misc' },
    { key: 'thumbnail', type: 'image', label: 'thumbnail (optional, square; shown beside the headline in news listings; if omitted, the photo is cropped to a square)', imageDir: 'misc' },
    { key: 'teaser', type: 'text', label: 'teaser (shown on the front page; defaults to title if blank)', multiline: true },
    { key: 'article', type: 'article', label: 'article body', required: true },
  ],
  listColumns: ['date', 'title'],
  sortBy: { key: 'date', direction: 'desc', type: 'date' },
}
