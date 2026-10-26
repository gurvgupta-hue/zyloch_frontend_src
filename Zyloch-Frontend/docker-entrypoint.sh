#!/bin/sh
set -e
# NEXT_PUBLIC_* vars are baked as placeholder strings at build time.
# Real values arrive via envFrom (K8s Secret zyloch-frontend-secrets),
# which is populated from OpenBao by External Secrets Operator.
# This script replaces the placeholders with those values before the app starts.

NEXT_PUBLIC_VARS="
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_GITHUB_APP_URL
NEXT_PUBLIC_FRONTEND_URL
"

echo "Injecting NEXT_PUBLIC_ env vars into compiled bundle..."

for var in $NEXT_PUBLIC_VARS; do
  placeholder="__${var}__"
  value=$(eval echo "\$$var")

  if [ -n "$value" ] && [ "$value" != "$placeholder" ]; then
    find /app/.next -type f -name "*.js" \
      -exec sed -i "s|${placeholder}|${value}|g" {} \;
    echo "   ${var}"
  else
    echo "   ${var} not set — placeholder left in bundle"
  fi
done
echo "Starting Next.js..."
exec "$@"
