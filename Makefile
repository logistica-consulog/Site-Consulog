# Makefile para Logsmart Frontend
# Comandos rápidos para desenvolvimento e deploy

.PHONY: help dev build start clean docker-build docker-up docker-down docker-logs docker-deploy

# Variáveis
DOCKER_IMAGE=logsmart-frontend
DOCKER_TAG=latest

## help: Mostra esta mensagem de ajuda
help:
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "  Desenvolvimento:"
	@echo "    make dev              - Inicia servidor de desenvolvimento"
	@echo "    make build            - Build de produção (local)"
	@echo "    make start            - Inicia aplicação em modo produção (local)"
	@echo "    make clean            - Limpa cache e node_modules"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-build     - Build da imagem Docker"
	@echo "    make docker-up        - Inicia containers (docker-compose up -d)"
	@echo "    make docker-down      - Para containers (docker-compose down)"
	@echo "    make docker-logs      - Mostra logs dos containers"
	@echo "    make docker-deploy    - Deploy completo com Docker (build + up)"
	@echo "    make docker-rebuild   - Rebuild sem cache + restart"
	@echo "    make docker-shell     - Acessa shell do container da aplicação"
	@echo ""
	@echo "  Produção (sem Docker):"
	@echo "    make deploy           - Deploy usando PM2 (script bash)"
	@echo ""

## dev: Inicia servidor de desenvolvimento
dev:
	npm run dev

## build: Build de produção local
build:
	npm run build

## start: Inicia aplicação em modo produção local
start:
	npm run start:prod

## clean: Limpa cache e dependências
clean:
	rm -rf .next
	rm -rf node_modules
	rm -rf out
	@echo "Cache limpo! Execute 'npm install' para reinstalar dependências"

## docker-build: Build da imagem Docker
docker-build:
	docker-compose build

## docker-build-no-cache: Build sem cache
docker-build-no-cache:
	docker-compose build --no-cache

## docker-up: Inicia containers
docker-up:
	docker-compose up -d

## docker-down: Para containers
docker-down:
	docker-compose down

## docker-logs: Mostra logs dos containers
docker-logs:
	docker-compose logs -f

## docker-logs-app: Mostra logs apenas da aplicação
docker-logs-app:
	docker-compose logs -f app

## docker-logs-nginx: Mostra logs apenas do Nginx
docker-logs-nginx:
	docker-compose logs -f nginx

## docker-rebuild: Rebuild sem cache e restart
docker-rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "Containers reconstruídos e iniciados!"

## docker-restart: Reinicia containers
docker-restart:
	docker-compose restart

## docker-shell: Acessa shell do container da aplicação
docker-shell:
	docker-compose exec app sh

## docker-ps: Status dos containers
docker-ps:
	docker-compose ps

## docker-clean: Remove containers, imagens e volumes
docker-clean:
	docker-compose down -v
	docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) || true
	@echo "Containers e imagens Docker removidos"

## test-build: Testa build de produção localmente
test-build:
	@echo "Testando build de produção..."
	npm run build
	@echo "✓ Build concluído com sucesso!"
