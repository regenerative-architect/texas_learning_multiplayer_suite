# Texas Learning & Teacher Capacity Operating System — GitHub Pages P2P Edition

**Systems architecture/concept:** Ricky Foster + Navi / Planetary Restoration Archive

This edition is designed to become functional by simply uploading the folder contents to a GitHub repository root and enabling GitHub Pages.

## Zero-configuration Pages deployment

1. Create a GitHub repository.
2. Upload **the contents of this folder** to the repository root so `index.html` is at root level.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Choose your publishing branch (normally `main`) and **`/ (root)`**.
6. Save and open the resulting HTTPS Pages URL.

No API keys, Firebase project, Supabase project, Node server, environment variables or build step are required for the normal public edition.

`.nojekyll` is already included.

## What works on GitHub Pages

- Texas education / teacher-capacity application
- responsive top + side navigation
- current embedded Texas evidence/source registry
- IndexedDB local workspaces, projects, room cache and portfolio
- validated JSON import/export
- installable PWA over GitHub Pages HTTPS
- versioned service worker and offline application shell
- same-origin multi-tab synchronization with `BroadcastChannel`
- **cross-device peer-to-peer multiplayer with Trystero + WebRTC**
- room presence
- shared evidence/decision/question/handoff feed
- cross-domain task/dependency board
- multidisciplinary playbooks
- optional WebLLM local inference on WebGPU-capable devices
- print/accessibility/reduced-motion support

## Multiplayer architecture

The collaboration module imports Trystero from its browser ESM distribution when a user joins a room.

Trystero's default strategy uses decentralized **Nostr relays for peer discovery**. After discovery, application data is sent directly between browsers through encrypted WebRTC connections.

GitHub Pages only serves the static application; it does not need to execute server code.

### Local durability

Each browser keeps the most recent room state it has seen in IndexedDB.

When peers meet, they exchange and merge cached state:

- board items use timestamps and last-write-wins merging
- deletions are retained as tombstones to reduce deleted-item resurrection
- room feed entries merge by unique ID
- each returning participant can reseed room history it still holds locally

This is **peer-durable**, not centrally durable. If every participant loses/deletes its browser data, there is no central copy of that room history. A completely new participant cannot retrieve old history unless a peer holding that history reconnects.

## Practical multiplayer limits

The zero-backend approach is intentionally optimized for immediate GitHub Pages deployment, but it is not equivalent to a district-managed collaboration backend:

- some restrictive NAT/firewall combinations may prevent direct peer connections
- cross-device discovery needs internet access
- Trystero and WebLLM are loaded from upstream browser distributions on first use
- room display names are self-asserted, not identity-verified
- there is no central SSO, authorization database or audit archive
- do not put grades, disability/health information, home addresses, discipline records or other sensitive student records into shared rooms

For an institution-grade deployment later, the Pages frontend can remain unchanged while collaboration is moved to a managed Supabase/Firebase/custom WebSocket provider with SSO, centralized persistence, authorization, retention and moderation.

## PWA behavior

GitHub Pages supplies HTTPS, so the included service worker can register there. The service worker caches the application shell and embedded evidence files. Cross-device multiplayer still requires connectivity because peer discovery cannot operate offline.

WebLLM model inference may work offline only after the required library/model assets have actually been downloaded and cached by that browser; the app does not falsely claim otherwise.

## Evidence discipline

- **A** — official measured / authoritative administrative data
- **B** — peer-reviewed evidence
- **C** — institutional analysis / technical documentation
- **D** — preliminary evidence
- **E** — modeled scenario
- **F** — conceptual proposal

Mutable Texas claims should carry source, date/reference period, geography, freshness and limitations. Statewide shortage designations are not converted into fabricated local vacancies.

## Current Texas context embedded

The 2026-09-28 data/source modules include TEA shortage areas, the TSDS Teacher Vacancy Collection timeline, 2024–25 employed-teacher/preparation-route counts, HB 2 Teacher Retention Allotment values, PREP partnership architecture, THECB FAST dual-credit information, preliminary Fall 2025 higher-education enrollment, 2026 Programs of Study career clusters, and TWC/BLS/NCES/Apprenticeship.gov discovery sources.

## Safety

The multiplayer layer is a collaboration prototype, not an unsupervised school social network. It intentionally has no private DM feature and requires the participant to confirm adult or approved/supervised organizational participation before joining a room.

See `SECURITY.md`, `GITHUB_PAGES.md`, `ATTRIBUTIONS.md` and `SHA256SUMS.txt`.


## v4 guided P2P upgrade (2026-09-28)

This edition adds an animated readiness splash, Simplified Advanced Guides, accessible keyboard/focus tooltips, selectable Trystero 0.25.3 Nostr/MQTT/BitTorrent/IPFS discovery, optional shared room password, request/response peer snapshot synchronization, explicit ephemeral-identity warnings, TURN fallback guidance, dedicated-worker WebLLM, Texas BEAD/BOOT/E-rate/FCC/Census/library/telehealth evidence layers and a 111-section requirements atlas.

Normal GitHub Pages operation does not require the optional Node adapter. Cross-device collaboration still depends on browsers successfully establishing WebRTC connectivity through the chosen discovery strategy; restrictive NAT/firewall pairs may require an explicitly configured TURN service.
