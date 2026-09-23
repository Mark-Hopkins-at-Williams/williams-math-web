import { Link } from "react-router-dom";
import { withBase } from "./withBase.js";

// Article markdown hardcodes image paths as site-root-absolute
// (e.g. "/images/misc/foo.png"), same as the JSON data files. react-markdown
// renders those verbatim, so pass this as `components={{ img: ..., a: ... }}`
// to rewrite them relative to Vite's BASE_URL.
export const markdownImageComponent = {
  img: ({ src, ...props }) => (
    <img src={typeof src === "string" && src.startsWith("/") ? withBase(src) : src} {...props} />
  ),
  // A site-root-relative link (e.g. "/non-majors/") is an
  // internal SPA route. It must use client-side routing rather than a full
  // page load -- direct navigation to a deep route currently gets
  // redirected to the homepage by the production server's Apache config
  // (see AboutUs.jsx's same note for the Danyluk memorial link).
  // Links to static files (e.g. "/articles/files/form.pdf") are the
  // exception: they're served directly, not by the router.
  a: ({ href, children, ...props }) =>
    typeof href === "string" && /^\/(articles|images)\//.test(href) ? (
      <a href={withBase(href)} target="_blank" {...props}>{children}</a>
    ) : typeof href === "string" && href.startsWith("/") ? (
      <Link to={href} {...props}>{children}</Link>
    ) : (
      <a href={href} {...props}>{children}</a>
    ),
};
