import DbServices from "../services/db.js";
import { Link } from "react-router-dom";

const NewsTile = ({ onClick, style }) => {
  const newsItems = DbServices.getNewsItems()
    .filter((article) => Date.parse(article.date) <= Date.now())
    .toSorted(
      (event1, event2) => Date.parse(event2.date) - Date.parse(event1.date),
    );

  const news = newsItems.length > 0 ? newsItems[0] : null;
  const teaser = news.teaser ? news.teaser : news.title;

  return (
    <Link
      to={{ pathname: `/news`, hash: "#latest" }}
      onClick={() => { onClick("news"); window.scrollTo(0, 0); }}
      className="soft-card"
      style={{
        display: "flex",
        flexFlow: "row nowrap",
        gap: "14px",
        padding: "16px",
        boxSizing: "border-box",
        color: "inherit",
        ...style,
      }}
    >
      {news.thumbnail || news.photo ? (
        <img
          src={news.thumbnail ? news.thumbnail : news.photo}
          alt=""
          style={{
            width: "96px",
            height: "96px",
            objectFit: "cover",
            borderRadius: "10px",
            flexShrink: 0,
          }}
        />
      ) : null}
      <div style={{ minWidth: 0 }}>
        <div className="news-tag" style={{ color: "var(--color-news)" }}>News</div>
        <div className="title" style={{ fontSize: "16px", marginTop: "2px", lineHeight: 1.25 }}>
          {news.title}
        </div>
        <div className="plaintext" style={{ fontSize: "13px", color: "#666666", marginTop: "4px" }}>
          {teaser}
        </div>
      </div>
    </Link>
  );
};

export default NewsTile;
