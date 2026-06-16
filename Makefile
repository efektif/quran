.PHONY: install dev build deploy web android ios

install:
	bun install

dev:
	bun run start

build:
	bun run build

deploy:
	bun run deploy

web:
	bun run web

android:
	bun run android

ios:
	bun run ios
