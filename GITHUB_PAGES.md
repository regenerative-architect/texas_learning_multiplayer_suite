# GitHub Pages — zero-configuration deployment

This edition is designed so the normal public deployment needs **no server, API key, Firebase project, Supabase project, or environment variables**.

## Publish

1. Create a GitHub repository.
2. Upload **the contents of this folder to the repository root** (so `index.html` is at the root, not inside another folder).
3. In GitHub: **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose the branch containing the files (normally `main`) and folder **`/ (root)`**.
6. Save.
7. Open the Pages URL after GitHub publishes it.

`.nojekyll` is included so GitHub Pages serves this as a static application without Jekyll processing.

## What works immediately on Pages

- responsive Texas education application
- service worker / installable PWA over GitHub's HTTPS Pages URL
- offline application shell and cached Texas source snapshot
- IndexedDB local workspace
- JSON backup/import
- WebLLM capability (opt-in, if WebGPU is supported; first package/model download requires internet)
- same-browser-tab collaboration through `BroadcastChannel`
- **cross-device zero-backend multiplayer through Trystero/WebRTC**
- shared room presence, feed, evidence/decision/question/handoff posts and cross-domain board

## How zero-backend multiplayer works

The collaboration client imports Trystero from its browser ESM distribution on demand. Trystero's default strategy uses the decentralized Nostr relay network for WebRTC peer discovery. Once peers connect, application room data is sent browser-to-browser over WebRTC rather than stored on GitHub Pages.

A room code acts as the collaboration namespace. The client also supplies a room-derived password to Trystero so signaling-session data is encrypted consistently among users of that room.

## Persistence model

- Every browser stores the latest room state it has seen in IndexedDB.
- Peers exchange and merge their cached room state when they meet.
- Board items use last-write-wins timestamps and deleted-item tombstones to avoid simple state resurrection.
- Room feed entries merge by unique ID.

This means collaboration works without a central database, but it is **peer-durable rather than server-durable**. If every participant deletes browser data, the shared room history is gone. If nobody with the latest state is online when a completely new participant first joins, that participant cannot retrieve history from a nonexistent central server.

## Important operational limits

This zero-config Pages mode is excellent for prototypes, public workshops and voluntary multidisciplinary collaboration, but it is not equivalent to an institution-managed collaboration backend:

- Peer-to-peer connection success depends on browser/network NAT/firewall conditions.
- Trystero's decentralized discovery and the ESM package import require internet access for cross-device room setup.
- No central authoritative room history exists.
- Display names are self-asserted, not verified identity.
- There is no district SSO, role authorization or central audit archive.
- Do not place sensitive student records into collaboration rooms.

For institution-grade deployment later, retain the Pages frontend and swap the collaboration provider for organization-controlled Supabase/Firebase/WebSocket infrastructure with SSO, retention and authorization.

## Multiplayer in this edition

The Pages build pins Trystero 0.25.3. Nostr is the default discovery strategy; users can select MQTT, BitTorrent or IPFS in the collaboration module. The strategy only performs peer discovery/signaling; after connection, app records move through WebRTC data channels.

A shared room password is optional. When supplied it is used by Trystero to derive stronger encryption for session-description data exchanged through the discovery medium. It is not identity verification or authorization.

Same-device browser tabs can continue collaborating through BroadcastChannel even if the Trystero library/network is unavailable. Cross-device P2P can fail on restrictive NAT/firewall combinations; TURN is an explicit optional fallback, not a hidden dependency.
