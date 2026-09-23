import { useState, useEffect } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import { getData, saveData } from '../adminApi'
import ContentBlockListField, { saveBlockArticles } from '../components/fields/ContentBlockListField'
import CollectionListPage from '../components/CollectionListPage'
import peopleSchema from '../schemas/people'
import { useRegisterSave, useSaveContext } from '../SaveContext'

const AboutUsContentEditor = () => {
  const [doc, setDoc] = useState(null)
  const { markDirty } = useSaveContext()

  useEffect(() => { getData('about.json').then(setDoc) }, [])

  // Functional update: several content blocks can each finish loading their
  // article text around the same time, and a plain setDoc(newDoc) built
  // from a stale render's `doc` would clobber whichever one resolved first.
  const change = (updater) => {
    setDoc((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    markDirty()
  }

  useRegisterSave(async () => {
    const content = await saveBlockArticles(doc.content)
    await saveData('about.json', { ...doc, content })
  })

  if (!doc) return <div>loading...</div>

  return (
    <div className="admin-record-form">
      <ContentBlockListField
        field={{ key: 'content', label: 'page content (mission statement, learning goals, etc.)', componentOptions: [] }}
        value={doc.content}
        onChange={(blocksUpdater) => change((prev) => ({ ...prev, content: blocksUpdater(prev.content) }))}
      />
    </div>
  )
}

const AboutUsAdmin = () => (
  <div>
    <h2>About Us</h2>
    <nav className="admin-tabs">
      <NavLink to="/admin/about" end>page content</NavLink>
      <NavLink to="/admin/about/people">people</NavLink>
    </nav>
    <Routes>
      <Route index element={<AboutUsContentEditor />} />
      <Route path="people/*" element={<CollectionListPage schema={peopleSchema} />} />
    </Routes>
  </div>
)

export default AboutUsAdmin
