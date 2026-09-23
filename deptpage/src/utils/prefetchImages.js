// Warms the browser's image cache for pages the visitor hasn't clicked into
// yet, so the top-menu tabs feel instant instead of popping in images on
// first visit. Runs during idle time (falling back to a short timeout on
// Safari, which has no requestIdleCallback) so it never competes with the
// current page's own images for bandwidth.
//
// fetchPriority: 'low' matters more than it looks like it should. These
// requests all fire back-to-back in the same order every load (the order
// getAllImagePaths happens to walk the data files in), so whichever image
// lands late in that order -- e.g. the first colloquium event's photo,
// since colloquium.json is walked after people.json and courses.json --
// would otherwise always be mid-queue. If a visitor navigates to that page
// before its prefetch turn comes up, the browser sees an in-flight request
// for the same URL and just waits its turn instead of bumping it -- so the
// on-screen image would end up stuck behind everything still ahead of it,
// every time. Marking these low-priority tells the browser these are
// speculative and any real, on-screen request should jump the queue.
export const prefetchImages = (paths) => {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000))
  schedule(() => {
    paths.forEach((path) => {
      const img = new Image()
      img.fetchPriority = 'low'
      img.src = path
    })
  })
}
