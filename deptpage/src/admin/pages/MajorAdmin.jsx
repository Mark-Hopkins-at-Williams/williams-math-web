import { useState, useEffect } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import { getData, saveData } from '../adminApi'
import TextField from '../components/fields/TextField'
import ContentBlockListField, { saveBlockArticles } from '../components/fields/ContentBlockListField'
import CollectionListPage from '../components/CollectionListPage'
import { requirementsSchema, pathsSchema, majorComponentOptions } from '../schemas/major'
import { useRegisterSave, useSaveContext } from '../SaveContext'

const MajorContentEditor = () => {
  const [doc, setDoc] = useState(null)
  const { markDirty } = useSaveContext()

  useEffect(() => { getData('major.json').then(setDoc) }, [])

  // Functional update: several content blocks can each finish loading their
  // article text around the same time, and a plain setDoc(newDoc) built
  // from a stale render's `doc` would clobber whichever one resolved first.
  const change = (updater) => {
    setDoc((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    markDirty()
  }

  useRegisterSave(async () => {
    const content = await saveBlockArticles(doc.content)
    await saveData('major.json', { ...doc, content })
  })

  if (!doc) return <div>loading...</div>

  return (
    <div className="admin-record-form">
      <TextField
        field={{ key: 'disclaimer', label: 'disclaimer', multiline: true }}
        value={doc.disclaimer}
        onChange={(v) => change((prev) => ({ ...prev, disclaimer: v }))}
      />
      <ContentBlockListField
        field={{
          key: 'content',
          label: 'page content',
          componentOptions: majorComponentOptions,
          // Structural, not editable content -- keep it out of the list
          // entirely rather than just hiding its remove button, since
          // there's nothing about it a content editor should be changing.
          isHidden: (block) => block.component === 'MajorPlanningAssistant',
        }}
        value={doc.content}
        onChange={(blocksUpdater) => change((prev) => ({ ...prev, content: blocksUpdater(prev.content) }))}
      />
    </div>
  )
}

const MajorAdmin = () => (
  <div>
    <h2>Plan Your Major</h2>
    <nav className="admin-tabs">
      <NavLink to="/admin/major" end>page content</NavLink>
      <NavLink to="/admin/major/requirements">requirements</NavLink>
      <NavLink to="/admin/major/paths">example paths</NavLink>
    </nav>
    <Routes>
      <Route index element={<MajorContentEditor />} />
      <Route path="requirements/*" element={<CollectionListPage schema={requirementsSchema} />} />
      <Route path="paths/*" element={<CollectionListPage schema={pathsSchema} />} />
    </Routes>
  </div>
)

export default MajorAdmin
