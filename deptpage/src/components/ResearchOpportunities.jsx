import { Fragment } from "react";
import Sidebar from "./Sidebar";
import DbServices from "../services/db.js";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import Passage from "./Passage";
import Disclosure from "./Disclosure";
import { usePageMeta } from "../hooks/usePageMeta";

const ResearchOpportunities = ({ style, layout, onClick, showSidebar }) => {
  const hubId = "research";

  usePageMeta({
    title: "Research Opportunities",
    description: "Summer research and honors thesis opportunities in the Williams College Mathematics Department.",
  });

  const content = DbServices.getResearchContent();

  // Items marked "collapsed" (e.g. long archives like past SMALL groups)
  // render as a disclosure instead of a full-height section.
  const renderOpportunity = (item, i) => item.collapsed ? (
    <div key={item.title ?? i} style={{ marginTop: "14px" }}>
      <Disclosure title={item.title}>
        <Passage title={null} photo={item.photo} article={item.article} />
      </Disclosure>
    </div>
  ) : (
    <Fragment key={item.title ?? i}>
      <div className="eyebrow" style={{ marginTop: i === 0 ? "24px" : "40px" }}>{item.title}</div>
      <div style={{ marginTop: "6px" }}>
        <Passage title={null} photo={item.photo} article={item.article} />
      </div>
    </Fragment>
  );

  const renderBody = () => (
    <div id="research-opportunities" style={style}>
      <div
        className="pagebody"
        style={{
          display: "flex",
          flexFlow: "row nowrap",

        }}
      >
        {showSidebar ? (
          <Sidebar
            title="research opportunities"
            className="sidebar-research-opportunities"
            onClick={onClick}
          />
        ) : (
          <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
        )}
        <div style={{ width: "100%", textAlign: "left" }}>
          {content.map((item, i) => renderOpportunity(item, i))}
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

export default ResearchOpportunities;
