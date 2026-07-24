#!/usr/bin/env bash
# Usage: ./deploy.sh
# Pulls origin/main, runs all quality gates, atomically deploys to Caddy,
# verifies production, and restores the previous release on failure.
set -Eeuo pipefail
readonly PATH="/home/ubuntu/.volta/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export PATH
unset CDPATH GIT_DIR GIT_WORK_TREE

readonly REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
readonly UI_ROOT="$(cd -- "$REPO_ROOT/../efektif-ui" && pwd -P)"
readonly EXPECTED_REPO_ROOT="/home/ubuntu/efektif/efektif-quran"
readonly EXPECTED_UI_ROOT="/home/ubuntu/efektif/efektif-ui"
readonly WEB_ROOT="/var/www/quran.efektif.app"
readonly SITE_URL="https://quran.efektif.app"
readonly LOCK_FILE="$REPO_ROOT/.git/deploy.lock"
readonly EXPECTED_WEB_ROOT="/var/www/quran.efektif.app"

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

for command in bun cp curl date diff find flock git python3 rsync stat sudo; do
  command -v "$command" >/dev/null 2>&1 || fail "Required command not found: $command"
done

[[ "$WEB_ROOT" == "$EXPECTED_WEB_ROOT" ]] || fail "Refusing unexpected web root: $WEB_ROOT"
[[ "$SITE_URL" == "https://quran.efektif.app" ]] || fail "Refusing unexpected site URL: $SITE_URL"
[[ "$REPO_ROOT" == "$EXPECTED_REPO_ROOT" ]] || fail "Refusing unexpected repository path: $REPO_ROOT"
[[ "$UI_ROOT" == "$EXPECTED_UI_ROOT" ]] || fail "Refusing unexpected Efektif UI path: $UI_ROOT"
[[ -d "$REPO_ROOT/.git" ]] || fail "Not a Git repository: $REPO_ROOT"
[[ -d "$UI_ROOT/.git" ]] || fail "Efektif UI is not a Git repository: $UI_ROOT"
[[ -f "$UI_ROOT/packages/native/package.json" ]] || fail "Missing @efektif/native under $UI_ROOT"
[[ -f "$UI_ROOT/packages/tokens/package.json" ]] || fail "Missing @efektif/tokens under $UI_ROOT"
/usr/bin/sudo -n /usr/bin/true >/dev/null 2>&1 || fail "Passwordless sudo is required for /var/www deployment"
[[ -d /var/www && ! -L /var/www && "$(stat -c '%U:%G' /var/www)" == "root:root" ]] || fail "/var/www must be a root-owned directory"
[[ -d "$WEB_ROOT" && ! -L "$WEB_ROOT" ]] || fail "Web root must be an existing real directory"

exec 9>"$LOCK_FILE"
flock -n 9 || fail "Another Quran deployment is already running"

cd "$REPO_ROOT"
[[ "$(git branch --show-current)" == "main" ]] || fail "Deployments must run from the main branch"
quran_origin="$(git remote get-url origin)"
[[ "$quran_origin" == "https://github.com/efektif/quran.git" || "$quran_origin" == "git@github.com:efektif/quran.git" ]] || fail "Unexpected Quran origin: $quran_origin"
[[ -z "$(git status --porcelain)" ]] || fail "Quran repository has uncommitted changes"

log "Fetching and fast-forwarding Quran main"
git fetch origin --prune
git pull --ff-only origin main
deployed_commit="$(git rev-parse HEAD)"
[[ "$deployed_commit" == "$(git rev-parse origin/main)" ]] || fail "Quran HEAD does not match origin/main"
[[ -z "$(git status --porcelain)" ]] || fail "Quran repository became dirty after pull"

if [[ -d "$UI_ROOT/.git" ]]; then
  [[ "$(git -C "$UI_ROOT" branch --show-current)" == "main" ]] || fail "Efektif UI must be on main"
  ui_origin="$(git -C "$UI_ROOT" remote get-url origin)"
  [[ "$ui_origin" == "https://github.com/efektif/ui.git" || "$ui_origin" == "git@github.com:efektif/ui.git" ]] || fail "Unexpected Efektif UI origin: $ui_origin"
  [[ -z "$(git -C "$UI_ROOT" status --porcelain)" ]] || fail "Efektif UI repository has uncommitted changes"
  log "Checking Efektif UI dependency checkout"
  git -C "$UI_ROOT" fetch origin --prune
  read -r ui_ahead ui_behind < <(git -C "$UI_ROOT" rev-list --left-right --count HEAD...origin/main)
  [[ "$ui_ahead" == "0" && "$ui_behind" == "0" ]] || fail "Efektif UI must match origin/main (ahead=$ui_ahead, behind=$ui_behind)"
  ui_commit="$(git -C "$UI_ROOT" rev-parse HEAD)"
