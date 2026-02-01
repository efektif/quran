# Efektif Quran - Makefile
# Commands for building and deploying to Cloudflare Pages

.PHONY: all install build clean dev preview deploy help

# Default target
all: build

# Install dependencies using bun
install:
	bun install

# Build the web app for production
build:
	bun run build:web
	@echo "Build complete! Output in ./dist"

# Clean build artifacts
clean:
	rm -rf dist .expo
	@echo "Cleaned build artifacts"

# Start development server
dev:
	bun run web

# Preview the production build locally using Wrangler
preview: build
	bunx wrangler pages dev dist

# Deploy to Cloudflare Pages
deploy: build
	bunx wrangler pages deploy dist --project-name=efektif-quran
	@echo "Deployed to Cloudflare Pages!"

# Deploy without rebuilding (use existing dist)
deploy-only:
	bunx wrangler pages deploy dist --project-name=efektif-quran

# First-time setup: create Cloudflare Pages project
cf-init:
	bunx wrangler pages project create efektif-quran --production-branch=main

# Login to Cloudflare
cf-login:
	bunx wrangler login

# Show help
help:
	@echo "Efektif Quran - Available Commands:"
	@echo ""
	@echo "  make install     - Install dependencies with bun"
	@echo "  make build       - Build web app for production"
	@echo "  make clean       - Remove build artifacts"
	@echo "  make dev         - Start development server"
	@echo "  make preview     - Preview production build locally"
	@echo "  make deploy      - Build and deploy to Cloudflare Pages"
	@echo "  make deploy-only - Deploy existing build (no rebuild)"
	@echo "  make cf-init     - Create Cloudflare Pages project (first time)"
	@echo "  make cf-login    - Login to Cloudflare account"
	@echo ""
