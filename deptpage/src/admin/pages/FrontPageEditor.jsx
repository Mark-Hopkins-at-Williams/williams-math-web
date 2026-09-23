import { useState, useEffect } from 'react'
import { getData, saveData } from '../adminApi'
import ImagePickerField from '../components/fields/ImagePickerField'
import TextField from '../components/fields/TextField'
import ContentBlockListField, { saveBlockArticles } from '../components/fields/ContentBlockListField'
import { useRegisterSave, useSaveContext } from '../SaveContext'

const FrontPageEditor = () => {
  const [doc, setDoc] = useState(null)
  const { markDirty } = useSaveContext()

  useEffect(() => { getData('frontpage.json').then(setDoc) }, [])

  // Functional update: several content blocks can each finish loading their
  // article text around the same time, and a plain setDoc(newDoc) built
  // from a stale render's `doc` would clobber whichever one resolved first.
  const change = (updater) => {
    setDoc((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    markDirty()
  }

  useRegisterSave(async () => {
    const content = await saveBlockArticles(doc.content)
    await saveData('frontpage.json', { ...doc, content })
  })

  if (!doc) return <div>loading...</div>

  return (
    <div className="admin-record-form">
      <h2>Front Page</h2>
      <ImagePickerField
        field={{ key: 'photo', label: 'spotlight photo', imageDir: 'misc', required: true }}
        value={doc.spotlight.photo}
        onChange={(v) => change((prev) => ({ ...prev, spotlight: { ...prev.spotlight, photo: v } }))}
      />
      <TextField
        field={{ key: 'caption', label: 'spotlight caption', required: true }}
        value={doc.spotlight.caption}
        onChange={(v) => change((prev) => ({ ...prev, spotlight: { ...prev.spotlight, caption: v } }))}
      />
      <ContentBlockListField
        field={{
          key: 'content',
          label: 'page content',
          componentOptions: ['FromTheDepartment'],
          // Structural, not editable content -- keep it out of the list
          // entirely, same treatment as major.json's MajorPlanningAssistant.
          isHidden: (block) => block.component === 'FromTheDepartment',
        }}
        value={doc.content}
        onChange={(blocksUpdater) => change((prev) => ({ ...prev, content: blocksUpdater(prev.content) }))}
      />
    </div>
  )
}

export default FrontPageEditor
