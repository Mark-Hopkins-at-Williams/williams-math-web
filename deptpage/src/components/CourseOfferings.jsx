import DbServices from "../services/db.js";
import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import { usePageMeta } from "../hooks/usePageMeta";

const groupSectionsByCourse = (sections) => {
  const order = [];
  const byCourse = {};
  sections.forEach((section) => {
    if (!byCourse[section.course]) {
      byCourse[section.course] = [];
      order.push(section.course);
    }
    byCourse[section.course].push(section);
  });
  return order.map((course) => ({ course, sections: byCourse[course] }));
};

const CourseSectionRow = ({ section }) => {
  const firstInstructor = DbServices.getPersonByName(section.instructors[0]);
  const courseObj = DbServices.getCourseById(section.course);

  const content = (
    <div style={{ display: "flex", flexFlow: "row nowrap", alignItems: "center", gap: "10px" }}>
      <img
        width="26"
        height="26"
        loading="lazy"
        style={{ objectFit: "cover", borderRadius: "50%", flexShrink: 0 }}
        src={firstInstructor ? firstInstructor.photo : courseObj.icon}
        alt={firstInstructor ? `Photo of ${firstInstructor.id}` : `Icon for ${section.course}`}
      />
      <div className="plaintext" style={{ fontSize: "14px", fontWeight: 600, flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {section.instructors.join(" and ")}
      </div>
      <div className="plaintext" style={{ fontSize: "12px", color: "#808080", whiteSpace: "nowrap" }}>
        {section.lecture}
      </div>
    </div>
  );

  return section.webpage && section.webpage.length > 0 ? (
    <a
      className="linkbox"
      href={section.webpage}
      target="_blank"
      style={{ display: "block", padding: "6px 8px", borderRadius: "8px" }}
    >
      {content}
    </a>
  ) : (
    <div style={{ padding: "6px 8px" }}>{content}</div>
  );
};

const CourseCard = ({ course, sections }) => {
  const courseObj = DbServices.getCourseById(course);

  return (
    <div className="soft-card" style={{ padding: "16px", display: "flex", flexFlow: "column nowrap", gap: "10px" }}>
      <div style={{ display: "flex", flexFlow: "row nowrap", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <div className="title" style={{ fontSize: "20px" }}>{course}</div>
        {sections.length > 1 ? (
          <div className="plaintext" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#999999", whiteSpace: "nowrap" }}>
            {sections.length} sections
          </div>
        ) : null}
      </div>
      <div className="plaintext" style={{ fontSize: "14px", color: "#555555", marginTop: "-6px" }}>
        {courseObj.title}
      </div>
      <div style={{ display: "flex", flexFlow: "column nowrap" }}>
        {sections.map((section) => (
          <CourseSectionRow key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};

const CourseOfferings = ({ style, showSidebar, onClick }) => {
  const hubId = "courses";

  usePageMeta({
    title: "Courses",
    description: "Course offerings and schedules for the Williams College Mathematics Department.",
  });

  const semesters = DbServices.getSemesters();
  const [semester, setSemester] = useState(semesters[0]);

  const groups = groupSectionsByCourse(DbServices.getCourseSections(semester));

  const renderBody = () => (
    <div
      id="frontpage-course-offerings"
      style={{
        ...style,
        fontSize: "40px",
      }}
    >
      <div
        className="pagebody"
        style={{
          display: "flex",
          flexFlow: "row nowrap",
        }}
      >
        {showSidebar ? (
          <Sidebar
            title="current course offerings"
            className="sidebar-course-offerings"
            onClick={onClick}
          />
        ) : (
          <div
            className="left-spacer"
            style={{ flexGrow: 0, flexShrink: 0, width: "80px" }}
          />
        )}
        <div style={{ width: "95%", textAlign: "left" }}>
          <div style={{ marginTop: "24px", display: "flex", flexFlow: "row wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div style={{ display: "flex", flexFlow: "row wrap", alignItems: "baseline", gap: "6px" }}>
              <div className="eyebrow">Course Schedule</div>
              <div className="plaintext" style={{ fontSize: "13px", color: "#888888", textTransform: "none", letterSpacing: "normal", fontWeight: "normal" }}>
                (<Link to="/non-majors/" onClick={() => window.scrollTo(0, 0)} className="link">🧭 placement chart</Link>)
              </div>
              <div className="plaintext" style={{ fontSize: "13px", color: "#888888", textTransform: "none", letterSpacing: "normal", fontWeight: "normal" }}>
                (<a href="https://catalog.williams.edu/MATH/" target="_blank" className="link">📚 course catalog</a>)
              </div>
            </div>
            <div style={{ display: "flex", flexFlow: "row wrap", alignItems: "center", gap: "12px" }}>
              {semesters.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={s === semester}
                  className={`pill-tab ${s === semester ? "pill-tab-active" : ""}`}
                  onClick={() => setSemester(s)}
                >
                  {s.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "18px",
              alignItems: "start",
              marginTop: "20px",
            }}
          >
            {groups.map((group) => (
              <CourseCard key={group.course} course={group.course} sections={group.sections} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <WilliamsHeader />
      <TopMenu onClick={onClick} currentPage={hubId} width={style.width} />
      {renderBody()}
      <Spacer height="10px" />
      <WilliamsFooter />
    </div>
  );
};

export default CourseOfferings;
