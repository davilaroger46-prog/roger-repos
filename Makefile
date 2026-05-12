.PHONY: up down build restart logs migrate shell-backend shell-frontend

up:
	docker compose up

build:
	docker compose up --build

down:
	docker compose down

restart:
	docker compose down && docker compose up --build

logs:
	docker compose logs -f

migrate:
	docker compose exec backend alembic upgrade head

shell-backend:
	docker compose exec backend bash

shell-frontend:
	docker compose exec frontend sh
