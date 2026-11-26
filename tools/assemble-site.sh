#!/bin/sh
# Copies only the public website into _site. Everything else in this
# repository (docs, review scripts, marketing sources, demo sources, agent
# instructions) stays in Git and is never published on langspan.dev.
set -eu
out=${1:-_site}
rm -rf "$out"
mkdir -p "$out"
for file in index.html 404.html robots.txt sitemap.xml CNAME; do
  cp "$file" "$out/$file"
done
cp -R assets "$out/assets"
# Fail if anything outside the allowlist slipped in.
unexpected=$(cd "$out" && find . -type f ! -path './assets/*' ! -name index.html ! -name 404.html ! -name robots.txt ! -name sitemap.xml ! -name CNAME)
if [ -n "$unexpected" ]; then
  echo "Unexpected files in $out: $unexpected" >&2
  exit 1
fi
# Every local file the pages reference must be present.
missing=0
for page in "$out/index.html" "$out/404.html"; do
  for ref in $(grep -oE '(src|href|poster)="[^"#:]+"' "$page" | sed -E 's/^[a-z]+="//; s/"$//; s/\?.*$//; s|^/||'); do
    if [ ! -e "$out/$ref" ]; then
      echo "Missing $ref (referenced by $(basename "$page"))" >&2
      missing=1
    fi
  done
done
[ "$missing" -eq 0 ]
echo "Assembled $(find "$out" -type f | wc -l | tr -d ' ') files in $out"
