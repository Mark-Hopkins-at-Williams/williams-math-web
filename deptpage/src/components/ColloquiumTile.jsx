import DbServices from "../services/db.js";
import { Link } from "react-router-dom";

const ColloquiumTile = ({ onClick, style }) => {
  const events = DbServices.getUpcomingColloquia();
  const event = events.length > 0 ? events[0] : null;

  if (!event) {
    return (
      <Link
        to={{ pathname: `/colloquium` }}
        onClick={() => { onClick("colloquium"); window.scrollTo(0, 0); }}
        className="soft-card"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          boxSizing: "border-box",
          color: "inherit",
          ...style,
        }}
      >
        <div className="plaintext" style={{ fontSize: "14px" }}>
          <span className="news-tag" style={{ color: "var(--color-colloquium)" }}>Colloquium</span>{" "}
          our colloquium is currently on hiatus, but check back for updates when
          we approach the start of the semester.
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={{ pathname: `/colloquium` }}
      onClick={() => onClick("colloquium")}
      className="soft-card"
      style={{
        display: "flex",
        flexFlow: "row nowrap",
        alignItems: "center",
        gap: "14px",
        padding: "16px",
        boxSizing: "border-box",
        color: "inherit",
        ...style,
      }}
    >
      <img
        src={event.photo}
        style={{ width: "96px", height: "96px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }}
        alt={`photo of ${event.speaker}`}
      />
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <div className="news-tag" style={{ color: "var(--color-colloquium)" }}>
          Colloquium &middot; {event.date}
        </div>
        <div
          className="title"
          style={{
            fontSize: "16px",
            marginTop: "2px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.title && event.title.length > 0 ? event.title : event.speaker}
        </div>
        <div
          className="plaintext"
          style={{ fontSize: "13px", color: "#666666", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {event.speaker}, {event.affiliation}
        </div>
      </div>
    </Link>
  );
};

export default ColloquiumTile;
