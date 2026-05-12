.PHONY: up down build restart logs ps migrate makemigration shell-backend shell-db clean test

up:
	docker compose up

build:
	docker compose up --build

down:
	docker compose down

restart:
	docker compose down
	docker compose up --build

logs:
	docker compose logs -f

ps:
	docker compose ps

migrate:
	docker compose exec backend alembic upgrade head

makemigration:
	docker compose exec backend alembic revision --autogenerate -m "$(m)"

shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec postgres psql -U orthostudy -d orthostudy

clean:
	docker compose down -v

test:
	docker compose exec backend pytest -q
