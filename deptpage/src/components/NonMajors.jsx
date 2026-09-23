import { Fragment } from "react";
import Sidebar from "./Sidebar";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import Passage from "./Passage";
import DbServices from "../services/db.js";
import { usePageMeta } from "../hooks/usePageMeta";

const NonMajors = ({ style, layout, onClick, showSidebar }) => {
  const hubId = "non-majors";

  usePageMeta({
    title: "Non-Majors",
    description: "Advice for non-majors interested in mathematics courses at Williams College.",
  });

  const renderContent = () => {
    return DbServices.getNonMajorsContent().map((item, i) => (
      <Fragment key={item.title ?? i}>
        <div className="eyebrow" style={{ marginTop: i === 0 ? 0 : "40px" }}>{item.title}</div>
        <div style={{ marginTop: "6px" }}>
          <Passage title={null} photo={item.photo} article={item.article} />
        </div>
      </Fragment>
    ));
  };

  const renderBody = () => (
    <div
      id="frontpage-non-majors"
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
            title="non-majors"
            className="sidebar-non-majors"
            onClick={onClick}
          />
        ) : (
          <div
            className="left-spacer"
            style={{ flexGrow: 0, flexShrink: 0, width: "80px" }}
          />
        )}
        <div style={{ flexGrow: 1, minWidth: 0, textAlign: "left", marginTop: "24px" }}>
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

export default NonMajors;
