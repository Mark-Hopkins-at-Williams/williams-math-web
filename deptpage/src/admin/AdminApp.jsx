import { useState } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { publish, logout } from './adminApi'
import { SaveProvider, useSaveContext } from './SaveContext'
import CollectionListPage from './components/CollectionListPage'
import newsSchema from './schemas/news'
import studentsSchema from './schemas/students'
import CoursesAdmin from './pages/CoursesAdmin'
import MajorAdmin from './pages/MajorAdmin'
import AboutUsAdmin from './pages/AboutUsEditor'
import ColloquiumAdmin from './pages/ColloquiumAdmin'
import FrontPageEditor from './pages/FrontPageEditor'
import NonMajorsEditor from './pages/NonMajorsEditor'
import ResearchEditor from './pages/ResearchEditor'
import './admin.css'

// Ordered to match the public site's own nav (see TopMenu.jsx's `pages`):
// home, about-us, plan-your-major, courses, colloquium, student-life,
// research, non-majors, news.
const SECTIONS = [
  { path: 'frontpage', label: 'Front Page' },
  { path: 'about', label: 'About Us' },
  { path: 'major', label: 'Plan Your Major' },
  { path: 'courses', label: 'Courses' },
  { path: 'students', label: 'Student Life' },
  { path: 'colloquium', label: 'Colloquium' },
  { path: 'research', label: 'Research Opportunities' },
  { path: 'nonmajors', label: 'Non-Majors' },
  { path: 'news', label: 'News' },
]

const TopBar = () => {
  const { doSave, dirty, saving, status, canSave } = useSaveContext()
  const [publishStatus, setPublishStatus] = useState('idle') // idle | running | success | error
  const [publishLog, setPublishLog] = useState('')

  const handlePublish = async () => {
    setPublishStatus('running')
    setPublishLog('')
    try {
      const result = await publish()
      setPublishStatus('success')
      setPublishLog(result.log || '')
    } catch (err) {
      setPublishStatus('error')
      setPublishLog(err.log || err.message)
    }
  }

  return (
    <nav className="admin-topbar">
      <div className="admin-topbar-row">
        <div className="admin-topbar-links">
          {SECTIONS.map((s) => (
            <NavLink key={s.path} to={`/admin/${s.path}`} className="admin-topbar-link">{s.label}</NavLink>
          ))}
        </div>
        <div className="admin-topbar-actions">
          <button
            type="button"
            className={`admin-button${status === 'saved' && !dirty ? ' admin-button-success' : ''}`}
            onClick={doSave}
            disabled={!canSave || !dirty || saving}
          >
            {saving ? 'Saving…' : status === 'saved' && !dirty ? 'Saved' : 'Save'}
          </button>
          <button type="button" className="admin-button" onClick={handlePublish} disabled={publishStatus === 'running'}>
            {publishStatus === 'running' ? 'Publishing…' : 'Publish to live site'}
          </button>
          <button type="button" className="admin-button" onClick={logout}>Log out</button>
        </div>
      </div>
      {status && status !== 'saved' ? (
        <div className="admin-publish-log">{status}</div>
      ) : null}
      {publishStatus === 'success' && <div className="admin-publish-ok">Published successfully.</div>}
      {publishStatus === 'error' && <pre className="admin-publish-log">{publishLog}</pre>}
    </nav>
  )
}

const AdminApp = () => (
  <SaveProvider>
    <div className="admin-app">
      <div className="admin-title-bar">ADMIN PANEL</div>
      <TopBar />
      <div className="admin-content">
        <Routes>
          <Route index element={<Navigate to="frontpage" replace />} />
          <Route path="frontpage" element={<FrontPageEditor />} />
          <Route path="news/*" element={<CollectionListPage schema={newsSchema} />} />
          <Route path="colloquium/*" element={<ColloquiumAdmin />} />
          <Route path="about/*" element={<AboutUsAdmin />} />
          <Route path="courses/*" element={<CoursesAdmin />} />
          <Route path="students/*" element={<CollectionListPage schema={studentsSchema} />} />
          <Route path="research" element={<ResearchEditor />} />
          <Route path="major/*" element={<MajorAdmin />} />
          <Route path="nonmajors" element={<NonMajorsEditor />} />
        </Routes>
      </div>
    </div>
  </SaveProvider>
)

export default AdminApp
