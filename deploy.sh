#!/usr/bin/env bash
# Usage: ./deploy.sh
# Pulls origin/main, runs all quality gates, atomically deploys to Caddy,
# verifies production, and restores the previous release on failure.
set -Eeuo pipefail
readonly PATH="/home/ubuntu/.volta/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export PATH
unset CDPATH GIT_DIR GIT_WORK_TREE

readonly REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
readonly EXPECTED_REPO_ROOT="/home/ubuntu/efektif/efektif-quran"
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

for command in pnpm curl date diff find flock git python3 rsync stat sudo; do
  command -v "$command" >/dev/null 2>&1 || fail "Required command not found: $command"
done

[[ "$WEB_ROOT" == "$EXPECTED_WEB_ROOT" ]] || fail "Refusing unexpected web root: $WEB_ROOT"
[[ "$SITE_URL" == "https://quran.efektif.app" ]] || fail "Refusing unexpected site URL: $SITE_URL"
[[ "$REPO_ROOT" == "$EXPECTED_REPO_ROOT" ]] || fail "Refusing unexpected repository path: $REPO_ROOT"
[[ -d "$REPO_ROOT/.git" ]] || fail "Not a Git repository: $REPO_ROOT"
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

log "Installing Quran dependencies"
[[ ! -e node_modules || (-d node_modules && ! -L node_modules) ]] || fail "node_modules must be a real directory"
rm -rf -- node_modules
pnpm install --frozen-lockfile

compgen -G '.env*.local' >/dev/null && fail "Local environment files are not allowed during deployment"
rm -rf -- .next out test-results

log "Running quality gates"
pnpm lint
pnpm exec tsc --noEmit
pnpm test:unit
pnpm test:integration
CI=1 pnpm test:e2e
rm -rf -- test-results
[[ -z "$(git status --porcelain)" ]] || fail "Quality gates modified tracked or untracked files"
[[ "$(git rev-parse HEAD)" == "$deployed_commit" ]] || fail "Quran HEAD changed during quality gates"

log "Building static Next.js export"
rm -rf -- out
pnpm build
[[ -z "$(git status --porcelain)" ]] || fail "Build modified tracked or untracked files"
[[ "$(git rev-parse HEAD)" == "$deployed_commit" ]] || fail "Quran HEAD changed during build"
for required in out/index.html out/surah/1/index.html out/juz/30/index.html out/sholat/index.html out/changelog/index.html out/manifest.webmanifest out/sw.js out/data/surah/1.json out/data/search-index.json out/data/juz-map.json; do
  [[ -s "$required" ]] || fail "Required export is missing or empty: $required"
done
[[ -z "$(find out -type l -print -quit)" ]] || fail "Export contains a symbolic link"
[[ -z "$(find out ! -type f ! -type d -print -quit)" ]] || fail "Export contains a special file"

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
/usr/bin/sudo /usr/bin/rsync -rt --delete --chown=root:root --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r -- out/ "$release"/

[[ -z "$(/usr/bin/sudo /usr/bin/find "$release" -type l -print -quit)" ]] || fail "Staged release contains a symbolic link"
[[ -z "$(/usr/bin/sudo /usr/bin/find "$release" ! -type f ! -type d -print -quit)" ]] || fail "Staged release contains a special file"
diff -qr -- out "$release" >/dev/null || fail "Staged release differs from out"
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

if ! diff -qr -- out "$WEB_ROOT" >/dev/null; then
  fail "Deployed files differ from out"
fi

log "Running production smoke checks"
check_200() {
  local url="$1"
  local code
  code="$(curl --proto '=https' --tlsv1.2 --silent --show-error --max-time 30 --output /dev/null --write-out '%{http_code}' "$url")"
  [[ "$code" == "200" ]] || fail "Expected HTTP 200 from $url, got $code"
}

for path in / /surah/1/ /juz/30/ /sholat/ /changelog/; do
  check_200 "${SITE_URL}${path}?deploy=${deployed_commit}"
done

index_html="$(<out/index.html)"
if [[ "$index_html" =~ (/_next/static/chunks/[a-zA-Z0-9_-]+\.js) ]]; then
  bundle="${BASH_REMATCH[1]}"
else
  bundle=""
fi
[[ -n "$bundle" ]] || fail "Could not identify a production JavaScript chunk"
check_200 "${SITE_URL}${bundle}"
live_index="$(curl --proto '=https' --tlsv1.2 --fail --silent --show-error --max-time 30 "${SITE_URL}/?deploy=${deployed_commit}")"
[[ "$live_index" == *"$bundle"* ]] || fail "Live HTML does not reference the deployed chunk"
changelog_html="$(curl --proto '=https' --tlsv1.2 --fail --silent --show-error --max-time 30 "${SITE_URL}/changelog?deploy=${deployed_commit}")"
[[ "$changelog_html" == *'2026-07-24'* ]] || fail "Changelog release marker is missing"

succeeded=1
log "Deployment successful"
log "Commit: $deployed_commit"
log "Bundle: $bundle"
log "Backup: $backup"
log "Live: $SITE_URL"