fi

log "Installing and building local Efektif UI packages"
(
  cd "$UI_ROOT"
  bun install --frozen-lockfile --force
  bun run tokens:build
  bun run --filter @efektif/native build
)
[[ -z "$(git -C "$UI_ROOT" status --porcelain)" ]] || fail "Efektif UI build modified tracked files"
[[ "$(git -C "$UI_ROOT" rev-parse HEAD)" == "$ui_commit" ]] || fail "Efektif UI HEAD changed during build"

log "Installing Quran dependencies"
[[ ! -e node_modules || (-d node_modules && ! -L node_modules) ]] || fail "node_modules must be a real directory"
rm -rf -- node_modules
bun install --frozen-lockfile

# Bun file: dependencies can contain symlinks to the sibling repository. Metro
# cannot reliably export those paths outside this project, so materialize the
# two already-built packages as real directories for this deployment build.
rm -rf -- node_modules/@efektif/native node_modules/@efektif/tokens
mkdir -p node_modules/@efektif
cp -a -- "$UI_ROOT/packages/native" node_modules/@efektif/native
cp -a -- "$UI_ROOT/packages/tokens" node_modules/@efektif/tokens
[[ -f node_modules/@efektif/native/dist/index.js ]] || fail "@efektif/native build output is missing"
[[ -f node_modules/@efektif/tokens/dist/index.js ]] || fail "@efektif/tokens build output is missing"

compgen -G '.env*.local' >/dev/null && fail "Local environment files are not allowed during deployment"
rm -rf -- .expo dist test-results
rm -f -- expo-env.d.ts

log "Running quality gates"
bun run lint
bunx tsc --noEmit
bun run test:unit
bun run test:integration
CI=1 bun run test:e2e
[[ -z "$(git status --porcelain)" ]] || fail "Quality gates modified tracked or untracked files"
[[ "$(git rev-parse HEAD)" == "$deployed_commit" ]] || fail "Quran HEAD changed during quality gates"

log "Building static Expo export"
rm -rf -- dist
bun run build
[[ -z "$(git status --porcelain)" ]] || fail "Build modified tracked or untracked files"
[[ "$(git rev-parse HEAD)" == "$deployed_commit" ]] || fail "Quran HEAD changed during build"
for required in dist/index.html dist/reader.html dist/changelog.html; do
  [[ -s "$required" ]] || fail "Required export is missing or empty: $required"
done
[[ -z "$(find dist -type l -print -quit)" ]] || fail "Export contains a symbolic link"
[[ -z "$(find dist ! -type f ! -type d -print -quit)" ]] || fail "Export contains a special file"

exchange_paths() {
  /usr/bin/sudo /usr/bin/python3 -I - "$1" "$2" <<'PY'
import ctypes
import os
import sys

AT_FDCWD = -100
RENAME_EXCHANGE = 2
left, right = (os.fsencode(path) for path in sys.argv[1:3])
libc = ctypes.CDLL(None, use_errno=True)
renameat2 = libc.renameat2
renameat2.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
renameat2.restype = ctypes.c_int
if renameat2(AT_FDCWD, left, AT_FDCWD, right, RENAME_EXCHANGE) != 0:
    error = ctypes.get_errno()
    raise OSError(error, os.strerror(error))
PY
}

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
[[ "$stamp" =~ ^[0-9]{8}T[0-9]{6}Z$ ]] || fail "Invalid release timestamp: $stamp"
release=""
backup="${WEB_ROOT}.backup.${stamp}"
failed_release="${WEB_ROOT}.failed.${stamp}"
activated=0
backup_created=0
succeeded=0

