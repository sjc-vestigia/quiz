# VESTIGIA 26–27 — walkathon quiz

A single-page personality quiz for the **Green & White Walkathon 26–27**. Four decisions walk a marker across a hand-drawn ancient map; the route you take ends at a treasure chest that names your walker type and the souvenir it is tied to.

Static files only — no build step, no bundler, no backend, no analytics, no cookies, no storage. Plain ES modules served from disk.

**Live at:** https://sjc-vestigia.github.io/quiz.

---

## How it plays

1. **Cover** — the theme question, the promise (30 seconds, 4 decisions), the prize hook.
2. **Four stops** — Trailhead, The Fork, The Climb, The Lookout. Each answer sends the marker down one of three branches of that leg; footprints stamp along the route behind it.
3. **The Hoard** — a chest at the end of the fourth leg. Open it to get the walker type, the prize it maps to, the entry rule and the donation ladder.
4. **Walk again** — resets scores, ink, footprints and camera.

Scoring is three counters (`k`, `s`, `p`), one per answer axis; the highest wins. Ties resolve toward the later axis (`k → s → p`). A three-way tie is unreachable because the counters always sum to 4.

## Structure

| Path | Contents |
|---|---|
| `index.html` | Shell: `<svg id="map">`, HUD, question sheet, chest, toast |
| `js/config.js` | Event facts: eyebrow, date, handle, hashtag, winners note, cartouche |
| `js/data.js` | Single source of truth: world size, node coordinates, 12 routes, questions, results, plate anchors |
| `js/map.js` | `buildWorld()` — coastline, rivers, terrain, routes, footprint stamps, node medallions, route labels, compass, scale, cartouche, framed stills |
| `js/camera.js` | Zoom and pan. Clamped to the world edges; vertical anchor keeps the focused point clear of the sheet |
| `js/quiz.js` | Travel loop. Samples `getPointAtLength`, stamps footprints in the same frame, resolves the winner |
| `js/chest.js` | Chest state machine and the reward card |
| `js/share.js` | Native share → clipboard → toast, in that order |
| `js/main.js` | Wiring: map, camera, quiz, chest, panels, HUD |
| `css/base.css` | Tokens, parchment surface, type scale, buttons |
| `css/map.css` | Map ink: sea, coast, terrain, routes, prints, plates, compass |
| `css/overlay.css` | Centred footprint HUD, sheet, reward card, chest, toast, breakpoints |
| `assets/locations/` | Five promo-film stills, shown one at a time as sepia map plates |
| `assets/prizes/` | Three souvenir photos |

## Run locally

```sh
python3 -m http.server 8080
# then open http://127.0.0.1:8080/
```

`file://` will not work: ES modules and `fetch` need an HTTP origin. Any static server is fine.

## Deploy

**GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
No `_config.yml`, no `.nojekyll`, no build step — the repository root *is* the site.

**Any other static host** (Netlify, Cloudflare Pages, nginx, Codeberg Pages): publish the repository root. Every path in the code is relative, so the site works from a subdirectory too.

## Editing content

| What | Where |
|---|---|
| Question text, options, notes | `QUESTIONS` in `js/data.js` |
| Walker types, descriptions, prizes | `RESULTS` in `js/data.js` |
| Node positions, route waypoints, plate anchors | `NODES`, `LEGS`, `PLATES` in `js/data.js` |
| Date, handle, hashtag, winners note, cartouche | `js/config.js` |
| Entry rule and donation ladder | `renderReward()` in `js/chest.js` |
| Share text | `shareResult()` in `js/share.js` |
| Colours, type, surfaces | tokens at the top of `css/base.css` |

Every route is generated from four points (node → two waypoints → node) as one `M` plus three `C` segments, so editing a waypoint reshapes the curve without touching path data.

## Assets

- **Stills** are 960 × 544 film frames. The map plate is drawn in SVG and fetches the still on first view, so the first paint costs only the cover plate.
- **Prize photos** are requested only when the chest opens.
- `q2.jpg` was cropped to remove baked-in pillarbox bars; all plates render 16:9 inside a 168 × 116 frame.
- Totals: ~0.9 MB of images for the whole site, none of it requested until needed.

## Behaviour notes

- The camera anchors the focused point to a fraction of the viewport measured from the live HUD and sheet, so the point and its plate never sit under UI. Below 620 px of height (and in landscape) there is no such gap, so plates are hidden rather than slid underneath.
- Footprints are stamped at `getPointAtLength` positions in the same animation frame as the marker, so the trail never runs ahead of the walker.
- `prefers-reduced-motion: reduce` skips the travel loop: the marker lands, footprints appear at once.
- Every control is a real `<button>`; a keyboard-only run works end to end and the chest opens exactly once.
- Nothing is sent anywhere. Share is the only outbound action and it goes through the OS share sheet or the clipboard.

## Tested

Chromium 150 headless at 375 × 667, 390 × 780, 740 × 360 and 1200 × 900:

- no console errors or uncaught exceptions across full runs
- all 12 routes start and end exactly on their nodes
- every outcome reached (`Light Walker`, `Tired Feet`, `Trace Keeper`) plus the tie case
- reduce-motion, keyboard-only and blocked-webfont (Times fallback) paths
- plate and marker clear of HUD and sheet at every viewport listed above

## License

MIT — see [LICENSE](LICENSE).
