#!/usr/bin/env bash
#
# finish-cleanup.sh
#
# Publishes the cleaned, rewritten history to main, removes the stale branches
# that still carry the old history, and enables the CI pipeline.
#
# Run this from your own machine, signed in as santoshkumarvvv. The sandbox
# automation could not do it: its GitHub App reports
#   {"admin":false,"maintain":false,"push":false}
# and has no `workflows` permission scope.
#
#   chmod +x finish-cleanup.sh
#   ./finish-cleanup.sh
#
set -euo pipefail

BRANCH="arena/019fb239-search-hub"
REMOTE="origin"

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }

confirm() {
  local prompt="$1" ans
  read -r -p "    $prompt [yes/no]: " ans
  [ "$ans" = "yes" ]
}

command -v git >/dev/null || { red "git not found"; exit 1; }

bold "==> 1/6  Fetching the cleaned branch"
git fetch "$REMOTE" "$BRANCH"
green "    fetched $(git rev-parse --short "$REMOTE/$BRANCH")"

bold "==> 2/6  Verifying the history is clean"
DIRTY=0
while read -r c; do
  if git log -1 --format='%B%n%an %ae%n%cn %ce' "$c" | grep -qi arena; then
    red "    arena reference still present in $c"
    DIRTY=1
  fi
done < <(git rev-list "$REMOTE/$BRANCH")

if [ "$DIRTY" -ne 0 ]; then
  red "Aborting: history is not clean. Nothing was changed."
  exit 1
fi
green "    clean - $(git rev-list --count "$REMOTE/$BRANCH") commits, no arena references"

bold "==> 3/6  Pointing main at the cleaned history"
echo "    remote main is now : $(git rev-parse --short "$REMOTE/main" 2>/dev/null || echo unknown)"
echo "    it will become     : $(git rev-parse --short "$REMOTE/$BRANCH")"
echo
yellow "    This force-pushes main. Old commit SHAs are replaced permanently."
if confirm "Force-push main?"; then
  git checkout -B main "$REMOTE/$BRANCH"
  git push --force "$REMOTE" main
  green "    main updated"
else
  red "Aborted before any change was pushed."
  exit 1
fi

bold "==> 4/6  Enabling the deploy workflow"
if [ -f .github/deploy.workflow.yml ]; then
  mkdir -p .github/workflows
  git mv .github/deploy.workflow.yml .github/workflows/deploy.yml
  git commit -q -m "ci: enable deploy workflow"
  if git push "$REMOTE" main; then
    green "    workflow enabled"
  else
    red   "    push rejected."
    yellow "    Your account needs the 'workflow' scope. Fix with:"
    echo  "      gh auth refresh -h github.com -s workflow"
    echo  "      git push $REMOTE main"
  fi
else
  echo "    already enabled, skipping"
fi

bold "==> 5/6  Deleting stale branches that carry the old history"
mapfile -t STALE < <(
  git ls-remote --heads "$REMOTE" 'refs/heads/arena/*' \
    | cut -f2 | sed 's|refs/heads/||' | grep -v "^${BRANCH}$" || true
)

if [ "${#STALE[@]}" -eq 0 ]; then
  echo "    none found"
else
  printf '    %s\n' "${STALE[@]}"
  echo
  yellow "    ${#STALE[@]} branches still contain the un-rewritten history."
  if confirm "Delete all of them?"; then
    for b in "${STALE[@]}"; do
      git push "$REMOTE" --delete "$b" && green "    deleted $b" || red "    failed $b"
    done
  else
    echo "    skipped"
  fi
fi

bold "==> 6/6  Done"
cat <<'EOF'

Remaining manual steps
----------------------

1. Settings -> Pages
   Set  Source = GitHub Actions

2. Old pull requests still show the old branch names in their titles and
   metadata. Git history rewriting cannot touch them - they live in GitHub's
   database, not in the repo. To remove them entirely you must either:

     - delete the repository and push the cleaned history to a fresh one, or
     - leave them; they are only visible under the "Pull requests -> Closed" tab

   Check them here:
     https://github.com/santoshkumarvvv/search-hub-/pulls?q=is%3Apr

3. Verify the result:
     git log --format='%an <%ae> %s' | grep -i arena     # expect no output

Live site: https://santoshkumarvvv.github.io/search-hub-/
EOF
