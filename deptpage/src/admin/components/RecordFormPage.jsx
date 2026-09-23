import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getData, saveData, getArticle, saveArticle } from '../adminApi'
import { validateRecord, generateUniqueId, generateUniqueArticlePath } from '../utils/validation'
import { suggestArticlePath } from '../utils/slugify'
import { useRegisterSave, useSaveContext } from '../SaveContext'
import FieldRenderer from './fields/FieldRenderer'

const ARRAY_TYPES = new Set(['reference-list', 'string-list', 'repeatable-group', 'string-image-array'])

const emptyRecordFor = (schema) => {
  const record = {}
  for (const field of schema.fields) {
    if (field.default !== undefined) {
      record[field.key] = typeof field.default === 'function' ? field.default() : field.default
    } else {
      record[field.key] = ARRAY_TYPES.has(field.type) ? [] : ''
    }
  }
  if (schema.extraField) {
    record[schema.extraField.key] = schema.extraField.default()
  }
  return record
}

const indexFor = (schema, list, id) => (
  schema.idField
    ? list.findIndex((item) => String(item[schema.idField]) === String(id))
    : Number(id)
)

// The single load/save/delete orchestrator for one record within one of the
// generic collection editors. `schema.fields` drives the form body;
// `schema.extraField`/`schema.ExtraComponent` (used by major.json's `paths`)
// injects one bespoke sub-editor alongside the generic fields.
const RecordFormPage = ({ schema, mode, id, backTo }) => {
  const navigate = useNavigate()
  const { markDirty } = useSaveContext()
  const [doc, setDoc] = useState(null)
  const [record, setRecord] = useState(null)
  const [articleContents, setArticleContents] = useState({})
  const [errors, setErrors] = useState({})
  const [deleting, setDeleting] = useState(false)
  const [loadError, setLoadError] = useState('')

  const articleFieldKeys = useMemo(
    () => schema.fields.filter((f) => f.type === 'article').map((f) => f.key),
    [schema],
  )

  useEffect(() => {
    let cancelled = false
    setLoadError('')
    setRecord(null)
    getData(schema.file).then(async (data) => {
      if (cancelled) return
      setDoc(data)
      const list = data[schema.arrayPath] || []
      const rec = mode === 'create' ? emptyRecordFor(schema) : list[indexFor(schema, list, id)]
      if (!rec) {
        setLoadError('record not found')
        return
      }
      setRecord({ ...rec })
      const contents = {}
      for (const key of articleFieldKeys) {
        if (rec[key]) contents[key] = await getArticle(rec[key])
      }
      if (!cancelled) setArticleContents(contents)
    }).catch((err) => setLoadError(err.message))
    return () => { cancelled = true }
  }, [schema, mode, id])

  const handleFieldChange = (key, newValue) => {
    setRecord((r) => ({ ...r, [key]: newValue }))
    markDirty()
  }

  const handleArticleContentChange = (key, content) => {
    setArticleContents((c) => ({ ...c, [key]: content }))
    markDirty()
  }

  // Registered unconditionally (before the loading/error early returns
  // below) since hooks can't be called conditionally -- guards on
  // record/doc itself instead, which can't matter in practice since nothing
  // can mark the page dirty before the form has loaded and rendered.
  useRegisterSave(async () => {
    if (!record || !doc) return
    const list = doc[schema.arrayPath] || []
    const currentIndex = mode === 'create' ? -1 : indexFor(schema, list, id)

    // Recomputed fresh from the current record on every attempt (rather than
    // stored back into state) so it always reflects the latest title, even
    // after a failed save due to some other field.
    let recordToSave = record
    if (mode === 'create') {
      const updates = {}
      if (schema.generateId) {
        updates[schema.idField] = generateUniqueId(schema, record, list)
      }
      for (const field of schema.fields) {
        // Article fields never show a path in the UI -- once there's
        // markdown text to save, derive a filename from the title instead
        // of asking for one.
        if (field.type === 'article' && !record[field.key] && articleContents[field.key]) {
          const titleKey = field.titleKey || 'title'
          updates[field.key] = generateUniqueArticlePath(list, field.key, suggestArticlePath(record[titleKey]))
        }
      }
      if (Object.keys(updates).length > 0) recordToSave = { ...record, ...updates }
    }

    const validationErrors = validateRecord(schema, recordToSave, list, currentIndex, articleContents)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      throw new Error('please fix the errors below')
    }
    setErrors({})

    for (const key of articleFieldKeys) {
      const path = recordToSave[key]
      if (path) await saveArticle(path, articleContents[key] || '')
    }
    const newList = [...list]
    if (mode === 'create') newList.push(recordToSave)
    else newList[currentIndex] = recordToSave
    await saveData(schema.file, { ...doc, [schema.arrayPath]: newList })
    navigate(backTo)
  })

  if (loadError) return <div className="admin-error">{loadError}</div>
  if (!record) return <div>loading...</div>

  const list = doc[schema.arrayPath] || []
  const currentIndex = mode === 'create' ? -1 : indexFor(schema, list, id)

  const handleDelete = async () => {
    const label = schema.label || 'record'
    if (!window.confirm(`Delete this ${label}? This can't be undone. Any linked images/articles are left on disk.`)) {
      return
    }
    setDeleting(true)
    try {
      const newList = list.filter((_, i) => i !== currentIndex)
      await saveData(schema.file, { ...doc, [schema.arrayPath]: newList })
      navigate(backTo)
    } catch (err) {
      window.alert(`delete failed: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="admin-record-form">
      <h2>{mode === 'create' ? `Add ${schema.label}` : `Edit ${schema.label}`}</h2>
      {schema.fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={record[field.key]}
          onChange={(v) => handleFieldChange(field.key, v)}
          error={errors[field.key]}
          record={record}
          articleContent={articleContents[field.key]}
          onArticleContentChange={(content) => handleArticleContentChange(field.key, content)}
        />
      ))}
      {schema.ExtraComponent ? (
        <schema.ExtraComponent
          value={record[schema.extraField.key]}
          onChange={(v) => handleFieldChange(schema.extraField.key, v)}
          requirements={doc.requirements || []}
        />
      ) : null}
      <div className="admin-form-actions">
        <button type="button" onClick={() => navigate(backTo)}>cancel</button>
        {mode === 'edit' ? (
          <button type="button" className="admin-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'deleting...' : 'delete'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default RecordFormPage
