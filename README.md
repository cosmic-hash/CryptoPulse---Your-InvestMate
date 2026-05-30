<div align="center">

# CryptoPulse — Your InvestMate

**Real-time cryptocurrency sentiment intelligence powered by social data, NLP, and AI.**

Track how the market *feels* about BTC, ETH, SOL, and more — before the charts catch up.

[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Contributing](#-contributing)

</div>

---

## Overview

**CryptoPulse** is a full-stack, microservices-based platform that ingests cryptocurrency-related content from **Reddit**, **news sources**, and social channels, analyzes sentiment using **BERT** and **VADER**, aggregates scores in real time, and delivers insights through a modern React dashboard.

Whether you're a trader watching community mood swings or a researcher studying market narratives, CryptoPulse turns noisy social chatter into actionable sentiment signals — complete with **live WebSocket charts**, **historical news browsing**, **custom alerts**, and **AI-powered explanations** of why sentiment shifted.

> *"In crypto, sentiment moves markets. CryptoPulse helps you see it coming."*

---

## ✨ Features

### Live Sentiment Dashboard
- Real-time **WebSocket** streaming of aggregated sentiment scores across 10 major cryptocurrencies
- Interactive multi-coin line charts with configurable time windows (1h, 6h, 24h)
- Token filtering — focus on the coins you care about (BTC, ETH, SOL, ADA, DOGE, and more)

### AI Sentiment Explanations
- **OpenAI-powered** natural language summaries explaining *why* sentiment changed for a given coin and time window
- Contextual analysis drawn from raw message content stored in PostgreSQL

### Smart Alerts
- Set custom sentiment thresholds per coin
- Email notifications via Gmail SMTP when thresholds are breached
- Alert subscriptions managed through Firebase Firestore

### Historical News & Research
- Browse filtered crypto news articles by date range and currency
- Sentiment-scored news archive for backtesting and trend analysis

### Reddit Data Pipeline
- Automated ingestion from coin-specific subreddits (r/Bitcoin, r/ethereum, r/solana, etc.)
- 8 structured question categories per coin (security, regulation, adoption, partnerships, and more)
- Sentiment scoring applied at ingestion time via the BERT model service

### User Profiles & Authentication
- **Google Sign-In** via Firebase Authentication
- Personalized coin watchlists and saved research questions
- Profile management with Firestore-backed user data

---

## 🏗 Architecture

CryptoPulse follows a **microservices architecture** with five backend services and multiple frontend clients, all connected through a shared **PostgreSQL** database (Neon) and **Firebase** for auth/alerts.

```mermaid
flowchart TB
    subgraph Clients["Frontend Clients"]
        FE1["my-crypto-app<br/>(React + CRA)"]
        FE2["project / project_3<br/>(React + Vite)"]
    end

    subgraph Backend["Backend Services"]
        GS["go-service<br/>Go · Port 8080"]
        PA["pulse-auth<br/>Flask · Port 8080"]
        SM["sentiment-model<br/>Flask · Port 8080"]
        SH["stream-handler<br/>Flask · Port 8080"]
    end

    subgraph External["External Services"]
        REDDIT["Reddit API"]
        NEWS["News Sources"]
        OAI["OpenAI API"]
        FB["Firebase Auth<br/>& Firestore"]
        GMAIL["Gmail SMTP"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL<br/>(Neon)")]
    end

    FE1 & FE2 -->|REST / WebSocket| GS
    FE1 & FE2 -->|Auth API| PA
    SH -->|Fetch posts| REDDIT
    SH -->|Scrape news| NEWS
    SH -->|Score text| SM
    SH -->|Write messages| PG
    GS -->|Read / aggregate| PG
    GS -->|Alerts CRUD| FB
    GS -->|Explain sentiment| OAI
    PA -->|Verify tokens| FB
    PA -->|User profiles| FB
    PA -->|Alert checks| PG
    PA -->|Send emails| GMAIL
    SM -->|BERT inference| SM
```

### Data Flow

```
Reddit / News  →  stream-handler  →  sentiment-model (BERT)
                         ↓
                    PostgreSQL (raw_messages)
                         ↓
                   go-service (/aggregate)
                         ↓
              PostgreSQL (aggregated_sentiments)
                         ↓
              go-service (/ws WebSocket)  →  Frontend Charts
                         ↓
              go-service (/explain + OpenAI)  →  AI Summaries
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Ant Design, Recharts, Chart.js, Framer Motion, Vite |
| **API Gateway** | Go 1.24, Gorilla WebSocket, pgx, godotenv |
| **Auth Service** | Python Flask, Firebase Admin SDK, psycopg2 |
| **Sentiment Engine** | Python Flask, Hugging Face Transformers, PyTorch, BERT (`nlptown/bert-base-multilingual-uncased-sentiment`), VADER |
| **Stream Handler** | Python Flask, PRAW (Reddit), BeautifulSoup, Kafka |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth & Alerts** | Firebase Authentication, Cloud Firestore |
| **AI** | OpenAI GPT (sentiment explanations) |
| **DevOps** | GitHub Actions CI, Docker, Google Cloud Run |

---

## 📁 Project Structure

```
CryptoPulse/
├── frontend/
│   └── my-crypto-app/          # Primary React dashboard (CRA + TypeScript)
│       ├── src/pages/
│       │   ├── LivePage/       # Real-time WebSocket sentiment charts
│       │   ├── SentimentChart/ # Historical sentiment visualization
│       │   ├── SentimentDashboard/
│       │   ├── Profile/        # User profile & watchlists
│       │   ├── About/          # Team & project info
│       │   └── Home/
│       └── src/components/
│
├── project/                    # Vite + React prototype (tab-based UI)
├── project_3/                  # Vite + React app (alerts, AI explain, live charts)
│
├── go-service/                 # Core API & WebSocket server (Go)
│   ├── cmd/server/             # Entry point
│   ├── pkg/
│   │   ├── handler/            # HTTP & WS handlers
│   │   ├── db/                 # PostgreSQL queries
│   │   ├── firebase/           # Firestore client
│   │   ├── openai/             # GPT client
│   │   └── alert/              # Alert subscription logic
│   └── mapping.json            # Reddit question category mapping
│
├── pulse-auth/                 # Authentication & user management (Flask)
│   ├── app.py                  # Google OAuth, profiles, alert emails
│   └── utils.py                # Gmail SMTP helper
│
├── sentiment-model/            # NLP sentiment analysis (Flask)
│   ├── app.py                  # BERT & VADER endpoints
│   └── vader/                  # VADER lexicon & scorer
│
├── stream-handler/             # Data ingestion pipeline (Flask)
│   ├── app.py                  # Reddit & news ingestion APIs
│   ├── fetch_posts.py          # Reddit post fetcher (PRAW)
│   ├── fetch_tweets.py         # Twitter integration (stub)
│   └── news_score_util/        # News scraping & scoring scripts
│
├── .github/workflows/          # CI pipelines for each service
│   ├── ci_go_service.yml
│   ├── ci_pulse_auth.yml
│   ├── ci_sentiment_model.yml
│   └── ci_stream_handler.yml
│
└── CryptoPulse Slides.pdf      # Project presentation deck
```

---

## 🪙 Supported Cryptocurrencies

| Code | Coin | Subreddit |
|------|------|-----------|
| BTC | Bitcoin | r/Bitcoin |
| ETH | Ethereum | r/ethereum |
| USDT | Tether | r/Tether+CryptoCurrency |
| XRP | Ripple | r/Ripple |
| BNB | Binance Coin | r/binance |
| SOL | Solana | r/solana |
| USDC | USD Coin | r/CryptoCurrency |
| TRX | Tron | r/Tronix |
| DOGE | Dogecoin | r/dogecoin |
| ADA | Cardano | r/cardano |

Each coin is analyzed across **8 question categories**: features, leadership, security, market trends, regulation, community sentiment, partnerships, and mining/staking.

---

## 🚀 Quick Start

### Prerequisites

- **Go** 1.24+
- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** database (e.g. [Neon](https://neon.tech/))
- **Firebase** project with Authentication enabled
- **OpenAI** API key (for `/explain` endpoint)
- **Reddit API** credentials (for stream-handler)

### 1. Clone the Repository

```bash
git clone git@github.com:cosmic-hash/CryptoPulse---Your-InvestMate.git
cd CryptoPulse---Your-InvestMate
```

### 2. Environment Variables

Create `.env` files in each service directory. **Never commit these to git.**

<details>
<summary><strong>go-service/.env</strong></summary>

```env
PORT=8080
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-service-account.json
OPENAI_API_KEY=sk-...
QUESTION_MAPPING_FILE=mapping.json
```

</details>

<details>
<summary><strong>pulse-auth/.env</strong></summary>

```env
PORT=8080
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
FIREBASE_CREDS={"type":"service_account",...}
FLASK_SECRET_KEY=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
```

</details>

<details>
<summary><strong>stream-handler/.env</strong></summary>

```env
PORT=8080
DB_HOST=your-neon-host
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=your-password
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
REDDIT_USER_AGENT=CryptoPulse/1.0
```

</details>

<details>
<summary><strong>frontend/my-crypto-app/.env</strong></summary>

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
```

</details>

### 3. Start Backend Services

**Sentiment Model** (start first — other services depend on it):

```bash
cd sentiment-model
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
# → Running on http://localhost:8080
```

**Stream Handler:**

```bash
cd stream-handler
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
# → Running on http://localhost:8080
```

**Pulse Auth:**

```bash
cd pulse-auth
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
# → Running on http://localhost:8080
```

**Go Service:**

```bash
cd go-service
go mod download
go run cmd/server/main.go
# → 🟢 Server listening on port 8080
```

> **Tip:** Each Python service defaults to port 8080. Run them on different ports by setting `PORT=8081`, `PORT=8082`, etc.

### 4. Start the Frontend

**Primary dashboard** (`frontend/my-crypto-app`):

```bash
cd frontend/my-crypto-app
npm install
npm start
# → http://localhost:3000
```

**Alternative Vite app** (`project_3` — includes alerts & AI explain):

```bash
cd project_3
npm install
npm run dev
# → http://localhost:5173
```

### 5. Docker (Optional)

Each service includes a `Dockerfile` for containerized deployment:

```bash
# Build and run any service
cd go-service
docker build -t cryptopulse-go-service .
docker run -p 8080:8080 --env-file .env cryptopulse-go-service
```

---

## 📡 API Reference

### go-service (Core API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/sentiment?coin_id=91&start=...&end=...` | Query sentiment scores for a coin |
| `POST` | `/aggregate` | Aggregate raw messages into 5-min sentiment buckets |
| `POST` | `/explain` | AI explanation of sentiment shift for a coin/time window |
| `WS` | `/ws?tokens=BTC,ETH` | Real-time sentiment stream via WebSocket |
| `GET` | `/alerts` | List alert subscriptions |
| `POST` | `/alerts` | Create a new alert subscription |
| `PUT` | `/alerts/{id}` | Update an alert |
| `DELETE` | `/alerts/{id}` | Delete an alert |

<details>
<summary><strong>Example: POST /explain</strong></summary>

```bash
curl -X POST http://localhost:8080/explain \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": 99,
    "start_time": "2025-04-21T15:00:00Z",
    "end_time": "2025-04-21T16:00:00Z"
  }'
```

```json
{
  "explanation": "Sentiment for SOL dropped sharply due to increased discussion about network congestion and delayed transactions across r/solana..."
}
```

</details>

<details>
<summary><strong>Example: WebSocket /ws</strong></summary>

```javascript
const ws = new WebSocket('ws://localhost:8080/ws?tokens=BTC,ETH,SOL');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    tokens: ['BTC', 'ETH'],
    start_time: '2025-04-21T15:00:00Z',
    end_time: '2025-04-21T16:00:00Z'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data); // { BTC: [{ time, score }], ETH: [...] }
};
```

</details>

---

### pulse-auth (Authentication)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/google` | — | Google Sign-In with Firebase ID token |
| `GET` | `/api/users/profile` | Bearer | Get user profile |
| `PUT` | `/api/users/profile` | Bearer | Update profile (name, coins, questions) |
| `POST` | `/api/users/coins` | Bearer | Update coin watchlist |
| `POST` | `/api/users/questions` | Bearer | Add a research question |
| `GET` | `/check-alerts` | — | Process & send threshold alert emails |

---

### sentiment-model (NLP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/para-sentiment-analyze` | Sentiment for a list of paragraphs (VADER) |
| `POST` | `/sentence-sentiment-analyze` | Sentiment per sentence (VADER) |
| `POST` | `/predict_sentiment` | BERT-based sentiment (-1.0 to 1.0 scale) |

<details>
<summary><strong>Example: POST /predict_sentiment</strong></summary>

```bash
curl -X POST http://localhost:8080/predict_sentiment \
  -H "Content-Type: application/json" \
  -d '["Bitcoin is looking bullish today!", "ETH gas fees are too high."]'
```

```json
[0.667, -0.333]
```

</details>

---

### stream-handler (Data Ingestion)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reddit_posts` | Fetch Reddit posts for all tracked coins |
| `POST` | `/reddit_db_dump` | Fetch, score, and insert Reddit posts into DB |
| `GET` | `/reddit_status` | Check Reddit API authentication |
| `POST` | `/news` | Query filtered crypto news by date & currency |
| `POST` | `/test_insert` | Insert test message into raw_messages |

<details>
<summary><strong>Example: POST /reddit_db_dump</strong></summary>

```bash
curl -X POST http://localhost:8080/reddit_db_dump \
  -H "Content-Type: application/json" \
  -d '{ "limit": 10, "time_filter": "day" }'
```

</details>

---

## 🧪 Testing

Each service includes unit tests and GitHub Actions CI pipelines.

```bash
# Go service
cd go-service && go test ./... -v

# Python services
cd pulse-auth       && python -m pytest tests.py -v
cd sentiment-model  && python -m pytest tests.py -v
cd stream-handler   && python -m pytest tests.py -v

# Frontend
cd frontend/my-crypto-app && npm test
```

CI runs automatically on every push and pull request to `main`.

---

## 🗄 Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `currency` | Cryptocurrency definitions (id, code, subreddit) |
| `raw_messages` | Ingested Reddit posts, news, and social content with sentiment scores |
| `aggregated_sentiments` | 5-minute window aggregated sentiment per coin |
| `crypto_news` | Historical news articles with sentiment scores |

Users and alert subscriptions are stored in **Firebase Firestore** (`users`, `alert_subscriptions` collections).

---

## 🖥 Frontend Applications

This repo contains three frontend implementations at different stages of development:

| App | Stack | Highlights |
|-----|-------|-----------|
| `frontend/my-crypto-app` | React 19 + CRA + Ant Design + Recharts | Production dashboard with live charts, profile, about page |
| `project` | React 18 + Vite + Tailwind | Tab-based UI (Live Stream, Historical, Profile) |
| `project_3` | React 18 + Vite + Chart.js + Framer Motion | Full-featured app with alerts panel, AI explain modal, digital clock |

---

## 🔒 Security Notes

- All `.env` files, Firebase service account JSON, and credential files are **gitignored**
- Authentication uses Firebase ID token verification on every protected endpoint
- Database credentials are loaded from environment variables — never hardcoded
- CORS is configured for known origins in the Go service

> **Important:** Rotate any credentials that may have been exposed before setting up your own environment.



<div align="center">

**Built for traders, researchers, and crypto enthusiasts who want to stay ahead of the sentiment curve.**

[⬆ Back to Top](#cryptopulse--your-investmate)

</div>
