import { useState } from "react";
import { Link } from "react-router-dom";
import { pageColorClasses, PAGE_IDS } from "../pageColors.js";

const MenuItem = ({ id, text, highlight }) => {
  const [hovering, setHovering] = useState(false);

  const stateClass =
    highlight || hovering ? pageColorClasses[id] : "topmenu-nohighlight";

  return (
    <Link
      className={`topmenu-link topmenu ${stateClass}`}
      to={{ pathname: id === "home" ? "/" : `/${id}` }}
      onClick={() => window.scrollTo(0, 0)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      {text}
    </Link>
  );
};

const TopMenu = ({ currentPage }) => {
  const pages = PAGE_IDS;

  return (
    <div
      className="pagebody topmenu-bar"
      style={{
        display: "flex",
        flexFlow: "row nowrap",
      }}
    >
      <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
      <div
        style={{
          width: "100%",
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        {pages.map((page) => (
          <MenuItem
            key={page}
            id={page}
            text={page.replaceAll("-", " ")}
            highlight={page === currentPage}
          />
        ))}
      </div>
    </div>
  );
};

export default TopMenu;
