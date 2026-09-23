// Data files and markdown articles hardcode asset paths as site-root-absolute
// (e.g. "/images/...") so that they resolve the same from any route depth.
// That assumption breaks when the app is served from a subpath (e.g.
// /~ephs/) instead of the domain root, so rewrite them here to be relative
// to Vite's BASE_URL.
export const withBase = (path) => import.meta.env.BASE_URL + path.replace(/^\//, "")