cleanup() {
  status=$?
  trap '' INT TERM HUP
  if [[ "$succeeded" == "0" && "$backup_created" == "1" ]]; then
    if [[ ! -d "$backup" || -L "$backup" || "$(stat -c '%U:%G' "$backup" 2>/dev/null || true)" != "root:root" ]]; then
      log "CRITICAL: refusing an invalid rollback directory: $backup"
    else
      log "Deployment failed; atomically restoring $backup"
      if exchange_paths "$WEB_ROOT" "$backup"; then
        /usr/bin/sudo /usr/bin/mv -- "$backup" "$failed_release" || log "WARNING: could not quarantine failed release"
      else
        log "CRITICAL: could not restore $backup"
      fi
    fi
  elif [[ "$activated" == "0" && -d "$release" && "$release" == "${EXPECTED_WEB_ROOT}.release."* ]]; then
    /usr/bin/sudo /usr/bin/rm -rf -- "$release"
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

trap '' INT TERM HUP
release="$(/usr/bin/sudo /usr/bin/mktemp -d "${WEB_ROOT}.release.${stamp}.XXXXXX")"
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

log "Staging release at $release"
/usr/bin/sudo /usr/bin/install -d -m 0755 -o root -g root -- "$release"
/usr/bin/sudo /usr/bin/rsync -rt --delete --chown=root:root --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r -- dist/ "$release"/

[[ -z "$(/usr/bin/sudo /usr/bin/find "$release" -type l -print -quit)" ]] || fail "Staged release contains a symbolic link"
[[ -z "$(/usr/bin/sudo /usr/bin/find "$release" ! -type f ! -type d -print -quit)" ]] || fail "Staged release contains a special file"
diff -qr -- dist "$release" >/dev/null || fail "Staged release differs from dist"
[[ -d "$WEB_ROOT" && ! -L "$WEB_ROOT" && "$(stat -c '%U:%G' "$WEB_ROOT")" == "root:root" ]] || fail "Live web root changed during the build"
[[ -d "$release" && ! -L "$release" && "$(stat -c '%U:%G' "$release")" == "root:root" ]] || fail "Staged release is not a root-owned directory"
[[ ! -e "$backup" && ! -L "$backup" ]] || fail "Backup destination already exists: $backup"
[[ ! -e "$failed_release" && ! -L "$failed_release" ]] || fail "Failed-release destination already exists: $failed_release"

log "Activating release atomically"
trap '' INT TERM HUP
exchange_paths "$WEB_ROOT" "$release"
activated=1
if ! /usr/bin/sudo /usr/bin/mv -- "$release" "$backup"; then
  if exchange_paths "$WEB_ROOT" "$release"; then
    activated=0
  else
    log "CRITICAL: could not reverse failed activation; leaving both directories in place"
  fi
  trap 'exit 130' INT
  trap 'exit 143' TERM
  trap 'exit 129' HUP
  fail "Could not preserve the previous release"
fi
backup_created=1
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

if ! diff -qr -- dist "$WEB_ROOT" >/dev/null; then
  fail "Deployed files differ from dist"
fi

log "Running production smoke checks"
check_200() {
  local url="$1"
  local code
  code="$(curl --proto '=https' --tlsv1.2 --silent --show-error --max-time 30 --output /dev/null --write-out '%{http_code}' "$url")"
  [[ "$code" == "200" ]] || fail "Expected HTTP 200 from $url, got $code"
}

for path in / /reader /changelog; do
  check_200 "${SITE_URL}${path}?deploy=${deployed_commit}"
done

index_html="$(<dist/index.html)"
if [[ "$index_html" =~ (entry-[a-f0-9]+\.js) ]]; then
  bundle="${BASH_REMATCH[1]}"
else
  bundle=""
fi
[[ -n "$bundle" ]] || fail "Could not identify the production JavaScript bundle"
check_200 "${SITE_URL}/_expo/static/js/web/${bundle}"
live_index="$(curl --proto '=https' --tlsv1.2 --fail --silent --show-error --max-time 30 "${SITE_URL}/?deploy=${deployed_commit}")"
[[ "$live_index" == *"$bundle"* ]] || fail "Live HTML does not reference the deployed bundle"
changelog_html="$(curl --proto '=https' --tlsv1.2 --fail --silent --show-error --max-time 30 "${SITE_URL}/changelog?deploy=${deployed_commit}")"
[[ "$changelog_html" == *'2026-07-24'* ]] || fail "Changelog release marker is missing"

succeeded=1
log "Deployment successful"
log "Commit: $deployed_commit"
log "Bundle: $bundle"
log "Backup: $backup"
log "Live: $SITE_URL"
