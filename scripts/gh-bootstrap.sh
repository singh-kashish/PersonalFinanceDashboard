#!/usr/bin/env bash
# Bootstrap GitHub labels, milestones, issues and merge settings for Flo.
# Run once from the repo root after `gh auth login`. Safe to re-run (idempotent).
#
#   ./scripts/gh-bootstrap.sh                      labels, milestones, issues, merge settings
#   ./scripts/gh-bootstrap.sh --protect server,web also protect main (do this AFTER CI exists;
#                                                  the names must match your CI job names)
#
# Note: branch protection on private repos needs a paid GitHub plan; on public repos it is free.
set -euo pipefail

command -v gh >/dev/null || { echo "Install GitHub CLI first: brew install gh"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Run: gh auth login"; exit 1; }

REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
echo "Bootstrapping $REPO"

# ---------- labels ----------
label() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null; }

label "type: feat"      "0E8A16" "New functionality"
label "type: fix"       "D73A4A" "Bug fix"
label "type: chore"     "CFD3D7" "Tooling, config, maintenance"
label "type: test"      "FBCA04" "Tests only"
label "type: docs"      "0075CA" "Documentation"
label "type: refactor"  "A2EEEF" "Code change with no behavior change"
label "type: security"  "B60205" "Security hardening or tests"
label "area: server"    "5319E7" "Express / Prisma API"
label "area: web"       "1D76DB" "React frontend"
label "area: db"        "006B75" "Schema and migrations"
label "area: infra"     "BFDADC" "Docker, CI, deploy"
label "area: e2e"       "C5DEF5" "Playwright end-to-end"
label "status: in-progress"       "FEF2C0" "Someone is working on this now"
label "status: needs-review"      "F9D0C4" "PR open, waiting for human review"
label "status: blocked"           "000000" "Waiting on another issue or decision"
label "agent-generated" "EDEDED" "PR produced by the coding agent"
label "type: decision"  "7057FF" "Architecture or design decision (ADR)"
label "status: needs-decision" "D93F0B" "Waiting for the owner to choose an option"
label "area: design"    "F9A8D4" "Screen design, fit report, UI review"
label "priority: p1"    "B60205" "Do first"
label "priority: p2"    "FBCA04" "Do next"

# ---------- milestones ----------
milestone() {
  if ! gh api "repos/$REPO/milestones?state=all&per_page=100" --jq '.[].title' | grep -Fxq "$1"; then
    gh api "repos/$REPO/milestones" -f title="$1" -f description="$2" >/dev/null
  fi
}
milestone "M1 Foundation"       "Infra, CI, bug fixes, money, security, web tooling"
milestone "M2 Transactions"     "Transactions UI, forms, e2e tests"
milestone "M3 Polish and deploy" "Dashboard, analytics, settings, deploy, docs"
milestone "M4 Workspaces"       "Multi-tenancy, RBAC, invitations"

# ---------- issues ----------
EXISTING="$(gh issue list --state all --limit 500 --json title --jq '.[].title')"

issue() { # title | labels | milestone | depends-on text
  local title="$1" labels="$2" milestone="$3" deps="$4"
  if grep -Fxq "$title" <<<"$EXISTING"; then echo "exists: $title"; return; fi
  local n="${title%%:*}"; n="${n#P}"
  gh issue create --title "$title" --label "$labels" --milestone "$milestone" --body "$(cat <<EOF
Spec: **Prompt $n** in \`docs/PROMPTS.md\`.

Depends on: $deps

### Acceptance criteria
- [ ] Failing tests written first and committed before the implementation
- [ ] Typecheck, lint and all relevant test suites pass
- [ ] No unrelated changes in the diff
- [ ] PR opened with \`Closes #<this issue>\` and reviewed by a human
EOF
)" >/dev/null
  echo "created: $title"
}

issue "P1: Local infrastructure and test harness"      "type: chore,area: infra,priority: p1"        "M1 Foundation"        "nothing"
issue "P2: CI pipeline"                                "type: chore,area: infra,priority: p1"        "M1 Foundation"        "P1"
issue "P3: Backend bug fixes"                          "type: fix,area: server,priority: p1"         "M1 Foundation"        "P1"
issue "P4: Money module"                               "type: feat,area: server,priority: p1"        "M1 Foundation"        "P1"
issue "P5: Decimal(19,2) migration and input validation" "type: feat,area: db,area: server,priority: p1" "M1 Foundation"     "P4"
issue "P6: Analytics refactor to money module"         "type: refactor,area: server,priority: p1"    "M1 Foundation"        "P4, P5"
issue "P7: Security hardening and security test suite" "type: security,area: server,priority: p1"    "M1 Foundation"        "P3"
issue "P8: Web tooling and cleanup"                    "type: chore,area: web,priority: p1"          "M1 Foundation"        "P1"
issue "P9: Transactions API layer and hooks"           "type: feat,area: web,priority: p2"           "M2 Transactions"      "P6, P8"
issue "P10: Transactions page"                         "type: feat,area: web,priority: p2"           "M2 Transactions"      "P9"
issue "P11: Add, edit and delete flows"                "type: feat,area: web,priority: p2"           "M2 Transactions"      "P10"
issue "P12: End-to-end tests with Playwright"          "type: test,area: e2e,priority: p2"           "M2 Transactions"      "P11"
issue "P13: Dashboard, Analytics and Settings pages"   "type: feat,area: web,priority: p2"           "M3 Polish and deploy" "P12"
issue "P14: Deploy and portfolio polish"               "type: chore,area: infra,priority: p2"        "M3 Polish and deploy" "P13"
issue "P15: Workspaces and RBAC"                       "type: feat,area: server,area: web,area: db"  "M4 Workspaces"        "P1-P14"

# ---------- merge settings: squash only, auto-delete merged branches ----------
gh repo edit "$REPO" \
  --enable-squash-merge \
  --enable-merge-commit=false \
  --enable-rebase-merge=false \
  --delete-branch-on-merge >/dev/null
echo "merge settings: squash only, merged branches auto-deleted"

# ---------- optional: protect main ----------
if [[ "${1:-}" == "--protect" ]]; then
  CHECKS="${2:?usage: --protect job1,job2 (names of your CI jobs)}"
  ctx="$(printf '"%s",' ${CHECKS//,/ })"; ctx="[${ctx%,}]"
  gh api -X PUT "repos/$REPO/branches/main/protection" --input - >/dev/null <<JSON
{
  "required_status_checks": { "strict": true, "contexts": $ctx },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
  echo "main protected: PR required, checks $ctx must pass, no force pushes"
fi

echo "Done. See: gh issue list --milestone \"M1 Foundation\""
