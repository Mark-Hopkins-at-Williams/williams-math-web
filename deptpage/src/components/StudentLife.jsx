import DbServices from '../services/db.js'
import Sidebar from './Sidebar'
import TopMenu from './TopMenu'
import WilliamsHeader from './WilliamsHeader'
import WilliamsFooter from './WilliamsFooter'
import Spacer from './Spacer'
import { usePageMeta } from '../hooks/usePageMeta'
import Markdown from 'react-markdown'
import { markdownImageComponent } from '../utils/markdownImageComponent.jsx'

// Group descriptions and extra paragraphs are markdown, so data can use
// [link text](url) instead of spelling out raw URLs. Each renders inline
// inside its own styled div, so drop react-markdown's wrapping <p>.
const inlineMarkdown = { ...markdownImageComponent, p: ({ children }) => <>{children}</> }
const GroupText = ({ children }) => <Markdown components={inlineMarkdown}>{children}</Markdown>

// photo and year are optional: some boards list officer roles (e.g.
// "President") rather than class years, and don't have headshots.
const Student = ({ name, year, role, photo }) => (
  <div style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'center', gap: '10px' }}>
    {photo ? (
      <img
        width="40"
        height="40"
        loading="lazy"
        style={{ objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }}
        src={photo}
        alt={`Photo of ${name}`}
      />
    ) : null}
    <div>
      <div className="title" style={{ fontSize: '14px' }}>{name}</div>
      <div className="plaintext" style={{ fontSize: '12px', color: '#888888' }}>
        {[role, year ? `class of ${year}` : null].filter(Boolean).join(', ')}
      </div>
    </div>
  </div>
)

const GalleryGrid = ({ photos }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '16px' }}>
    {photos.map((photo) => (
      <img key={photo} style={{ width: '100%', borderRadius: '10px', display: 'block', objectFit: 'cover' }} loading="lazy" src={photo} alt="" />
    ))}
  </div>
)

const GroupCard = ({ group }) => {
  const nameContent = <div className="title" style={{ fontSize: '22px' }}>{group.name}</div>

  return (
    <div className="soft-card" style={{ padding: '20px' }}>
      <div className="news-tag" style={{ color: 'var(--color-student-life)' }}>{group.abbreviation}</div>
      <div style={{ marginTop: '4px' }}>
        {group.webpage ? (
          <a href={group.webpage} target="_blank">{nameContent}</a>
        ) : nameContent}
      </div>
      {group.photo ? (
        <img
          style={{ width: '100%', borderRadius: '10px', display: 'block', marginTop: '14px' }}
          loading="lazy"
          src={group.photo}
          alt={`Photo for ${group.name}`}
        />
      ) : null}
      <div className="plaintext" style={{ marginTop: '10px', color: '#444444' }}><GroupText>{group.description}</GroupText></div>
      {group.details ? group.details.map((detail, i) => (
        <div key={i} className="plaintext" style={{ marginTop: '10px', color: '#444444' }}><GroupText>{detail}</GroupText></div>
      )) : null}
      {group.leadership && group.leadership.length > 0 ? (
        <div style={{ marginTop: '18px' }}>
          <div className="title" style={{ fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#999999', marginBottom: '12px' }}>
            Board Members
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {group.leadership.map((person) => (
              <Student key={person.name} name={person.name} year={person.year} role={person.role} photo={person.photo} />
            ))}
          </div>
        </div>
      ) : null}
      {group.gallery ? <GalleryGrid photos={group.gallery} /> : null}
    </div>
  )
}

const StudentLife = ({ style, onClick, showSidebar }) => {
  const hubId = "student-life"

  usePageMeta({
    title: "Student Life",
    description: "Student groups and activities in the Williams College Mathematics Department.",
  })

  const groups = DbServices.getStudentGroups()

  const renderBody = () => (
    <div
      id="student-life"
      style={{
        ...style,
        fontSize: "40px"
      }}
    >
      <div className="pagebody" style={{
        display: 'flex',
        flexFlow: 'row nowrap',
      }}>
        {showSidebar ? <Sidebar onClick={onClick} title="student life" className="sidebar-student-life" /> : <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: '80px' }} />}

        <div style={{ width: '100%', textAlign: 'left' }}>
          <div style={{ marginTop: '24px' }}>
            <div className="eyebrow">Student Groups</div>
          </div>

          <div style={{ display: 'flex', flexFlow: 'column nowrap', gap: '16px', marginTop: '20px' }}>
            {groups.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <WilliamsHeader />
      <TopMenu
        onClick={onClick}
        currentPage={hubId}
        width={style.width}
      />
      {renderBody()}
      <Spacer height="10px" />
      <WilliamsFooter />
    </div>
  )
}

export default StudentLife;
