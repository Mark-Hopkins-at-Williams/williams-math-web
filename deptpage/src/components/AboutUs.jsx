import { useState } from "react";
import { Link } from "react-router-dom";
import DbServices from "../services/db.js";
import Sidebar from "./Sidebar";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import Passage from "./Passage";
import Disclosure from "./Disclosure";
import { usePageMeta } from "../hooks/usePageMeta";

const ROLES = ["faculty", "staff", "emeriti"];

const Person = (props) => {
  const content = (
    <div style={{ display: "flex", flexFlow: "row nowrap", alignItems: "center", gap: "12px" }}>
      <img
        width="40"
        height="40"
        loading="lazy"
        style={{ objectFit: "cover", borderRadius: "50%", flexShrink: 0 }}
        src={props.photo}
        alt={`Photo of ${props.id}`}
      />
      <div style={{ minWidth: 0 }}>
        <div className="title" style={{ fontSize: "16px" }}>{props.id}</div>
        <div className="plaintext" style={{ fontSize: "12px", color: "#666666", lineHeight: 1.3 }}>{props.title}</div>
        {props.office ? (
          <div className="plaintext" style={{ fontSize: "12px", color: "#999999", lineHeight: 1.3 }}>{props.office}</div>
        ) : null}
      </div>
    </div>
  );

  const interests = props.interests ? (
    <div
      className="plaintext"
      style={{
        fontSize: "13px",
        color: "#777777",
        lineHeight: 1.4,
        marginTop: "10px",
      }}
    >
      {props.interests}
    </div>
  ) : null;

  const card = (
    <div className="soft-card" style={{ padding: "16px", display: "block", color: "inherit" }}>
      {content}
      {interests}
    </div>
  );

  if (!props.webpage || props.webpage.length === 0) return card;

  // A same-site path (e.g. Andrea Danyluk's memorial page) is a real SPA
  // route -- use client-side routing rather than a full page load, since a
  // full navigation to a deep route currently gets redirected to the
  // homepage by the production server's Apache config.
  return props.webpage.startsWith("/") ? (
    <Link to={props.webpage} style={{ display: "block", color: "inherit" }}>
      {card}
    </Link>
  ) : (
    <a href={props.webpage} target="_blank" style={{ display: "block", color: "inherit" }}>
      {card}
    </a>
  );
};

const AboutUs = ({ style, showSidebar, onClick }) => {
  const hubId = "about-us";

  usePageMeta({
    title: "About Us",
    description: "Meet the faculty, staff, and emeriti of the Williams College Mathematics Department.",
  });

  const [role, setRole] = useState(ROLES[0]);

  const renderIntro = () =>
    DbServices.getAboutContent().map((item) => (
      <Disclosure key={item.title} title={item.title}>
        <Passage title={null} photo={item.photo} article={item.article} />
      </Disclosure>
    ));

  const people = DbServices.getPeopleByRole(role);

  const renderBody = () => (
    <div id="frontpage-about-us" style={{ ...style, fontSize: "40px" }}>
      <div
        className="pagebody"
        style={{
          display: "flex",
          flexFlow: "row nowrap",
        }}
      >
        {showSidebar ? (
          <Sidebar
            onClick={onClick}
            title="about us"
            className="sidebar-about-us"
          />
        ) : (
          <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
        )}
        <div style={{ width: "100%", textAlign: "left" }}>
          <div style={{ marginTop: "24px", display: "flex", flexFlow: "row wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div className="eyebrow">Department Members</div>
            <div style={{ display: "flex", flexFlow: "row wrap", alignItems: "center", gap: "12px" }}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={r === role}
                  className={`pill-tab ${r === role ? "pill-tab-active" : ""}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
              alignItems: "start",
              marginTop: "18px",
            }}
          >
            {people.map((person) => (
              <Person
                key={person.id}
                id={person.id}
                photo={person.photo}
                role={person.role}
                title={person.title}
                office={person.office}
                webpage={person.webpage}
                interests={person.interests}
                onClick={onClick}
              />
            ))}
          </div>

          <div style={{ marginTop: "40px" }}>
            <div className="eyebrow">Learn More</div>
            <div style={{ marginTop: "14px" }}>
              {renderIntro()}
            </div>
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

export default AboutUs;
