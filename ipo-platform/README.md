# The Financial Architect — IPO Platform Backend

Full-stack backend for a production-grade IPO analysis platform.

## Architecture

```
React Frontend
      │
      ▼
Node.js (Express) ──── MySQL 8.0
      │
      ▼ HTTP (async, non-blocking)
Python (FastAPI)
  FinBERT + LR + XGBoost
```

## Folder Structure

```
ipo-platform/
├── node-backend/
│   ├── src/
│   │   ├── app.js                      ← Express entry point
│   │   ├── config/
│   │   │   ├── database.js             ← MySQL pool
│   │   │   └── env.js                  ← env vars
│   │   ├── controllers/
│   │   │   ├── ipoController.js
│   │   │   ├── marketController.js
│   │   │   └── healthController.js
│   │   ├── services/
│   │   │   ├── ipoService.js           ← core business logic
│   │   │   ├── aiService.js            ← HTTP client → Python
│   │   │   ├── scraperService.js       ← NSE / BSE / SEBI scrapers
│   │   │   ├── syncScheduler.js        ← 30s background sync
│   │   │   └── marketService.js
│   │   ├── models/
│   │   │   ├── IPO.js
│   │   │   └── Analysis.js
│   │   ├── routes/
│   │   │   ├── ipoRoutes.js
│   │   │   ├── marketRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.js
│   │   ├── migrations/
│   │   │   ├── schema.sql
│   │   │   └── run.js
│   │   └── utils/
│   │       ├── asyncWrapper.js
│   │       └── logger.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── python-service/
│   ├── app/
│   │   ├── main.py                     ← FastAPI app
│   │   ├── routes.py                   ← POST /analyze
│   │   └── services/
│   │       ├── analyzer.py             ← pipeline orchestrator
│   │       ├── pdf_extractor.py        ← PyMuPDF download + parse
│   │       ├── ml_pipeline.py          ← FinBERT + LR + XGBoost
│   │       └── text_generators.py      ← structured section text
│   ├── requirements.txt
│   ├── run.py
│   ├── .env.example
│   └── Dockerfile
│
├── frontend-integration/
│   ├── apiClient.ts                    ← fetch wrappers
│   ├── useLiveIPOs.ts                  ← React hooks (live data + polling)
│   └── DRHPAnalysisTab.tsx             ← drop-in DRHP tab component
│
└── docker-compose.yml
```

## API Endpoints

| Method | Path                            | Description                              |
|--------|---------------------------------|------------------------------------------|
| GET    | /api/ipos                       | List all IPOs (filter by status/sector)  |
| GET    | /api/ipos/:id                   | IPO detail (auto-triggers analysis)      |
| GET    | /api/ipos/:id/analysis          | Get or trigger DRHP ML analysis          |
| GET    | /api/ipos/:id/analysis/status   | Poll analysis progress (every 5s)        |
| GET    | /api/ipos/:id/subscription      | Live NSE subscription data               |
| GET    | /api/market/trends              | Sector market trends                     |
| GET    | /api/market/sectors             | All available sectors                    |
| GET    | /health                         | Service health check                     |
| POST   | /analyze (Python)               | DRHP PDF → ML analysis                   |

## Local Setup

### 1. MySQL
```bash
mysql -u root -p < node-backend/src/migrations/schema.sql
```

### 2. Node Backend
```bash
cd node-backend
cp .env.example .env        # fill in DB_PASSWORD
npm install
npm run dev                 # http://localhost:3000
```

### 3. Python ML Service
```bash
cd python-service
pip install -r requirements.txt
cp .env.example .env        # set USE_MOCK_ML=true for development
python run.py               # http://localhost:8000
```

### 4. Docker (all services)
```bash
cp node-backend/.env.example .env
docker-compose up --build
```

## DRHP Auto-Analysis Flow

```
User opens IPO card
  → GET /api/ipos/:id          (Node checks analysisStatus)
  → if drhpPdfUrl + no analysis: fires triggerAnalysisAsync()
  → returns immediately with status: "pending"

User opens DRHP tab
  → GET /api/ipos/:id/analysis
  → Node calls Python POST /analyze with SEBI PDF URL
  → Python: downloads PDF → PyMuPDF → FinBERT → LR → XGBoost
  → Stores full structured report in drhp_analyses table
  → Frontend polls GET /api/ipos/:id/analysis/status every 5s
  → When status = "done" → renders full 6-section report
```

## ML Model Swap (when your trained model is ready)

1. Place trained files in `./models/`:
   - `finbert/`                  ← HuggingFace model directory
   - `lr_redflag_model.pkl`      ← sklearn MultiOutputClassifier
   - `tfidf_vectorizer.pkl`      ← sklearn TfidfVectorizer
   - `xgb_score_model.pkl`       ← xgboost Booster

2. Set in `python-service/.env`:
   ```
   MODEL_DIR=/home/models
   USE_MOCK_ML=false
   ```

3. Restart the Python service — no other changes needed.

## SEBI Compliance

- No BUY/SELL recommendations anywhere in the codebase
- Sentiment: Positive / Neutral / Negative only
- Every analysis response includes a `disclaimer` field
- All analysis marked as "educational purposes only"

## Live Data Refresh Schedule

| Job              | Frequency | Source        |
|------------------|-----------|---------------|
| IPO list sync    | 30 s      | NSE → BSE     |
| GMP refresh      | 5 min     | Public aggregator |
| New DRHP queue   | 10 min    | SEBI EDGAR    |
| Stuck job retry  | 10 min    | Internal      |
