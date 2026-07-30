#!/usr/bin/env bash
#
# finish-cleanup.sh
#
# Publishes the cleaned, rewritten history to main and enables the CI pipeline.
#
# Run this from your own machine, signed in as santoshkumarvvv. The sandbox
# automation could not do it: its GitHub App has no push access to main and no
# `workflows` permission scope.
#
#   chmod +x finish-cleanup.sh
#   ./finish-cleanup.sh
#
set -euo pipefail

BRANCH="arena/019fb239-search-hub"
REMOTE="origin"

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }

bold "==> 1/5  Fetching the cleaned branch"
git fetch "$REMOTE" "$BRANCH"

bold "==> 2/5  Verifying the history is clean"
DIRTY=0
while read -r c; do
  if git log -1 --format='%B%n%an %ae%n%cn %ce' "$c" | grep -qi arena; then
    red "    arena reference still present in $c"
    DIRTY=1
  fi
done < <(git rev-list "$REMOTE/$BRANCH")

if [ "$DIRTY" -ne 0 ]; then
  red "Aborting: history is not clean."
  exit 1
fi
green "    clean - no arena references in any commit"

bold "==> 3/5  Pointing main at the cleaned history"
git checkout -B main "$REMOTE/$BRANCH"

echo
red "    This force-pushes main. Old commit SHAs will be replaced."
read -r -p "    Type 'yes' to continue: " ok
[ "$ok" = "yes" ] || { red "Aborted."; exit 1; }

git push --force "$REMOTE" main
green "    main updated"

bold "==> 4/5  Enabling the deploy workflow"
if [ -f .github/deploy.workflow.yml ]; then
  mkdir -p .github/workflows
  git mv .github/deploy.workflow.yml .github/workflows/deploy.yml
  git commit -q -m "ci: enable deploy workflow"
  git push "$REMOTE" main
  green "    workflow enabled"
else
  echo "    already enabled, skipping"
fi

bold "==> 5/5  Done"
cat <<'EOF'

Remaining manual step
---------------------
Open  Settings -> Pages  and set  Source = GitHub Actions

Then delete the stale branches that still carry the old history:

  Settings -> Branches, or:
  for b in $(git ls-remote --heads origin 'arena/*' | cut -f2 | sed 's|refs/heads/||'); do
    [ "$b" = "arena/019fb239-search-hub" ] || git push origin --delete "$b"
  done

Live site: https://santoshkumarvvv.github.io/search-hub-/
EOF
