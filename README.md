# gitlab-by-altf1be

OpenClaw skill for GitLab — scaffolded toward full CRUD via GitLab REST API v4.

## Status

Scaffolded and ready for review.

## Structure

- `SKILL.md`
- `package.json`
- `.env.example`
- `_meta.json`
- `scripts/gitlab.mjs`
- `docs/`
- `references/`

## Auth

Environment variables:

- `GITLAB_HOST`
- `GITLAB_TOKEN`
- optional: `GITLAB_PROJECT`, `GITLAB_GROUP`, `GITLAB_MAX_RESULTS`

## API Target

- GitLab REST API v4
- Default host example: `https://gitlab.com/api/v4`
