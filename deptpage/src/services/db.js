import majorData from '../../data/major.json'
import nonMajorsData from '../../data/nonmajors.json'
import aboutData from '../../data/about.json'
import people from '../../data/people.json'
import courses from '../../data/courses.json'
import colloquiumData from '../../data/colloquium.json'
import studentData from '../../data/students.json'
import researchData from '../../data/research.json'
import newsData from '../../data/news.json'
import frontPageData from '../../data/frontpage.json'
import { withBase } from '../utils/withBase.js'


// A talk from earlier today (or yesterday) shouldn't vanish from the list
// the moment its start time passes -- let it linger for one day.
const colloquiumGracePeriod = 24 * 60 * 60 * 1000
const maxColloquiaToShow = 10;

// Data files hardcode asset paths as site-root-absolute (e.g. "/images/...")
// so that they resolve the same from any route depth. That assumption breaks
// when the app is served from a subpath (e.g. /~ephs/) instead of the
// domain root, so rewrite them here, once, to be relative to Vite's BASE_URL.
// This is value-based (not key-based) so it also catches array fields like
// "gallery", not just single-image "photo"/"icon" fields.
const rewriteAssetPaths = (value) => {
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      if (typeof item === "string" && item.startsWith("/images/")) {
        value[i] = withBase(item)
      } else {
        rewriteAssetPaths(item)
      }
    })
  } else if (value && typeof value === "object") {
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === "string" && val.startsWith("/images/")) {
        value[key] = withBase(val)
      } else {
        rewriteAssetPaths(val)
      }
    }
  }
}

const allData = [majorData, nonMajorsData, aboutData, people, courses, colloquiumData, studentData, researchData, newsData, frontPageData]
allData.forEach(rewriteAssetPaths)

// Walks the same data every page component reads its images from and
// collects every asset path already rewritten by rewriteAssetPaths above,
// so callers can warm the browser's image cache for pages the visitor
// hasn't navigated to yet without hardcoding a separate image list.
const collectImagePaths = (value, out) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectImagePaths(item, out))
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((val) => collectImagePaths(val, out))
  } else if (typeof value === "string" && value.includes("/images/")) {
    out.add(value)
  }
}

const getAllImagePaths = () => {
  const paths = new Set()
  allData.forEach((data) => collectImagePaths(data, paths))
  return [...paths]
}

const getFrontPageSpotlightInfo = () => {
  return frontPageData.spotlight
}

const getFrontPageContent = () => {
  return frontPageData.content
}

const getCatalog = () => {
  return courses.catalog
}

const getColloquiumDisclaimer = () => {
  return colloquiumData.disclaimer
}

const getUpcomingColloquia = () => {
  const cutoff = Date.now() - colloquiumGracePeriod
  return (
    colloquiumData.events
      .filter(event => (
        Date.parse(event.date) >= cutoff
      )).toSorted((event1, event2) => (
        Date.parse(event1.date) - Date.parse(event2.date)
      )).slice(0, maxColloquiaToShow)
  )
}


const fetchExternalTextFile = filename => {
  return fetch(withBase(`/${filename}`))
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}: ${response.status}`)
      }
      return response.text()
    })
    .catch(error => {
      console.error(error)
      return ''
    })
}



const getCourseSections = (semester) => {
  return courses.sections.filter(course => course.semester === semester)
}

const SEASON_ORDER = { "Winter": 0, "Spring": 1, "Summer": 2, "Fall": 3 }

// Derives the semesters to show as tabs directly from the section data,
// so adding a new semester's sections is all it takes -- no separate
// constant to remember to update.
const getSemesters = () => {
  const semesters = [...new Set(courses.sections.map(section => section.semester))]
  return semesters.toSorted((a, b) => {
    const [seasonA, yearA] = a.split(" ")
    const [seasonB, yearB] = b.split(" ")
    if (yearA !== yearB) return Number(yearA) - Number(yearB)
    return SEASON_ORDER[seasonA] - SEASON_ORDER[seasonB]
  })
}

const getCourseById = courseId => {
  return courses.catalog.find(course => course.id === courseId)
}


const getMajorRequirement = courseId => { 
  return majorData.requirements.find((datum) => datum.id === courseId)
}

const getMajorPaths = () => {
  return majorData.paths
}

const getPlanYourMajorContent = () => {
  return majorData.content
}

const getMajorPlanningDisclaimer = () => {
  return majorData.disclaimer
}

const getNonMajorsContent = () => {
  return nonMajorsData.content
}

const getAboutContent = () => {
  return aboutData.content
}

// Sort key for a display name like "Colin C. Adams" or "Guilford L. Spencer II":
// the last word, skipping generational suffixes, so middle names and initials
// don't affect the order.
const NAME_SUFFIXES = new Set(['JR', 'JR.', 'SR', 'SR.', 'II', 'III', 'IV'])
const getLastName = (name) => {
  const fields = name.trim().split(/\s+/)
  while (fields.length > 1 && NAME_SUFFIXES.has(fields[fields.length - 1])) fields.pop()
  return fields[fields.length - 1]
}

const getPeople = () => {
  return people.people.toSorted((a, b) => {
    const nameA = getLastName(a.id.toUpperCase())
    const nameB = getLastName(b.id.toUpperCase())
    if (nameA !== nameB) return nameA < nameB ? -1 : 1
    return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)
  });
}

const getPeopleByRole = (role) => {
  return getPeople().filter(person =>
    person.role === role
  )
}

const nameEndpoints = (name) => {
  const parts = name.trim().split(/\s+/)
  return { first: parts[0], last: parts[parts.length - 1] }
}

const getPersonByName = (name) => {
  const { first, last } = nameEndpoints(name)
  return people.people.find(person => {
    const personEndpoints = nameEndpoints(person.id)
    return personEndpoints.first === first && personEndpoints.last === last
  })
}

const getStudentGroups = () => {
  return studentData.groups
}


const getResearchContent = () => {
  return researchData.content
}


const getNewsItems = () => {
  return newsData.articles     
}



export default {
  getFrontPageSpotlightInfo,
  getFrontPageContent,
  getMajorRequirement,
  getMajorPaths,
  getPlanYourMajorContent,
  getMajorPlanningDisclaimer,
  getNonMajorsContent,
  getAboutContent,
  getPeople,
  getPeopleByRole,
  getPersonByName,
  getCatalog,
  getCourseSections,
  getSemesters,
  getCourseById,
  getUpcomingColloquia,
  getColloquiumDisclaimer,
  getStudentGroups,
  getResearchContent,
  getNewsItems,
  fetchExternalTextFile,
  getAllImagePaths
}