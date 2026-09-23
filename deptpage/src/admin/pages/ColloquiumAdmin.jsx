import { useState, useEffect } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { getData, saveData } from '../adminApi'
import TextField from '../components/fields/TextField'
import CollectionListPage from '../components/CollectionListPage'
import colloquiumSchema from '../schemas/colloquium'
import { useRegisterSave, useSaveContext } from '../SaveContext'

const ColloquiumDisclaimerEditor = () => {
  const [doc, setDoc] = useState(null)
  const { markDirty } = useSaveContext()

  useEffect(() => { getData('colloquium.json').then(setDoc) }, [])

  const change = (updater) => {
    setDoc((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    markDirty()
  }

  useRegisterSave(async () => {
    await saveData('colloquium.json', doc)
  })

  if (!doc) return <div>loading...</div>

  return (
    <div className="admin-record-form">
      <TextField
        field={{ key: 'disclaimer', label: 'schedule disclaimer', multiline: true }}
        value={doc.disclaimer}
        onChange={(v) => change((prev) => ({ ...prev, disclaimer: v }))}
      />
    </div>
  )
}

const ColloquiumAdmin = () => (
  <div>
    <h2>Colloquium</h2>
    <nav className="admin-tabs">
      <NavLink to="/admin/colloquium/schedule" end>schedule</NavLink>
      <NavLink to="/admin/colloquium/disclaimer">disclaimer</NavLink>
    </nav>
    <Routes>
      <Route index element={<Navigate to="schedule" replace />} />
      <Route path="schedule/*" element={<CollectionListPage schema={colloquiumSchema} />} />
      <Route path="disclaimer" element={<ColloquiumDisclaimerEditor />} />
    </Routes>
  </div>
)

export default ColloquiumAdmin
