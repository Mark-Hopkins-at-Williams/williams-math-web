import "./App.css";
import { useState, useEffect, lazy, Suspense } from "react";
import FrontPage from "./components/FrontPage";
import AboutUs from "./components/AboutUs";
import PlanYourMajor from "./components/PlanYourMajor";
import CourseOfferings from "./components/CourseOfferings";
import Colloquium from "./components/Colloquium";
import StudentLife from "./components/StudentLife";
import ResearchOpportunities from "./components/ResearchOpportunities";
import NonMajors from "./components/NonMajors";
import News from "./components/News";
import NotFound from "./components/NotFound";
import DbServices from "./services/db.js";
import { prefetchImages } from "./utils/prefetchImages.js";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <Outlet />;
};

// Local content-editing UI, backed by a dev-only Vite API (see
// vite-plugins/admin-api-plugin.js). import.meta.env.DEV is a compile-time
// constant, so Rollup drops this entire route (and the AdminApp chunk it
// pulls in) from the production GitHub Pages build.
const AdminApp = import.meta.env.DEV ? lazy(() => import("./admin/AdminApp.jsx")) : null;

function App() {
  const handleHubClick = (who) => {
    // respond to any hub events here
  };

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const getLayout = () => {
    if (windowSize.width >= 910) {
      return "wide";
    } else if (windowSize.width >= 600) {
      return "standard";
    } else {
      return "narrow";
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Warm the image cache for every other tab once the current page is done
  // loading, so switching tabs feels instant instead of popping in images.
  useEffect(() => {
    prefetchImages(DbServices.getAllImagePaths());
  }, []);

  const showSidebar = false; //(getLayout() === "wide")
  const contentStyle = {
    width: windowSize.width,
  };

  const router = createBrowserRouter([
    {
      element: <ScrollToTop />,
      errorElement: <NotFound />,
      children: [
    {
      path: "/",
      element: <FrontPage onClick={handleHubClick} style={contentStyle} />,
    },
    {
      path: "about-us/",
      element: (
        <AboutUs
          showSidebar={showSidebar}
          onClick={handleHubClick}
          style={contentStyle}
        />
      ),
    },
    {
      path: "plan-your-major/",
      element: (
        <PlanYourMajor
          layout={getLayout()}
          onClick={handleHubClick}
          style={contentStyle}
          showSidebar={showSidebar}
        />
      ),
    },
    {
      path: "courses/",
      element: (
        <CourseOfferings
          showSidebar={showSidebar}
          onClick={handleHubClick}
          style={contentStyle}
        />
      ),
    },
    {
      path: "colloquium/",
      element: (
        <Colloquium
          showSidebar={showSidebar}
          layout={getLayout()}
          onClick={handleHubClick}
          style={contentStyle}
        />
      ),
    },
    {
      path: "student-life/",
      element: (
        <StudentLife
          onClick={handleHubClick}
          showSidebar={showSidebar}
          style={contentStyle}
        />
      ),
    },
    {
      path: "research/",
      element: (
        <ResearchOpportunities
          onClick={handleHubClick}
          layout={getLayout()}
          style={contentStyle}
          showSidebar={showSidebar}
        />
      ),
    },
    {
      path: "non-majors/",
      element: (
        <NonMajors
          onClick={handleHubClick}
          layout={getLayout()}
          style={contentStyle}
          showSidebar={showSidebar}
        />
      ),
    },
    {
      path: "news/",
      element: (
        <News
          onClick={handleHubClick}
          layout={getLayout()}
          howMany={10}
          date={Date.now()}
          style={contentStyle}
          showSidebar={showSidebar}
        />
      ),
    },
      ...(import.meta.env.DEV ? [{
        path: "admin/*",
        element: (
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        ),
      }] : []),
      ]},
  ], { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });

  return <RouterProvider router={router} />;
}

export default App;
