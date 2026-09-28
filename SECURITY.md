# Security & Privacy Notes

This bundle is a working prototype, not a hardened student-information system.

## Deliberate constraints

- no private direct messages
- no embedded API credentials
- no hidden analytics/telemetry
- WebSocket payload limit of 32 KiB
- local JSON import validation
- browser-local personal workspace by default
- server sanitizes room codes and limits selected string lengths
- static responses set `X-Content-Type-Options`, referrer policy and restrictive camera/microphone/geolocation permissions policy

## Production additions

1. TLS/WSS.
2. Organization-managed authentication / SSO.
3. Authorization and explicit room membership.
4. Server-side schema validation by message type.
5. Rate limiting and abuse controls.
6. Moderation, audit and incident workflows.
7. Retention/deletion policies.
8. Durable concurrent persistence with backup/restore.
9. Content Security Policy matched to the deployment and WebLLM origins.
10. Dependency lockfile and automated vulnerability/license scanning.
11. Accessibility testing in the actual deployed environment.
12. School/district legal/privacy review appropriate to the real use case.

## Child safety

Do not deploy the prototype room layer as an unsupervised social system for minors. The UI gate is a guardrail, not verified identity.

## Local AI

Do not put identifiable learner data into WebLLM prompts. Local inference does not make inappropriate data collection appropriate.
