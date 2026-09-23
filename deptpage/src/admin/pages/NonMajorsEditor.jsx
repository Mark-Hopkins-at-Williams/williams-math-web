import { useState, useEffect } from 'react'
import { getData, saveData } from '../adminApi'
import ContentBlockListField, { saveBlockArticles } from '../components/fields/ContentBlockListField'
import { useRegisterSave, useSaveContext } from '../SaveContext'

const NonMajorsEditor = () => {
  const [doc, setDoc] = useState(null)
  const { markDirty } = useSaveContext()

  useEffect(() => { getData('nonmajors.json').then(setDoc) }, [])

  // Functional update: several content blocks can each finish loading their
  // article text around the same time, and a plain setDoc(newDoc) built
  // from a stale render's `doc` would clobber whichever one resolved first.
  const change = (updater) => {
    setDoc((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    markDirty()
  }

  useRegisterSave(async () => {
    const content = await saveBlockArticles(doc.content)
    await saveData('nonmajors.json', { ...doc, content })
  })

  if (!doc) return <div>loading...</div>

  return (
    <div className="admin-record-form">
      <h2>Advice for Non-Majors</h2>
      <ContentBlockListField
        field={{ key: 'content', label: 'page content', componentOptions: [] }}
        value={doc.content}
        onChange={(blocksUpdater) => change((prev) => ({ ...prev, content: blocksUpdater(prev.content) }))}
      />
    </div>
  )
}

export default NonMajorsEditor
