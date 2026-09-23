import { Fragment } from "react";
import { Link } from "react-router-dom";
import DbServices from "../services/db.js";
import TopMenu from "./TopMenu";
import { pageColorClasses, PAGE_IDS } from "../pageColors.js";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import NewsTile from "./NewsTile";
import ColloquiumTile from "./ColloquiumTile";
import Passage from "./Passage";

const FrontPage = ({ onClick, style }) => {
  const hubId = "home";

  const spotlight = DbServices.getFrontPageSpotlightInfo();

  const renderFromTheDepartment = () => (
    <div>
      <div className="eyebrow" style={{ marginBottom: "14px" }}>From the Department</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: "18px",
        }}
      >
        <NewsTile onClick={onClick} />
        <ColloquiumTile onClick={onClick} />
      </div>
    </div>
  );

  const renderExploreGrid = () => (
    <div>
      <div className="eyebrow" style={{ marginBottom: "14px" }}>Explore the Department</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        {PAGE_IDS.filter((id) => id !== "home").map((id) => (
          <Link
            key={id}
            to={{ pathname: `/${id}` }}
            onClick={() => { onClick(id); window.scrollTo(0, 0); }}
            className={`explore-tile ${pageColorClasses[id]}`}
            style={{
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              minHeight: "96px",
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              padding: "10px",
            }}
          >
            {id.replaceAll("-", " ")}
          </Link>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    return DbServices.getFrontPageContent().map((item, i) => {
      if (item.component === "FromTheDepartment") {
        return (
          <Fragment key={item.component}>
            <Spacer height="32px" />
            {renderFromTheDepartment()}
          </Fragment>
        );
      } else {
        return (
          <Fragment key={item.title ?? i}>
            <Spacer height="32px" />
            <div className="eyebrow">{item.title}</div>
            <div style={{ marginTop: "6px" }}>
              <Passage title={null} photo={item.photo} article={item.article} />
            </div>
          </Fragment>
        );
      }
    });
  };

  const renderBody = () => (
    <div id="frontpage" style={{ ...style, fontSize: "40px" }}>
      <div
        className="pagebody"
        style={{
          display: "flex",
          flexFlow: "row nowrap",

        }}
      >
        <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
        <div style={{ width: "100%", textAlign: "left" }}>
          <div style={{ marginTop: "24px", borderRadius: "16px", overflow: "hidden" }}>
            <img width="100%" style={{ display: "block" }} src={spotlight.photo} alt={spotlight.caption} />
          </div>
          <div className="plaintext" style={{ fontSize: "13px", fontStyle: "italic", color: "#888888", marginTop: "8px" }}>
            {spotlight.caption}
          </div>
          {renderContent()}
          <Spacer height="36px" />
          {renderExploreGrid()}
          <Spacer height="20px" />
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

export default FrontPage;
