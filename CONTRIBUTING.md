# Contributing to Slotify

Welcome to the Slotify contributor guide. To ensure long-term maintainability and high code quality, please adhere strictly to the following workflows.

## 1. Strict Development Workflow & Feature Mandate

### The Mandatory `exampleSite` Requirement
1. **Develop inside `exampleSite`**: All changes MUST be tested by running the Hugo server against the `exampleSite` directory (`cd exampleSite && hugo server --themesDir ../..`). Committing theme changes without local verification against `exampleSite` is STRICTLY PROHIBITED.
2. **Dummy Data Integration**: All dummy data, mock content, and placeholder configuration used for local development and testing **MUST** be placed entirely within the `exampleSite` directory. Leaving mock data in the root theme folder is PROHIBITED.
3. **Feature Development Mandate**: Any new features, UI components, HTML blocks, or Markdown rendering logic **MUST** be demonstrated in the showcase post `exampleSite/content/posts/showcase/index.md` (and, for slot/event features, a matching override under `exampleSite/layouts/partials/slots/`). View-level or SPA-routing behaviors that cannot be demonstrated in Markdown content (such as search keyword highlighting) MUST be covered by Playwright end-to-end tests under `tests/`.
4. **Living Documentation**: The `showcase/index.md` post serves as the definitive "living documentation" and baseline test for the theme. If a feature is not demonstrated there (or covered by automated tests for view-level behaviors), the development is considered INCOMPLETE.

### Release-Centric Branching & Integration
- **Integration Branch (`release/<version>`)**: Slotify adopts a release-centric integration workflow. Active development occurs on feature branches branched off from and targeting the current release branch (e.g., `release/0.2.1`).
- **Release-Only `main` Branch**: The `main` branch follows a strict **"release only"** policy. Direct commits and micro-commits to `main` are strictly prohibited.
- **PR Squash Commit Standard (No Sequence Suffix)**:
  - When squash-merging a feature PR into `release/<version>`, the commit subject MUST follow the Conventional Commits format and MUST NOT include GitHub's auto-generated sequence suffix (e.g., strip `(#14)`).
  - The commit body MUST detail the implementation rationale and technical context (wrapped at 72 characters).
  - The PR tracking URL MUST be placed at the bottom of the body in the format: `Ref: https://github.com/tacticaldoll/slotify/pull/<N>`.
- **Version Bump Protocol**:
  - Individual feature PRs MUST NOT bump the version.
  - Version bumping across `package.json`, `package-lock.json`, `hugo.toml`, and `CHANGELOG.md` is executed as the single final commit on `release/<version>` once all planned PRs have been reviewed and merged.
- **Release Merge into `main`**:
  - Merging `release/<version>` into `main` is performed as a single, body-less release commit formatted as `chore(release): <version>`, tagged with `v<version>`.

### Commit Log Standard (Conventional Commits)
All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. A non-compliant commit message is grounds for rejection at code review.

**Format:**
```text
<type>(<scope>): <short description in imperative mood>

[optional body: what and why, not how]
```

**Allowed types:**
| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible behaviour change |
| `fix` | Bug fix |
| `refactor` | Code restructure with no behaviour change |
| `docs` | Changes to documentation or code comments only |
| `style` | Formatting, line endings, whitespace — no logic change |
| `chore` | Tooling, scripts, CI config, `.gitignore`, hooks |
| `test` | Adding or updating tests |

**Rules:**
- Description MUST be in **imperative mood** (e.g., `feat: add Disqus`, not `added Disqus`)
- Description MUST NOT end with a period
- Body lines MUST wrap at 72 characters

## 2. Quality Verification Workflow

Slotify's quality gate is intentionally lightweight and build-step free. Before committing changes to theme code, Hugo templates, governance files, or bundled assets, maintainers MUST run the checks below from the theme root:

```powershell
hugo --source exampleSite --themesDir ..\.. --theme slotify --destination public
python exampleSite\validate.py
python exampleSite\deep_validate.py
```

Expected results:
1. `hugo` MUST complete without warnings or errors that affect generated pages, JSON endpoints, or static assets.
2. `validate.py` MUST report `JSON VALID` and a non-zero post count for the example site.
3. `deep_validate.py` MUST confirm that `exampleSite/public/index.json` and `exampleSite/public/posts/index.json` are valid JSON.

## 3. AI Operational Ethics (Guideline-Driven Autonomy)

To ensure high development velocity while preventing architectural drift, AI agents are empowered with guarded autonomy through the Antigravity 2.0 Governance Protocol:
1. **Default to Action (GDD)**: For UI refinements, CSS tweaks, bug fixes, and non-structural feature additions, agents SHOULD directly implement and test the changes based on Knowledge Items (KIs) boundaries.
2. **Architectural Escalation**: Any change that modifies the SPA router, external dependencies (`vendor.json`), or fundamental content rendering (`single.json`) MUST immediately halt and escalate to an explicit user approval loop.
3. **Automated Audit**: Agents MUST proactively use provided tools (like `/audit-codebase` or `verify-vendor`) after their changes to guarantee compliance.

For deep architectural guidelines (e.g., SOLID, Fixed-Viewport Model, Raw-Vue Lifecycle Ordering), please consult the Knowledge Items (KIs) provided in the agent's persistent memory.
