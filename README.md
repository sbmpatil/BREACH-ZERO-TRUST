# BREACH: ZERO TRUST

> **Trust nothing. Read the signal. Stop the breach.**

**BREACH: ZERO TRUST** is an original real-time asymmetric multiplayer cyber-strategy game for **2–5 players**. One player becomes the hidden **Intruder**, moving secretly through a corporate network toward the Crown Jewels. Everyone else operates as the **SOC Team**, reconstructing the attack from noisy SIEM alerts, investigations, honeypots, and tactical isolation decisions.

Unlike a conventional board game, the defenders never receive the attacker's hidden position or route. They have to think like incident responders: correlate imperfect signals, communicate, form hypotheses, and decide when there is enough evidence to contain a system.

## 🎮 The Experience

The game is being redesigned as a high-quality cyber command-center experience rather than a traditional form-based web game.

- **Asymmetric hidden information** — the Intruder knows their location; the SOC does not.
- **Living corporate network** — move through Internet Edge, User, Server, Core, and Vault security layers.
- **Noisy SIEM intelligence** — genuine attacker activity is mixed with benign alerts and deliberate deception.
- **Threat Pressure** — aggressive attacks create momentum but make the Intruder easier to detect.
- **SOC confidence map** — defenders build their own picture of where the attacker may be.
- **Attacker tradeoffs** — choose stealth, speed, deception, or silence.
- **Team coordination** — SOC players share a private operations channel.
- **Forensic game-over replay** — reveal the complete attack route and classify alerts as real, decoy, or noise.

## ⚔️ Intruder

The Intruder secretly enters through one of three Internet Edge systems and attempts to reach **CROWN JEWELS**.

Every Intruder phase lasts 45 seconds.

**Stealth Move** moves one adjacent node and produces only a low-severity zone-level signal.

**Exploit Chain** moves up to two nodes, but generates a high-severity alert identifying the destination. Limited to three uses per game.

**Plant Decoy** stays in place while creating a convincing high-severity alert elsewhere in the network. Limited to two uses.

**Lie Low** produces no alert, but cannot be used twice consecutively.

The Intruder wins by reaching the Vault and surviving the SOC's final response phase while exfiltration completes.

## 🛡️ SOC Team

The SOC receives a 60-second response phase after each Intruder turn. The SIEM feed mixes genuine attacker activity with **2–4 benign alerts**, so no individual alert can automatically be trusted.

SOC operators can:

**Investigate** a node to discover whether the Intruder previously visited it and in which round.

**Isolate** a node to permanently remove it from the network. Isolation immediately wins the game if the Intruder is currently there.

**Deploy Honeypot** to secretly instrument a node. If the Intruder later enters it, a CRITICAL alert reveals the location.

The team currently shares **3 isolations**, with up to **2 active honeypots**. In a two-player match, the lone SOC defender receives two actions each SOC phase.

## 🏆 Win Conditions

The **Intruder** wins by reaching CROWN JEWELS and surviving the following SOC phase.

The **SOC Team** wins by capturing the Intruder through isolation, trapping the Intruder with no legal route, or preventing successful exfiltration through round 12.

Reaching the Vault begins a dramatic final exfiltration window and generates:

> **CRITICAL — Large outbound data transfer detected**

The SOC gets one final opportunity to identify and contain the compromised Vault.

## 🔐 Server-Authoritative Security

Hidden information is treated as a security boundary, not merely a UI trick.

The Node.js server owns the authoritative game state. Before game over, SOC clients are never sent the Intruder's current position or hidden movement history. Alert truth labels are removed from public SOC state, and Intruder clients are not told where honeypots are deployed.

Every movement, isolation, honeypot, special ability, timer expiration, and win condition is validated server-side.

## 🧪 Testing & Balance

The project includes automated tests for movement validation, isolation capture, honeypot triggering, Vault exfiltration, trapped-Intruder detection, the 12-round timeout, and hidden-state protection.

A seeded 50-game balance simulation was used during the original rules tuning. Shared isolations were adjusted from four to **three**, producing a simulation result of **44% Intruder wins / 56% SOC wins** under the tested strategies.

Further balance testing will accompany the ZERO TRUST redesign.

## 🚀 Run Locally

Requires Node.js 18+.

```bash
npm install
npm test
npm run balance
npm start
```

Then open:

```text
http://localhost:3000
```

Create a room and open another browser/private window to join with the four-letter room code.

## 🧰 Technology

- Node.js
- Express
- Socket.IO
- Vanilla HTML / CSS / JavaScript
- SVG tactical network visualization
- No frontend build step

## 📁 Project Structure

```text
/server.js
/game/engine.js
/game/map.js
/game/alerts.js
/public/index.html
/public/style.css
/public/client.js
/test/
```

## 🌐 Deployment

The server reads its port from `process.env.PORT` and is designed for WebSocket-capable Node.js hosting.

For Render:

1. Create a **Web Service** from this GitHub repository.
2. Runtime: **Node**.
3. Build command: `npm install`
4. Start command: `npm start`
5. Deploy and open the generated public URL.

Socket.IO runs from the same origin, so no separate realtime server is required.

---

### BREACH: ZERO TRUST

**One network. One hidden attacker. A room full of analysts staring at the same alerts — and trusting none of them.**
