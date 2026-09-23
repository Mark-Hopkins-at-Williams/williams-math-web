import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useParams } from 'react-router-dom'
import { getData } from '../adminApi'
import RecordFormPage from './RecordFormPage'

const routeKeyFor = (schema, item, index) => (schema.idField ? item[schema.idField] : index)

// listColumns entries are raw field keys (camelCase where the field itself
// is, e.g. "sectionNumber"), which doesn't read well as a table header --
// use the field's columnLabel if it declares one, else fall back to the key
// as before.
const columnLabel = (schema, col) => {
  const field = schema.fields.find((f) => f.key === col)
  return field?.columnLabel || col
}

const compareValues = (a, b, type) => {
  if (type === 'date') return Date.parse(a) - Date.parse(b)
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

const ListView = ({ schema }) => {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    getData(schema.file)
      .then((data) => setList(data[schema.arrayPath] || []))
      .catch((err) => setError(err.message))
  }, [schema.file, schema.arrayPath])

  useEffect(() => { reload() }, [reload])

  if (error) return <div className="admin-error">{error}</div>
  if (!list) return <div>loading...</div>

  const indexed = list.map((item, index) => ({ item, index }))
  const sorted = schema.sortBy
    ? [...indexed].sort((a, b) => {
        const dir = schema.sortBy.direction === 'desc' ? -1 : 1
        return dir * compareValues(a.item[schema.sortBy.key], b.item[schema.sortBy.key], schema.sortBy.type)
      })
    : indexed
  const columns = schema.listColumns || [schema.idField || 'index']

  return (
    <div className="admin-collection-list">
      <div className="admin-collection-header">
        <h2>{schema.pluralLabel || schema.label} ({list.length})</h2>
        <Link to="new" className="admin-button">+ Add {schema.label}</Link>
      </div>
      {list.length === 0 ? (
        <div>no {(schema.pluralLabel || schema.label).toLowerCase()} entries yet.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => <th key={col}>{columnLabel(schema, col)}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ item, index }) => (
              <tr key={routeKeyFor(schema, item, index) ?? index}>
                {columns.map((col) => <td key={col}>{String(item[col] ?? '')}</td>)}
                <td>
                  <Link to={encodeURIComponent(String(routeKeyFor(schema, item, index)))}>edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const EditRoute = ({ schema }) => {
  const { id } = useParams()
  return <RecordFormPage schema={schema} mode="edit" id={id} backTo=".." />
}

const CollectionListPage = ({ schema }) => (
  <Routes>
    <Route index element={<ListView schema={schema} />} />
    <Route path="new" element={<RecordFormPage schema={schema} mode="create" backTo=".." />} />
    <Route path=":id" element={<EditRoute schema={schema} />} />
  </Routes>
)

export default CollectionListPage
