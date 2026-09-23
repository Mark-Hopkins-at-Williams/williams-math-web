import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import CollectionListPage from '../components/CollectionListPage'
import { catalogSchema, sectionsSchema } from '../schemas/courses'

const CoursesAdmin = () => (
  <div>
    <h2>Courses</h2>
    <nav className="admin-tabs">
      <NavLink to="/admin/courses/sections">sections</NavLink>
      <NavLink to="/admin/courses/catalog">course catalog</NavLink>
    </nav>
    <Routes>
      <Route index element={<Navigate to="sections" replace />} />
      <Route path="sections/*" element={<CollectionListPage schema={sectionsSchema} />} />
      <Route path="catalog/*" element={<CollectionListPage schema={catalogSchema} />} />
    </Routes>
  </div>
)

export default CoursesAdmin
