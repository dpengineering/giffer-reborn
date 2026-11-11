#!/usr/bin/env bash
# Stamp a new version onto every local script and stylesheet in index.html, e.g.
#   <script src="js/main.js?v=2026.11.10-1530">
# so students' browsers download the new files instead of using cached old ones.
#
# Run this before committing/pushing any change to js/ or css/:
#   bash deploy/bump-version.sh
#
# main.js passes the same ?v= on to the interpreter worker (JSCPP-WebWorker.js),
# which passes it on to the scripts it loads, so this one stamp covers everything.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

VERSION="${1:-$(date +%Y.%m.%d-%H%M)}"

python3 - "$VERSION" <<'PY'
import re, sys
version = sys.argv[1]
path = "index.html"
html = open(path, encoding="utf-8").read()
# Local js/ and css/ references only (CDN links are left alone); replaces any old ?v=.
pattern = re.compile(r'((?:src|href)="(?:js|css)/[^"?]+)(?:\?v=[^"]*)?"')
html, count = pattern.subn(lambda m: m.group(1) + "?v=" + version + '"', html)
open(path, "w", encoding="utf-8").write(html)
print("Stamped %d files in index.html with ?v=%s" % (count, version))
PY
