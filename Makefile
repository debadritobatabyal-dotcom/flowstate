.PHONY: help up down migrate seed train test e2e reset-demo run-backend run-frontend

help:
	@echo "FLOWSTATE — AICTE Administrative Intelligence Platform"
	@echo "Available commands:"
	@echo "  make up           - Start all services with Docker Compose"
	@echo "  make down         - Stop Docker Compose services"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed deterministic synthetic data (SEED_RANDOM=42)"
	@echo "  make train        - Train process duration and delay risk ML models"
	@echo "  make test         - Run backend and engine unit & integration tests"
	@echo "  make reset-demo   - Reset Meridian Institute demonstration scenario"
	@echo "  make run-backend  - Run FastAPI server locally with reload"
	@echo "  make run-frontend - Run Next.js frontend locally"

up:
	docker compose up -d --build

down:
	docker compose down

migrate:
	source .venv/bin/activate && cd backend && alembic upgrade head

seed:
	source .venv/bin/activate && python -m backend.app.seed.run --reset

train:
	source .venv/bin/activate && python -m backend.app.ml.train

test:
	source .venv/bin/activate && pytest backend/tests -v

reset-demo:
	source .venv/bin/activate && python -m backend.app.seed.run --demo-only

run-backend:
	source .venv/bin/activate && cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend:
	cd frontend && npm run dev
