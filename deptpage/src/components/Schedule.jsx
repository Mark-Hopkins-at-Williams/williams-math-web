import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { DndContext } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import DbServices from '../services/db.js'





const ScheduleChooser = ({ current, onSelect, largeFontSize, smallFontSize, stacked, matchHeight }) => {

  const paths = DbServices.getMajorPaths()

  const boxRef = useRef()
  const contentRef = useRef()
  const [fontScale, setFontScale] = useState(1)

  const capHeight = !stacked && matchHeight > 0

  useEffect(() => {
    setFontScale(1)
  }, [capHeight, matchHeight, largeFontSize, smallFontSize, paths.length])

  useLayoutEffect(() => {
    if (!capHeight) return
    const box = boxRef.current
    const content = contentRef.current
    if (!box || !content) return

    const available = box.clientHeight
    const natural = content.scrollHeight
    if (available > 0 && natural > available) {
      setFontScale(prev => Math.max(0.5, prev * (available / natural) * 0.97))
    }
  })

  // The boost was tuned for the narrow (~21%-width) sidebar layout; in
  // stacked mode each item already gets a much wider column (outerWidth/3),
  // so the same boost is oversized and forces ugly mid-word wraps.
  const CHOOSER_FONT_BOOST = stacked ? 1.0 : 1.4
  const chooserLargeFontSize = `${parseFloat(largeFontSize) * CHOOSER_FONT_BOOST * fontScale}px`
  const chooserSmallFontSize = `${parseFloat(smallFontSize) * CHOOSER_FONT_BOOST * fontScale}px`

  const renderPathDescription = (pathIndex) => (
    <div
      key={`major-path-${pathIndex}`}
      onClick={() => onSelect(pathIndex)}
      style={{
        borderStyle: current === pathIndex ? 'solid' : 'none',
        padding: '5px',
        flexGrow: stacked ? 1 : 0,
        flexShrink: stacked ? 1 : 0,
        minWidth: stacked ? 0 : undefined,
      }}>
      <div>{paths[pathIndex].icon}</div>
      <div>{paths[pathIndex].id}</div>
      <div style={{ fontSize: chooserSmallFontSize }}>{paths[pathIndex].description}</div>
    </div>
  )

  return (
    <div
      ref={boxRef}
      className="plaintext"
      style={{
        fontSize: chooserLargeFontSize,
        padding: '5px',
        paddingLeft: '0px',
        boxSizing: 'border-box',
        flexBasis: stacked ? 'auto' : '21%',
        flexGrow: 0,
        flexShrink: 0,
        width: stacked ? '100%' : undefined,
        minWidth: stacked ? 0 : '160px',
        maxWidth: stacked ? 'none' : '230px',
        height: capHeight ? `${matchHeight}px` : undefined,
        overflow: capHeight ? 'hidden' : undefined,
      }}>
      <div
        ref={contentRef}
        style={{
          display: 'flex',
          flexFlow: stacked ? 'row nowrap' : 'column nowrap',
          gap: '10px',
        }}>
        <div className="plan-your-major-choose-your-path" style={{ alignSelf: stacked ? 'center' : undefined }}>
          choose your path:
        </div>
        {[...Array(paths.length).keys()].map((i) => renderPathDescription(i))}
      </div>
    </div>
  )
}

function Year({ number, style, largeFontSize, smallFontSize }) {

  return (
    <div className="title" style={{
      textAlign: 'center',
      alignSelf: 'center',
    }}>
      <div style={{ fontSize: smallFontSize }}>year</div>
      <div style={{ width: style.width, fontSize: largeFontSize }}>{number}</div>
    </div>
  );
}


function MajorRequirement(props) {

  const dept = props.id.split(' ')[0]
  const number = props.id.split(' ')[1].split('(')[0]

  const containerRef = useRef()
  const labelRef = useRef()
  const [labelScale, setLabelScale] = useState(1)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });

  useLayoutEffect(() => {
    const el = labelRef.current
    if (!el || !el.parentElement) return

    const measure = () => {
      const available = el.parentElement.clientWidth
      const natural = el.scrollWidth
      if (available > 0 && natural > 0) {
        setLabelScale(Math.min(1, (available / natural) * 0.85))
      }
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [props.largeFontSize, props.id])

  const basicStyle = {
    width: '100%',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    textAlign: 'center',
  };


  const style = transform && !props.moving ? {
    ...basicStyle,
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : basicStyle


  return (
    <div ref={containerRef}>
      <div className={props.className} ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <div
          ref={labelRef}
          onMouseDown={() => props.onClick(props.id)}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
            display: 'flex',
            flexFlow: 'row nowrap',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: '4px',
            whiteSpace: 'nowrap',
            transform: `scale(${labelScale})`,
            transformOrigin: 'center center',
          }}>
          <div className="plan-your-major-dept" style={{ fontSize: props.largeFontSize }}>{dept}</div>
          <div className="plan-your-major-course-number" style={{ fontSize: props.largeFontSize }}>{number}</div>
        </div>
      </div>
    </div>
  );
}


