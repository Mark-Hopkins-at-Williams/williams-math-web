import FieldShell from './FieldShell'
import ArticleField from './ArticleField'
import ImagePickerField from './ImagePickerField'
import { saveArticle } from '../../adminApi'
import { suggestArticlePath } from '../../utils/slugify'
import { generateUniqueArticlePath } from '../../utils/validation'

// frontpage.json / major.json / nonmajors.json / research.json all have a
// `content` array that mixes {component: "SomeReactComponent"} markers with
// {title, photo, article} blocks. Component blocks are baked into each
// page's structure by whoever wires up componentOptions/isHidden in the
// page editor -- there's no "add component block" button, since a new one
// needs an actual code change anyway. photo is optional and renders below
// the title -- keeping it a real field instead of relying on admins to
// hand-write markdown image syntax.
//
// Article blocks hold their in-progress markdown as a transient `_articleContent`
// field directly on the block object -- not a separate index-keyed map --
// so it automatically stays attached to the right block through reordering
// and removal (those operations move/drop whole block objects). The parent
// page's own save (see saveBlockArticles below) writes any pending text to
// disk and strips `_articleContent` before the page's JSON itself is saved;
// there's no save button here.
const BlockEditor = ({ block, onChange }) => (
  <div className="admin-content-block">
    <div className="admin-subfield">
      <label>title</label>
      <input
        type="text"
        placeholder="e.g. Faculty Spotlight"
        value={block.title || ''}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
      />
    </div>
    <ImagePickerField
      field={{ key: 'photo', label: 'photo (optional, shown below the title)', imageDir: 'misc' }}
      value={block.photo}
      onChange={(v) => onChange({ ...block, photo: v })}
    />
    <ArticleField
      field={{ key: 'article', label: 'article body (markdown)' }}
      value={block.article}
      articleContent={block._articleContent}
      onArticleContentChange={(content) => onChange({ ...block, _articleContent: content })}
    />
  </div>
)

// Called from a page's registered save function. Writes any block with
// pending markdown text to disk (generating a filename from its title the
// first time, sequentially so two new same-titled blocks in one save don't
// collide), and returns the blocks with `_articleContent` stripped out --
// that field must never end up in the saved JSON.
export const saveBlockArticles = async (blocks) => {
  const saved = []
  for (const block of blocks) {
    const { _articleContent, ...rest } = block
    if (_articleContent === undefined) {
      saved.push(rest)
      continue
    }
    const path = rest.article || generateUniqueArticlePath(saved, 'article', suggestArticlePath(rest.title))
    await saveArticle(path, _articleContent)
    saved.push({ ...rest, article: path })
  }
  return saved
}

const ContentBlockListField = ({ field, value, onChange, error }) => {
  const blocks = value || []
  const componentOptions = field.componentOptions || []

  // Every mutation is expressed as `onChange(prevBlocks => nextBlocks)`, not
  // a plain array, and the page holding this field's state must apply it
  // the same way (see FrontPageEditor.jsx etc.'s `change` helper). Several
  // blocks' article text can each finish loading around the same moment;
  // each one's ArticleField effect closure is fixed at mount, so a plain
  // onChange(newArray) built from this render's `blocks` would still be
  // stale by the time it's applied, and whichever resolves last would wipe
  // out the others. Threading a function through instead means each update
  // is computed against whatever the true latest array is when it actually
  // runs, not when it was queued.
  const updateBlock = (i, newBlock) => onChange((prev) => {
    const next = [...prev]
    next[i] = newBlock
    return next
  })
  const removeBlock = (i) => onChange((prev) => prev.filter((_, idx) => idx !== i))
  const move = (i, dir) => onChange((prev) => {
    const j = i + dir
    if (j < 0 || j >= prev.length) return prev
    const next = [...prev]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })
  const addTextBlock = () => onChange((prev) => [...prev, { title: '', article: '' }])

  return (
    <FieldShell field={field} error={error}>
      <div className="admin-content-block-list">
        {blocks.map((block, i) => {
          const isHiddenBlock = (b) => field.isHidden && field.isHidden(b)
          if (isHiddenBlock(block)) return null
          // A hidden neighbor (e.g. a fixed structural block that isn't
          // shown at all) can't be swapped with -- doing so would silently
          // move it on the real page without the admin ever seeing it move.
          const canMoveUp = i > 0 && !isHiddenBlock(blocks[i - 1])
          const canMoveDown = i < blocks.length - 1 && !isHiddenBlock(blocks[i + 1])
          return (
            <div key={i} className="admin-content-block-wrapper">
              {'component' in block ? (
                <div className="admin-content-block admin-content-block-component">
                  <label>component:</label>
                  <select value={block.component} onChange={(e) => updateBlock(i, { component: e.target.value })}>
                    {componentOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <BlockEditor block={block} onChange={(b) => updateBlock(i, b)} />
              )}
              <div className="admin-content-block-controls">
                {canMoveUp ? <button type="button" onClick={() => move(i, -1)}>move block up</button> : null}
                {canMoveDown ? <button type="button" onClick={() => move(i, 1)}>move block down</button> : null}
                <button type="button" onClick={() => removeBlock(i)}>remove block</button>
              </div>
            </div>
          )
        })}
        <div className="admin-content-block-add">
          <button type="button" onClick={addTextBlock}>+ add text/article block</button>
        </div>
      </div>
    </FieldShell>
  )
}

export default ContentBlockListField
