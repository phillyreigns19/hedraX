HedraX Monorepo

A clear, batteries-included codebase for the HedraX ecosystem:

hedrax-ui — the public landing + wallet connect + waitlist/claim flow (React + Vite + TypeScript).

hedrax-market — marketplace/front-end (React/Next.js or React + Vite; see folder README).

gift-server — minimal Express server for waitlist storage and HBAR gifting (Hedera).

hederax-contracts — smart contracts + scripts (Hardhat).

imp — assets, scratch, import/export helpers (optional dev folder).

.vscode — workspace settings and recommended extensions.

This README is meant for first-time contributors and non-coders. Follow it top-to-bottom to get everything running locally, then deploy each piece when ready.

Table of Contents

Architecture

Tech Stack

Prerequisites

Directory Structure

Quick Start (TL;DR)

Setup — UI (hedrax-ui)

Setup — Marketplace (hederax-market)

Setup — Server (gift-server)

Setup — Contracts (hederax-contracts)

Environments & Secrets

Development Workflow

Testing

Deployment Notes

Troubleshooting

Contributing

License

Architecture
Users ──▶ hedrax-ui (Vite/React)
             │
             ├── Wallet connect (HashPack / WalletConnect)
             ├── Waitlist modal (email + accountId)
             └── Calls → gift-server REST API
                          │
                          ├── MongoDB (email/account storage, quotas)
                          ├── Hedera SDK (send HBAR gifts)
                          └── Admin endpoints (quotas, health)
             
On-chain ──▶ hederax-contracts (Hardhat)
             │  ├── Compile/Deploy scripts
             │  └── ABIs → frontends / server
             
Marketplace UI ─▶ hederax-market

Tech Stack

Frontend: React, TypeScript, Vite, Tailwind (and/or Next.js in hederax-market)

Server: Node.js, Express, MongoDB, Pino logging

Blockchain: Hedera Hashgraph (HBAR), @hashgraph/sdk, HashPack / WalletConnect

Contracts: Solidity (Hardhat)

Tooling: ESLint, Prettier, VSCode settings

Prerequisites

Node.js ≥ 18 (LTS recommended)

pnpm or npm (examples use pnpm; switch to npm if you prefer)

Git

MongoDB (local Docker or a cloud instance)

Hedera Credentials

Operator Account ID (e.g. 0.0.xxxxxxx)

Operator Private Key (ED25519 or ECDSA). See Troubleshooting
 for formats.

Directory Structure
.
├─ .vscode/                 # Workspace settings & recommended extensions
├─ gift-server/             # Express API for waitlist + HBAR gifting
├─ hederax-contracts/       # Hardhat project (contracts, scripts, ABIs)
├─ hederax-market/          # Marketplace front-end
├─ hedrax-ui/               # Public site + waitlist modal (Vite/React/TS)
├─ imp/                     # Optional assets/scratch/import tools
├─ .gitignore
└─ README.md                # You are here

Quick Start (TL;DR)
# 1) Clone
git clone https://github.com/<you>/hedraX.git
cd hedraX

# 2) Install deps per package
cd hedrax-ui && pnpm i && cd ..
cd hederax-market && pnpm i && cd ..
cd gift-server && pnpm i && cd ..
cd hederax-contracts && pnpm i && cd ..

# 3) Create .env files (see samples below)
#    - hedrax-ui/.env
#    - hederax-market/.env
#    - gift-server/.env
#    - hederax-contracts/.env

# 4) Run server & UI (in separate terminals)
cd gift-server && pnpm dev
cd hedrax-ui   && pnpm dev
# Optional: marketplace
cd hederax-market && pnpm dev

Setup — UI (hedrax-ui)

What it is: public landing page, wallet connect, and the waitlist/claim modal.

Common scripts

cd hedrax-ui
pnpm i
pnpm dev       # http://localhost:5173
pnpm build
pnpm preview


Example .env for UI

