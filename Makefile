.PHONY: up down build restart logs ps migrate makemigration shell-backend shell-db clean test \
        prod-up prod-down prod-build prod-logs prod-migrate prod-backup prod-restore ssl-init

# ─────────────────────────────────────────────
# DEV
# ─────────────────────────────────────────────

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

# ─────────────────────────────────────────────
# PRODUÇÃO
# ─────────────────────────────────────────────

prod-build:
	docker compose -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-restart:
	docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d --build

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

prod-migrate:
	docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

prod-backup:
	@bash scripts/backup.sh

prod-restore:
	@bash scripts/restore.sh $(file)

prod-shell-db:
	docker compose -f docker-compose.prod.yml exec postgres psql -U orthostudy -d orthostudy

prod-clean:
	docker compose -f docker-compose.prod.yml down -v

# ─────────────────────────────────────────────
# SSL (Let's Encrypt)
# ─────────────────────────────────────────────

ssl-init:
	@echo "Gerando certificado SSL para $(domain)..."
	docker run --rm -p 80:80 \
		-v $(PWD)/nginx/ssl:/etc/letsencrypt \
		certbot/certbot certonly --standalone \
		--agree-tos --no-eff-email \
		-m $(email) -d $(domain) -d www.$(domain)
	@cp nginx/ssl/live/$(domain)/fullchain.pem nginx/ssl/fullchain.pem
	@cp nginx/ssl/live/$(domain)/privkey.pem nginx/ssl/privkey.pem
	@echo "Certificado gerado em nginx/ssl/"

ssl-renew:
	docker run --rm \
		-v $(PWD)/nginx/ssl:/etc/letsencrypt \
		certbot/certbot renew --quiet
	docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
