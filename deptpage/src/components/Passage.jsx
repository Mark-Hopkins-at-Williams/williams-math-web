import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DbServices from "../services/db.js";
import { markdownImageComponent } from "../utils/markdownImageComponent.jsx";

const Passage = ({ title, photo, article }) => {
  const [content, setContent] = useState("");

  const renderHeading = (heading) => (
    <div className="heading">{heading.toLowerCase()}</div>
  );

  useEffect(() => {
    DbServices.fetchExternalTextFile(article).then((response) => {
      setContent(response);
    });
  }, []);

  return (
    <div
      className="plaintext left"
      style={{
        display: "flex",
        flexFlow: "column nowrap",
        gap: "0px",
      }}
    >
      {title ? renderHeading(title) : null}
      {photo ? (
        <div className="news-article-photo">
          <img
            width="100%"
            loading="lazy"
            src={photo}
            alt={title ? `Photo for ${title}` : "Article photo"}
          />{" "}
        </div>
      ) : null}
      <Markdown remarkPlugins={[remarkGfm]} components={markdownImageComponent}>{content}</Markdown>
    </div>
  );
};

export default Passage;
