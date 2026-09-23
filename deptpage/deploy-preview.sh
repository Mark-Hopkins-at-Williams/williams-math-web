#!/bin/sh
# Builds the site for the GitHub Pages review copy at
# https://mark-hopkins-at-williams.github.io/williams-math-web/ and assembles
# it in ../../williams-math-web-preview, a separate git checkout that is
# pushed to that repo. Unlike `npm run deploy`, this never touches the
# production files at the repo root.
#
# The preview lives under a /williams-math-web/ subpath, so the 404.html
# client-redirect trick has to keep that first path segment, and robots.txt
# blocks indexing so search engines don't pick up an unofficial copy.
set -e
BASE=/williams-math-web/
OUT=../../williams-math-web-preview

npx vite build --base=$BASE --outDir dist-preview

mkdir -p $OUT
rm -rf $OUT/assets $OUT/images $OUT/articles
cp -R dist-preview/assets $OUT/assets
cp -R -L images $OUT/images
cp -R -L articles $OUT/articles
find $OUT -name .DS_Store -delete

# index.html: restore the route that 404.html encoded into the query string,
# re-prefixed with the subpath.
sed 's#decoded.shift() + (decoded.length#l.pathname.slice(0, -1) + decoded.shift() + (decoded.length#' \
  dist-preview/index.html > $OUT/index.html

# Give every top-level route a real index.html (e.g. about-us/index.html) so
# direct links return 200 instead of going through the 404.html redirect --
# otherwise crawlers that don't run JavaScript see every page as a 404.
# (Production can't do this: per-route directories conflict with the
# .htaccess rewrites on jersey. See README.) Routes are read from the hidden
# crawler nav in index.html, which is kept in sync with src/App.jsx.
for route in $(grep -o "href=\"${BASE}[a-z-]*/\"" $OUT/index.html | sed "s#href=\"${BASE}##; s#/\"##"); do
  rm -rf "$OUT/$route"
  mkdir -p "$OUT/$route"
  cp $OUT/index.html "$OUT/$route/index.html"
done

cat > $OUT/404.html <<'EOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Mathematics - Williams College</title>
    <script>
      // Keep the /williams-math-web/ segment, encode the rest of the path
      // into the query string, and let index.html restore it.
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        // Unique per visit, so the browser can't serve a cached (stale)
        // index.html after the redirect; index.html strips it back out.
        '&~v=' + Date.now() +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
EOF

printf 'User-agent: *\nDisallow: /\n' > $OUT/robots.txt
touch $OUT/.nojekyll
rm -rf dist-preview
echo "Preview assembled in $(cd $OUT && pwd)"
