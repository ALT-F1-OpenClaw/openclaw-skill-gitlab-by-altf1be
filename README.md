# gitlab-by-altf1be

OpenClaw skill for GitLab with full CRUD operations, pipelines, merge requests, issues, and repository automation via GitLab REST API v4.

By [Abdelkrim BOUJRAF](https://www.alt-f1.be) / ALT-F1 SRL, Brussels 🇧🇪 🇲🇦

- [Features](#features)
- [Quick Start](#quick-start)
- [Setup](#setup)
- [Commands](#commands)
- [Security](#security)
- [API Coverage](#api-coverage)
- [ClawHub](#clawhub)
- [License](#license)
- [Author](#author)
- [Contributing](#contributing)

## Features

- Projects — list visible projects, list owned projects, resolve project context
- Auth Check — validate GitLab host and token through current-user lookup
- GitLab API v4 — target GitLab.com and self-hosted GitLab instances
- Full-Coverage Scaffold — command groups laid out for future endpoint expansion
- Documentation — granted credentials and token-boundary troubleshooting notes
- Security — `.env` ignored, no secret values stored in docs, review-first workflow

## Quick Start

```bash
# 1. Clone
git clone https://github.com/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be.git
cd openclaw-skill-gitlab-by-altf1be

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Edit .env with your GitLab credentials

# 4. Use
node scripts/gitlab.mjs user-get-current
node scripts/gitlab.mjs project-list --owned --per-page 20
node scripts/gitlab.mjs project-get --project group/subgroup/project
```

## Setup

- Get a GitLab personal access token or fine-grained personal access token.
- Copy `.env.example` to `.env` and fill in:

```bash
GITLAB_HOST=https://gitlab.com
GITLAB_TOKEN=glpat-...
GITLAB_PROJECT=
GITLAB_GROUP=
GITLAB_MAX_RESULTS=50
```

- Run `npm install`

### Requirements

- Node.js >= 18
- GitLab account with API access
- GitLab token with the required project/user permissions

See [SKILL.md](./SKILL.md) for skill-facing usage notes.

## Commands

Currently implemented:

- `user-get-current`
- `project-list`
- `project-get`

Scaffolded command groups include:

- projects
- groups
- users
- issues
- merge requests
- pipelines
- jobs
- repository files
- branches
- tags
- commits
- webhooks
- releases
- environments
- runners
- snippets
- search

Examples:

```bash
node scripts/gitlab.mjs user-get-current
node scripts/gitlab.mjs project-list --owned --per-page 100
node scripts/gitlab.mjs project-list --search openproject
node scripts/gitlab.mjs project-get --project 18403045
node scripts/gitlab.mjs project-get --project AbdelkrimB/data_visualization
```

Once installed as a skill, you can use natural language such as:

- "List my GitLab projects"
- "Show my owned GitLab repositories"
- "Check whether this token can access my projects"
- "Get project details for AbdelkrimB/data_visualization"

## Security

- GitLab credentials are loaded from environment variables
- `.env` is ignored by git
- No secret token values are stored in committed docs
- Token-boundary troubleshooting is documented explicitly
- The workflow currently favors safe read-first validation before broad write automation

## API Coverage

See [docs/API-COVERAGE.md](./docs/API-COVERAGE.md) for the current coverage map.

Additional credential and permission notes:

- [docs/GRANTED-CREDENTIALS.md](./docs/GRANTED-CREDENTIALS.md)

## ClawHub

Planned publish target:

- `gitlab-by-altf1be`

Example install flow:

```bash
clawhub install gitlab-by-altf1be
```

## License

MIT — see [LICENSE](https://opensource.org/licenses/MIT)

## Author

Abdelkrim BOUJRAF — [ALT-F1 SRL](https://www.alt-f1.be), Brussels 🇧🇪 🇲🇦

- GitHub: [@abdelkrim](https://github.com/abdelkrim)
- X: [@altf1be](https://x.com/altf1be)

## Contributing

Contributions welcome. Open an issue or PR.
