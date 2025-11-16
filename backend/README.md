# Banka Backend

FastAPI backend for Banka social savings vaults.

## Features

- ✅ REST API for vault data
- ✅ WebSocket for real-time updates
- ✅ Event listener for blockchain events
- ✅ PostgreSQL database
- ✅ SQLAlchemy ORM

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Set Up PostgreSQL

#### Option A: Local PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb banka
```

#### Option B: Docker

```bash
docker run --name banka-postgres \
  -e POSTGRES_PASSWORD=banka \
  -e POSTGRES_USER=banka \
  -e POSTGRES_DB=banka \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Initialize Database

Database tables are created automatically on first run.

### 6. Run API Server

```bash
python main.py
```

API will be available at http://localhost:8000

### 7. Run Event Listener (Separate Terminal)

```bash
source venv/bin/activate
python event_listener.py
```

## API Endpoints

### Health

- `GET /api/health` - Health check

### Metadata

- `POST /api/metadata` - Create vault metadata
  ```json
  {
    "title": "Emergency Fund",
    "description": "Saving for 6 months expenses",
    "image_url": "https://..."
  }
  ```

### Vaults

- `GET /api/vaults/{address}` - Get vault details
- `GET /api/vaults?creator=0x...&status=active` - List vaults

### WebSocket

- `WS /ws/vault/{address}` - Real-time vault updates

## Development

### API Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Database Migrations (Future)

```bash
# Initialize Alembic (later)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "description"

# Run migration
alembic upgrade head
```

## Architecture

```
backend/
├── main.py              # FastAPI app
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── database.py          # Database config
├── event_listener.py    # Blockchain event indexer
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

## Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/banka
BASE_RPC_URL=https://sepolia.base.org
FACTORY_ADDRESS=0x...  # From contracts deployment
API_HOST=0.0.0.0
API_PORT=8000
```

## Testing

```bash
# TODO: Add pytest tests
pytest
```

## Deployment

### Railway

1. Create new project on Railway
2. Add PostgreSQL plugin
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python main.py`
5. Add PostgreSQL database
6. Set environment variables

## License

MIT
