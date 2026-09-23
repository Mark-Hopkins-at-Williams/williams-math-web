import { Link } from "react-router-dom";
import TopMenu from "./TopMenu";
import WilliamsHeader from "./WilliamsHeader";
import WilliamsFooter from "./WilliamsFooter";
import Spacer from "./Spacer";
import { usePageMeta } from "../hooks/usePageMeta";

const NotFound = () => {
  usePageMeta({
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist.",
    noindex: true,
  });

  return (
    <div>
      <WilliamsHeader />
      <TopMenu currentPage={null} />
      <div className="pagebody" style={{ display: "flex", flexFlow: "row nowrap" }}>
        <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
        <div style={{ textAlign: "left", marginTop: "24px" }}>
          <div className="eyebrow">404</div>
          <div className="title" style={{ fontSize: "28px", marginTop: "10px" }}>Page not found</div>
          <div className="plaintext" style={{ marginTop: "10px", color: "#444444" }}>
            The page you are looking for does not exist, or may have moved.{" "}
            <Link to="/" className="link">Return to the homepage</Link>.
          </div>
        </div>
      </div>
      <Spacer height="10px" />
      <WilliamsFooter />
    </div>
  );
};

export default NotFound;
