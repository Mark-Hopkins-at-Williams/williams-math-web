import { Fragment } from "react";
import Schedule from "./Schedule";
import Sidebar from "./Sidebar";
import DbServices from "../services/db.js";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import Passage from "./Passage";
import Disclosure from "./Disclosure";
import { usePageMeta } from "../hooks/usePageMeta";

const PlanYourMajor = ({ style, layout, onClick, showSidebar }) => {
  const hubId = "plan-your-major";

  usePageMeta({
    title: "Plan Your Major",
    description: "Requirements, example paths, and an interactive planning tool for the Williams College Mathematics major.",
  });


  const renderContent = () => {
    let printedLearnMore = false;

    return DbServices.getPlanYourMajorContent().map((item, i) => {
      if (item.component && item.component === "MajorPlanningAssistant") {
        return (
          <Fragment key={item.component}>
            <div style={{ textAlign: "left" }}>
              <div className="eyebrow" style={{ marginBottom: "16px" }}>Major Planning Assistant</div>
            </div>
            <Schedule />
          </Fragment>
        );
      } else {
        const learnMoreHeading = printedLearnMore ? null : (
          <div className="eyebrow" style={{ textAlign: "left", marginTop: "44px", marginBottom: "14px" }}>Learn More</div>
        );
        printedLearnMore = true;
        return (
          <Fragment key={item.title ?? i}>
            {learnMoreHeading}
            <div style={{ textAlign: "left" }}>
              <Disclosure title={item.title}>
                <Passage title={null} photo={item.photo} article={item.article} />
              </Disclosure>
            </div>
          </Fragment>
        );
      }
    });
  };

  const renderBody = () => (
    <div
      id="frontpage-plan-your-major"
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
            title="plan your major"
            className="sidebar-plan-your-major"
            onClick={onClick}
          />
        ) : (
          <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
        )}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ marginTop: "24px" }}>
            {renderContent()}
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

export default PlanYourMajor;
