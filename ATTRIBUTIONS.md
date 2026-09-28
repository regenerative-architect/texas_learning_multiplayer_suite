# Attributions & Licenses

## Project architecture

**Ricky Foster + Navi**  
**Planetary Restoration Archive**

Systems architecture/concept for the Texas Learning & Teacher Capacity Operating System.

## Public information sources

The source registry links to Texas Education Agency, Texas Higher Education Coordinating Board, Texas Workforce Commission, U.S. Bureau of Labor Statistics, National Center for Education Statistics, U.S. Department of Labor Apprenticeship.gov and related public resources. Their data/content remain subject to their own statutes, terms, notices and licenses.

## WebLLM

WebLLM is an upstream open-source project from MLC AI. This bundle does not redistribute the WebLLM package or model weights; it imports the upstream package only on explicit user action.

https://github.com/mlc-ai/web-llm

## Optional legacy Node server

An older optional Node/WebSocket implementation is retained under `optional-node-server/` for reference. It is not required by the GitHub Pages P2P edition. If deployed, its `ws` dependency remains subject to its upstream license.

## Web platform APIs

IndexedDB, BroadcastChannel, Service Worker, Cache Storage, WebRTC and WebGPU are web-platform APIs.

## Trystero
Zero-backend peer discovery and WebRTC room transport use Trystero by Dan Motzenbecker, imported on demand from the upstream ESM distribution rather than redistributed in this archive. Trystero is used under its upstream license. Project: https://github.com/dmotz/trystero


## Trystero 0.25.3
Trystero by Dan Motzenbecker / contributors, MIT licensed. This application dynamically imports version 0.25.3 from an ESM CDN and uses the 0.25.x object-based action API. Upstream: https://github.com/dmotz/trystero

## WebLLM
WebLLM by MLC AI / contributors. The app dynamically imports WebLLM and uses its dedicated Web Worker APIs; model/library artifacts are not redistributed in this ZIP. Upstream: https://github.com/mlc-ai/web-llm