const Semester = (props) => {

  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  return (
    <div ref={setNodeRef} style={{
      width: props.style.width,
      boxSizing: 'border-box',
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      padding: "10px",
      minHeight: '60px',
      backgroundColor: isOver ? '#f0f4ff' : undefined,
    }}>
      <div style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        gap: '4px',
        minWidth: 0,
      }}>
        {props.children}
      </div>
    </div>
  )
}

const InfoBox = ({ info, warning, error, fontSize }) => {

  const boxClass = (
    error ? "plan-your-major-infobox-error" :
      (warning ? "plan-your-major-infobox-warning" : "plan-your-major-infobox")
  )

  const boxRef = useRef()
  const contentRef = useRef()
  const [fontScale, setFontScale] = useState(1)

  useEffect(() => {
    setFontScale(1)
  }, [info, warning, error, fontSize])

  useLayoutEffect(() => {
    const box = boxRef.current
    const content = contentRef.current
    if (!box || !content) return

    const available = box.clientHeight
    const natural = content.scrollHeight
    if (available > 0 && natural > available) {
      setFontScale(prev => Math.max(0.5, prev * (available / natural) * 0.97))
    }
  })

  const contentFontSize = `${parseFloat(fontSize) * fontScale}px`

  const renderWarning = () => (
    warning ?
      <span className="plan-your-major-infobox-warning-text">{warning}
      </span> : null
  )

  const renderError = () => (
    error ?
      <span className="plan-your-major-infobox-error-text">{error}
      </span> : null
  )

  return (
    <div ref={boxRef} className={boxClass} style={{
      fontSize: contentFontSize,
      overflow: 'hidden',
    }}>
      <div className="centered">
        <div ref={contentRef}>
          {info} {renderWarning()} {renderError()}
        </div>
      </div>
    </div>
  )
}




