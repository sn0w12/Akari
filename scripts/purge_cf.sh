#!/bin/sh
set -eu

if [ -z "${ZONE_ID:-}" ] || [ -z "${CF_API_TOKEN:-}" ]; then
  echo "Missing ZONE_ID or CF_API_TOKEN"
  exit 1
fi

curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"tags":["page"]}'
