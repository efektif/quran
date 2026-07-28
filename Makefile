.PHONY: install dev build deploy web android ios

install:
	pnpm install

dev:
	pnpm start

build:
	pnpm build

deploy:
	pnpm deploy

web:
	pnpm web

android:
	pnpm android

ios:
	pnpm ios
