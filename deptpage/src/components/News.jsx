import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DbServices from "../services/db.js";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownImageComponent } from "../utils/markdownImageComponent.jsx";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import { usePageMeta } from "../hooks/usePageMeta";

const NewsItem = ({ date, title, photo, thumbnail, article, teaser, forceOpen, startOpen }) => {
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(forceOpen || startOpen);

  useEffect(() => {
    DbServices.fetchExternalTextFile(article).then((response) => {
      setContent(response);
    });
  }, []);

  const teaserText = teaser ? teaser : title;

  const HeadTag = forceOpen ? "div" : "button";

  return (
    <div className="soft-card">
      <HeadTag
        type={forceOpen ? undefined : "button"}
        aria-expanded={forceOpen ? undefined : open}
        className="disclosure-head news-disclosure-head"
        style={{ cursor: forceOpen ? "default" : "pointer" }}
        onClick={() => {
          if (!forceOpen) setOpen(!open);
        }}
      >
        {open || !(thumbnail || photo) ? null : (
          <img
            width="128"
            height="128"
            loading="lazy"
            className="news-thumbnail news-thumbnail-desktop"
            style={{ objectFit: "cover", borderRadius: "10px", flexShrink: 0 }}
            src={thumbnail ? thumbnail : photo}
            alt={`Photo for ${title}`}
          />
        )}
        <div className="news-disclosure-headline" style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
          <div className="news-tag" style={{ color: "var(--color-news)" }}>News &middot; {date}</div>
          <div className="title" style={{ fontSize: "19px", marginTop: "2px" }}>{title}</div>
          {open ? null : (
            <div className="plaintext news-teaser-desktop" style={{ fontSize: "15px", color: "#666666", marginTop: "4px" }}>
              {teaserText}
            </div>
          )}
        </div>
        {open || !(thumbnail || photo) ? null : (
          <img
            width="120"
            height="120"
            loading="lazy"
            className="news-thumbnail-mobile"
            style={{ objectFit: "cover", borderRadius: "10px" }}
            src={thumbnail ? thumbnail : photo}
            alt={`Photo for ${title}`}
          />
        )}
        {open ? null : (
          <div className="plaintext news-teaser-mobile" style={{ fontSize: "15px", color: "#666666" }}>
            {teaserText}
          </div>
        )}
        {forceOpen ? null : (
          <svg
            className="disclosure-chevron"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-purple)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18"></polyline>
          </svg>
        )}
      </HeadTag>
      {open ? (
        <div style={{ padding: "0 16px 20px 16px" }}>
          {photo ? (
            <img width="100%" loading="lazy" style={{ borderRadius: "10px", marginBottom: "14px", display: "block" }} src={photo} alt={`Photo for ${title}`} />
          ) : null}
          <div className="plaintext article-body">
            <Markdown remarkPlugins={[remarkGfm]} components={markdownImageComponent}>{content}</Markdown>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const News = ({ style, layout, howMany, date, onClick, showSidebar }) => {
  const hubId = "news";
  const location = useLocation();

  const newsItems = DbServices.getNewsItems()
    .filter((article) => Date.parse(article.date) <= date)
    .toSorted(
      (event1, event2) => Date.parse(event2.date) - Date.parse(event1.date),
    )
    .slice(0, howMany);

  const forceOpen = newsItems.length === 1;
  const startLatestOpen = location.hash === "#latest";

  // A single-item mount (e.g. the danyluk-in-memoriam permalink) is really
  // its own page, not "the news listing" -- title/describe it by that one
  // article rather than hardcoding a name for every such permalink.
  const singleItem = forceOpen ? newsItems[0] : null;
  usePageMeta({
    title: singleItem ? singleItem.title : "News",
    description: singleItem
      ? (singleItem.teaser || singleItem.title)
      : "News and updates from the Williams College Mathematics Department.",
  });

  const renderNewsItem = (item, i) => (
    <div key={item.id}>
      <NewsItem
        date={item.date}
        title={item.title}
        photo={item.photo}
        thumbnail={item.thumbnail}
        article={item.article}
        teaser={item.teaser}
        forceOpen={forceOpen}
        startOpen={i === 0 && startLatestOpen}
      />
      <div style={{ height: "12px" }} />
    </div>
  );

  const renderBody = () => (
    <div id="news" style={style}>
      <div
        className="pagebody"
        style={{
          display: "flex",
          flexFlow: "row nowrap",

        }}
      >
        {showSidebar ? (
          <Sidebar title="news" className="sidebar-news" onClick={onClick} />
        ) : (
          <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
        )}
        <div
          style={{
            width: "100%",
            textAlign: "left",
          }}
        >
          <div style={{ marginTop: "24px" }}>
            {newsItems.map((opp, i) => renderNewsItem(opp, i))}
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

export default News;
