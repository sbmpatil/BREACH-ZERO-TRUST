# BREACH: Hunt the Intruder

An original asymmetric hidden-movement multiplayer strategy game for 2–5 players. One Intruder moves secretly through an 18-node corporate network while the SOC Team deduces their route from a deliberately noisy SIEM feed.

## Run locally
Requires Node.js 18+.
```bash
npm install
npm test
npm run balance
npm start
```
Open `http://localhost:3000` in multiple browsers/devices.

## Rules
### Balance tuning
The initial simulation produced an 80/20 Intruder advantage with a naive SOC, while a deduction-based SOC reached 68% wins. Per the balance requirement, shared isolations were tuned from 4 to **3**. The final seeded 50-game run finished at **44% Intruder / 56% SOC**.

The Intruder begins secretly at VPN Gateway, Web Server, or Email Gateway. Each round they get 45 seconds to Stealth Move, Exploit Chain (3/game), Plant Decoy (2/game), or Lie Low (not twice consecutively). Then the server publishes the attack signal mixed with 2–4 noise alerts and the SOC gets 60 seconds to Investigate, Isolate (3/game), or Deploy Honeypot (2 active). In a 2-player game the lone defender receives two actions per SOC phase.

The Intruder wins by entering CROWN JEWELS and surviving the ensuing SOC phase. SOC wins by isolating the occupied node, trapping the Intruder, or reaching the end of round 12.

## Security model
`game/engine.js` owns authoritative state. `publicState()` is role-filtered: before game over SOC clients never receive the Intruder position/history, honeypot details are not sent to the Intruder, and alert `kind` truth labels are stripped. All actions are revalidated server-side. Nicknames/chat are length-limited and stripped of HTML metacharacters, and UI rendering escapes chat text.

## Deploy on Render
1. Create a GitHub repository and upload this project (with `server.js` at repository root).
2. In Render, click **New + → Web Service** and connect GitHub.
3. Select the repository and choose **Node** runtime.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Choose the free instance type if offered, then click **Create Web Service**.
7. Render supplies `PORT` automatically; this server reads `process.env.PORT`.
8. When deployment finishes, open the generated `https://…onrender.com` URL. Socket.IO uses the same origin and WebSocket connection automatically.

## Structure
- `server.js` — rooms, Socket.IO, timers, reconnection and host transfer
- `game/engine.js` — pure authoritative rules
- `game/map.js` — graph data
- `game/alerts.js` — real/decoy/noise alert generation
- `public/` — no-build responsive frontend
- `test/` — engine, Socket.IO leakage, and balance tests
