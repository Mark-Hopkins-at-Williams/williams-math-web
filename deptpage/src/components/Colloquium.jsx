import DbServices from "../services/db.js";
import Sidebar from "./Sidebar";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import { usePageMeta } from "../hooks/usePageMeta";

const EventRow = ({ event }) => {
  const location = event.location ? event.location : "Wachenheim 113";
  const time = event.time ? event.time : "1:00pm";
  const hasTitle = event.title && event.title.length > 0;
  const primary = hasTitle ? event.title : event.speaker;
  const secondary = hasTitle ? `${event.speaker}, ${event.affiliation}` : event.affiliation;
  const detail = (event.abstract && event.abstract.length > 0) ? event.abstract : event.bio;
  const photoSize = detail ? 140 : 100;

  return (
    <div className="soft-card" style={{ padding: "20px" }}>
      <div className="news-tag" style={{ color: "var(--color-colloquium)" }}>{event.date}</div>
      <div className="colloquium-event-row" style={{ display: "flex", flexFlow: "row nowrap", gap: "20px", marginTop: "10px", alignItems: detail ? "stretch" : "center" }}>
        <img
          className="colloquium-event-photo"
          width={photoSize}
          height={photoSize}
          loading="lazy"
          style={{ objectFit: "cover", borderRadius: "12px", flexShrink: 0 }}
          src={event.photo}
          alt={`Photo of ${event.speaker}`}
        />
        <div style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
          <div className="title" style={{ fontSize: "20px" }}>{primary}</div>
          <div className="plaintext" style={{ fontSize: "15px", color: "#666666", marginTop: "3px" }}>{secondary}</div>
          <div className="plaintext" style={{ fontSize: "13px", color: "#999999", marginTop: "3px" }}>
            {location} &middot; {time}
          </div>
          {detail ? (
            <div className="plaintext" style={{ fontSize: "16px", color: "#444444", lineHeight: 1.5, marginTop: "10px" }}>
              {detail}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Colloquium = ({ style, showSidebar, onClick }) => {
  const hubId = "colloquium";

  usePageMeta({
    title: "Colloquium",
    description: "Upcoming talks in the Williams College Mathematics Colloquium series.",
  });

  const events = DbServices.getUpcomingColloquia();

  const renderContent = () => {
    if (events.length > 0) {
      return (
        <div>
          <div style={{ display: "flex", flexFlow: "column nowrap", gap: "12px" }}>
            {events.map((event, i) => (
              <EventRow key={`event-${i}`} event={event} />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div
            style={{
              border: "solid 5px #FFBE0A",
              marginBottom: "10px",
            }}
          >
            <img src={`${import.meta.env.BASE_URL}images/misc/wachenheim.jpg`} width="100%" />
          </div>
          <div
            className="plaintext"
            style={{
              display: "flex",
            }}
          >
            Our colloquium is currently on hiatus, but come back for updates
            when we approach the start of the semester! The Mathematics
            Colloquium at Williams College takes place on Mondays and
            Wednesdays from 1:00pm to 1:45pm in Wachenheim 113.
          </div>
        </div>
      );
    }
  };

  const renderBody = () => (
    <div
      id="colloquium"
      style={{
        ...style,
        fontSize: "36px",
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
            title="colloquium"
            className="sidebar-colloquium"
            onClick={onClick}
          />
        ) : (
          <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
        )}
        <div style={{ width: "95%", textAlign: "left" }}>
          <div style={{ marginTop: "24px", marginBottom: "20px" }}>
            <div className="eyebrow">Schedule</div>
            <div className="plaintext" style={{ fontSize: "15px", color: "#666666", marginTop: "8px" }}>
              {DbServices.getColloquiumDisclaimer()}
            </div>
          </div>
          {renderContent()}
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

export default Colloquium;