Create hedrax-ui/.env:

# Hedera network selection
VITE_HEDERA_NETWORK=mainnet   # or testnet

# Server API base (gift-server)
VITE_API_BASE_URL=http://localhost:5000

# Optional UI toggles
VITE_SHOW_WAITLIST=true
VITE_ENABLE_WALLETCONNECT=true


Key features

Wallet connect (HashPack / WalletConnect).

Waitlist modal collects email + Hedera accountId.

Calls gift-server to:

check quotas/health

submit claim

show “Congratulations” or actionable errors.

Setup — Marketplace (hederax-market)

What it is: the marketplace front-end. Check this folder’s own README for framework details—if it’s Vite, usage mirrors hedrax-ui; if Next.js:

cd hederax-market
pnpm i
pnpm dev        # http://localhost:3000 (Next.js) or :5173 (Vite)
pnpm build
pnpm start


Example .env

# If Next.js, use NEXT_PUBLIC_*
NEXT_PUBLIC_HEDERA_NETWORK=mainnet
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_CONTRACT_ADDRESS=<optional>

# If Vite, use VITE_*
VITE_HEDERA_NETWORK=mainnet
VITE_API_BASE_URL=http://localhost:5000

Setup — Server (gift-server)

What it is: Minimal Express API that:

Stores waitlist entries (email, accountId) in MongoDB.

Sends HBAR gifts from the operator account (quota controlled).

Provides health and admin endpoints.

Scripts

cd gift-server
pnpm i
pnpm dev     # starts on PORT (default 5000)
pnpm start   # production


Example .env (gift-server/.env)

# Core
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/hedrax
LOG_LEVEL=info
ADMIN_TOKEN=supersecret123

# Hedera
HEDERA_NETWORK=mainnet         # or testnet
OPERATOR_ID=0.0.xxxxxxx
OPERATOR_KEY=<your-private-key>
HBAR_GIFT_AMOUNT=0.1           # amount per claim (HBAR)
HBAR_MAX_SLOTS=20              # how many gifts available

# (Optional) Timeouts/retries
SEND_TIMEOUT_MS=15000


API Endpoints (typical)

GET /api/health → { ok, quota, operatorHbar, amount }

POST /api/claim → { ok, txId } or { error, message }

POST /api/admin/quotas/set (header x-admin-token) → set remaining

POST /api/admin/claims/clear → clear a specific account’s claim

GET /api/admin/operator/verify → confirm keys match on-chain public key

Notes:

Never commit real keys. Use .env.

If you see INVALID_SIGNATURE, check private-key format and network (see Troubleshooting).

Setup — Contracts (hederax-contracts)

What it is: Hardhat project for compiling/deploying Solidity contracts used by the ecosystem.

Scripts

cd hederax-contracts
pnpm i
pnpm compile
pnpm test
pnpm run deploy    # check package.json scripts


Example .env (hederax-contracts/.env)

NETWORK=mainnet           # or testnet
PRIVATE_KEY=<deployer-private-key>
RPC_URL=<hedera-json-rpc-if-used>
ETHERSCAN_API_KEY=<if verification is configured>


ABIs generated here should be copied/linked to hedrax-ui and hederax-market when needed.

Keep deployment addresses noted and synced to frontends.

Environments & Secrets

Place all secrets in the appropriate .env files (never commit them).

Example keys: OPERATOR_KEY, database URIs, API tokens.

CI/CD can inject secrets as environment variables.

Private Key formats (Hedera):

ED25519 / ECDSA keys can be provided in multiple encodings.

With @hashgraph/sdk, prefer the explicit constructors:

PrivateKey.fromStringED25519("302e0201...") (DER hex or 64-char raw)

PrivateKey.fromStringECDSA("302e0201...")

If your key is a hex string without prefix, pass it to the right helper (ED25519 vs ECDSA). Mismatches cause INVALID_SIGNATURE.