const Schedule = () => {

  const [schedule, setSchedule] = useState([])
  const [violations, setViolations] = useState([])
  const [warnings, setWarnings] = useState([])
  const [highlight, setHighlight] = useState(null)
  const [currentPath, setCurrentPath] = useState(0)
  const [containerWidth, setContainerWidth] = useState(600)
  const [contentHeight, setContentHeight] = useState(0)
  const [outerWidth, setOuterWidth] = useState(900)

  const outerRef = useRef()
  const containerRef = useRef()
  const fallRowRef = useRef()
  const springRowRef = useRef()

  const prebakedSchedules = DbServices.getMajorPaths()

  const STACK_BREAKPOINT = 600
  const stacked = outerWidth < STACK_BREAKPOINT

  useEffect(() => {
    const schedule = prebakedSchedules[currentPath].path
    setSchedule(schedule)
    auditSchedule(schedule)
    setHighlight(null)
  }, [currentPath])

  useEffect(() => {
    if (!outerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setOuterWidth(entry.contentRect.width);
    });
    ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [])

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
      setContentHeight(entry.contentRect.height);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [])

  useLayoutEffect(() => {
    if (!fallRowRef.current || !springRowRef.current) return
    fallRowRef.current.style.height = ''
    springRowRef.current.style.height = ''
    const h = Math.max(
      fallRowRef.current.scrollHeight,
      springRowRef.current.scrollHeight
    )
    fallRowRef.current.style.height = `${h}px`
    springRowRef.current.style.height = `${h}px`
  }, [schedule, containerWidth])

  const computeFontSize = (maxSize) => {
    return Math.min(maxSize, (containerWidth / 600) * maxSize)
  }
  const largeFontSize = `${computeFontSize(24)}px`
  const smallFontSize = `${computeFontSize(16)}px`


  function handleDragEnd(event) {
    const { active, over } = event;
    if (over) {
      moveMajorRequirement(active.id, over.id)
    }
  }

  const getRequirementClassName = (courseId) => {
    if (highlight === courseId) {
      if (violations.includes(courseId)) {
        return "major-req-highlight-error"
      } else if (warnings.includes(courseId)) {
        return "major-req-highlight-warning"
      } else {
        return "major-req-highlight"
      }
    } else {
      if (violations.includes(courseId)) {
        return "major-req-error"
      } else if (warnings.includes(courseId)) {
        return "major-req-warning"
      } else {
        return "major-req"
      }
    }
  }

  const addMajorRequirement = (sem, courseId) => {
    let nextMajorRequirements = [...new Set(sem.courses.concat([courseId]))]
    nextMajorRequirements.sort()
    return { ...sem, courses: nextMajorRequirements }
  }

  const removeMajorRequirement = (sem, courseId) => {
    let result = { ...sem, courses: sem.courses.filter(course => course !== courseId) }
    return result
  }

  const checkPrereqs = (courseId, taken) => {
    let course = DbServices.getMajorRequirement(courseId)
    if (!course) return true
    return !course.prereqs ? true : course.prereqs.reduce((acc, curr) => acc && taken.has(curr), true)
  }

  const checkRecommendations = (courseId, taken) => {
    let course = DbServices.getMajorRequirement(courseId)
    if (!course || !course.recommended) return true
    return course.recommended.reduce((acc, curr) => acc || taken.has(curr), false)
  }

  const auditSchedule = (schedule) => {
    let taken = new Set();
    let errors = [];
    let warnings = [];
    for (let i = 0; i < schedule.length; i++) {
      schedule[i].courses.forEach(course => {
        if (!checkPrereqs(course, taken)) {
          errors.push(course)
        } else if (!checkRecommendations(course, taken)) {
          warnings.push(course)
        }
      })
      schedule[i].courses.forEach(course =>
        taken.add(course)
      )
    }
    setWarnings([...warnings])
    setViolations([...errors])
  }

  const moveMajorRequirement = (courseId, newSemester) => {
    let revised =
      schedule
        .map(sem =>
          sem.semester === newSemester ? addMajorRequirement(sem, courseId) : removeMajorRequirement(sem, courseId)
        )
    setSchedule(revised);
    auditSchedule(revised);
  }

  const defaultInfo = "Click on any course for more information. Drag courses from one semester to another to experiment with alternatives."



  const renderSemester = (sem, widthFraction = 0.2) => {
    const sizeFactor = Math.min(1, 3 / Math.max(sem.courses.length, 1))
    const semLargeFontSize = `${computeFontSize(24 * sizeFactor)}px`
    const semSmallFontSize = `${computeFontSize(16 * sizeFactor)}px`
    return (
      <Semester
        key={sem.semester}
        id={sem.semester}
        title={sem.semester}
        titleAlt={sem.semester}
        style={{
          width: widthFraction * containerWidth,
          flexGrow: 1,
          flexShrink: 1,
        }}>
        {sem.courses.map(course => (
          <div key={course} style={{ minWidth: 0 }}>
            <MajorRequirement
              key={course}
              id={course}
              largeFontSize={semLargeFontSize}
              smallFontSize={semSmallFontSize}
              className={getRequirementClassName(course)}
              issue={violations.includes(course)}
              onClick={courseId => setHighlight(courseId)}
            />
          </div>
        ))}
      </Semester>
    )
  }

  const getInfo = () => {
    if (highlight) {
      let course = DbServices.getMajorRequirement(highlight)
      return course?.info ?? defaultInfo
    } else {
      return defaultInfo
    }
  }

  const getWarning = () => {
    const course = highlight ? DbServices.getMajorRequirement(highlight) : null
    return (course && warnings.includes(highlight) && course.warning) ? course.warning : null
  }

  const getError = () => {
    const course = highlight ? DbServices.getMajorRequirement(highlight) : null
    return (course && violations.includes(highlight) && course.error) ? course.error : null
  }

  const rowStyle = {
    display: 'flex',
    flexFlow: 'row nowrap',
    borderTopStyle: 'solid',
  }

  const labelWidth = 0.08 * containerWidth

  const renderSeasonLabel = (name) => (
    <div className="title" style={{
      width: labelWidth,
      flexShrink: 0,
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: largeFontSize,
      padding: '4px',
    }}>
      {name}
    </div>
  )

  return (
    <div style={{ width: '100%' }}>
      <div ref={outerRef} style={{ width: '100%', display: 'flex', flexFlow: stacked ? 'column nowrap' : 'row nowrap', alignItems: stacked ? 'stretch' : 'flex-start' }}>

        <ScheduleChooser stacked={stacked} matchHeight={contentHeight} largeFontSize={largeFontSize} smallFontSize={smallFontSize} current={currentPath} onSelect={setCurrentPath} />

        <div ref={containerRef} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
          <InfoBox fontSize={largeFontSize} info={getInfo()} warning={getWarning()} error={getError()} />

          {schedule.length > 0 ? (
            <DndContext onDragEnd={handleDragEnd}>
              <div className="title" style={{ display: 'flex', flexFlow: 'column nowrap' }}>
                {/* Year header row */}
                <div style={{ display: 'flex', flexFlow: 'row nowrap', paddingLeft: `${labelWidth}px` }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} style={{ flexGrow: 1, flexShrink: 1, flexBasis: `${0.2 * containerWidth}px`, textAlign: 'center' }}>
                      <div style={{ fontSize: smallFontSize }}>year</div>
                      <div style={{ fontSize: largeFontSize }}>{n}</div>
                    </div>
                  ))}
                </div>
                {/* Fall row */}
                <div ref={fallRowRef} style={rowStyle}>
                  {renderSeasonLabel('fall')}
                  {renderSemester(schedule[1])}
                  {renderSemester(schedule[3])}
                  {renderSemester(schedule[5])}
                  {renderSemester(schedule[7])}
                </div>
                {/* Spring row */}
                <div ref={springRowRef} style={rowStyle}>
                  {renderSeasonLabel('spr')}
                  {renderSemester(schedule[2])}
                  {renderSemester(schedule[4])}
                  {renderSemester(schedule[6])}
                  {renderSemester(schedule[8])}
                </div>
              </div>
            </DndContext>
          ) : null}
        </div>
      </div>
      <div className="plaintext" style={{ fontSize: smallFontSize, padding: '5px', opacity: 0.7 }}>
        {DbServices.getMajorPlanningDisclaimer()}
      </div>
    </div>
  )

}

export default Schedule