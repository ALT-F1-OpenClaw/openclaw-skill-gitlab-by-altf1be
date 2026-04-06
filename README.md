# gitlab-by-altf1be

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![ClawHub](https://img.shields.io/badge/ClawHub-gitlab--by--altf1be-blueviolet)](https://clawhub.ai/skills/gitlab-by-altf1be)
[![GitHub commits](https://img.shields.io/github/commit-activity/m/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be)](https://github.com/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be)](https://github.com/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be/issues)
[![GitHub stars](https://img.shields.io/github/stars/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be?style=social)](https://github.com/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be/stargazers)

OpenClaw skill for GitLab with broad GitLab REST API v4 coverage for project discovery, groups, issues, merge requests, CI/CD, repository reads, and selected write operations.

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

- Projects and Groups — list and inspect visible projects/groups
- Issues and Merge Requests — list and inspect common review/work items
- CI/CD — pipelines, jobs, environments, and runner discovery
- Repository Access — branches, tags, commits, repository files, releases, and snippets
- Webhooks and Search — list/create project hooks and search API scopes
- Auth Check — validate GitLab host and token through current-user lookup
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
node scripts/gitlab.mjs group-list --search platform
node scripts/gitlab.mjs mr-list --project group/subgroup/project --state opened
node scripts/gitlab.mjs pipeline-list --project group/subgroup/project --ref main
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

Implemented commands:

- `user-get-current`
- `project-list`
- `project-get`
- `group-list`
- `group-get`
- `issue-list`
- `issue-get`
- `mr-list`
- `mr-get`
- `pipeline-list`
- `pipeline-get`
- `job-list`
- `file-get`
- `file-create`
- `branch-list`
- `branch-get`
- `tag-list`
- `tag-get`
- `commit-list`
- `commit-get`
- `webhook-list`
- `webhook-create`
- `release-list`
- `release-get`
- `environment-list`
- `runner-list`
- `snippet-list`
- `snippet-get`
- `search`

Still incomplete:

- broader CRUD beyond `file-create` and `webhook-create`
- merge request notes/discussions
- issue and merge request mutation flows
- pipeline/job control actions
- repository file update/delete
- release/snippet create/update/delete

Examples:

```bash
node scripts/gitlab.mjs user-get-current
node scripts/gitlab.mjs project-list --owned --per-page 100
node scripts/gitlab.mjs project-list --search openproject
node scripts/gitlab.mjs project-get --project 18403045
node scripts/gitlab.mjs project-get --project AbdelkrimB/data_visualization
node scripts/gitlab.mjs issue-list --project group/subgroup/project --state opened --labels bug
node scripts/gitlab.mjs mr-get --project group/subgroup/project --mr 42
node scripts/gitlab.mjs file-get --project group/subgroup/project --path package.json --ref main
node scripts/gitlab.mjs file-create --project group/subgroup/project --path docs/example.txt --branch main --content "hello" --commit-message "docs: add example"
node scripts/gitlab.mjs branch-get --project group/subgroup/project --branch main
node scripts/gitlab.mjs commit-get --project group/subgroup/project --sha 0123456789abcdef
node scripts/gitlab.mjs release-get --project group/subgroup/project --tag v1.2.3
node scripts/gitlab.mjs webhook-list --project group/subgroup/project
node scripts/gitlab.mjs webhook-create --project group/subgroup/project --url https://example.com/hook --push-events
node scripts/gitlab.mjs snippet-get --project group/subgroup/project --snippet 7
node scripts/gitlab.mjs search --project group/subgroup/project --scope blobs --query pipeline
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
- Avoid passing sensitive values such as webhook secrets through shared shell history when possible

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
