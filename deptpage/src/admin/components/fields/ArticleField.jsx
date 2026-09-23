import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import FieldShell from './FieldShell'
import { getArticle } from '../../adminApi'

// Used within RecordFormPage, which owns the actual save-to-disk timing
// (article file written before the parent JSON on form submit) via the
// articleContent/onArticleContentChange props it passes to every field.
// The backing file path (`value`) is never shown or edited here -- for new
// records RecordFormPage derives one from the title at save time, once
// there's content to save.
const ArticleField = ({ field, value, error, articleContent, onArticleContentChange }) => {
  const [loadedFor, setLoadedFor] = useState(null)

  useEffect(() => {
    if (value && value !== loadedFor && articleContent === undefined) {
      getArticle(value).then((content) => {
        onArticleContentChange(content)
        setLoadedFor(value)
      })
    }
  }, [value])

  return (
    <FieldShell field={field} error={error}>
      <div className="admin-article-editor">
        <textarea
          className="admin-article-textarea"
          value={articleContent || ''}
          onChange={(e) => onArticleContentChange(e.target.value)}
        />
        <div className="admin-article-preview">
          {articleContent ? (
            <Markdown remarkPlugins={[remarkGfm]}>{articleContent}</Markdown>
          ) : (
            <div className="admin-article-preview-empty">Start typing markdown on the left to see a preview here.</div>
          )}
        </div>
      </div>
    </FieldShell>
  )
}

export default ArticleField
