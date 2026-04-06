---
name: gitlab-by-altf1be
description: "GitLab skill — full CRUD via GitLab REST API v4 with OpenClaw-friendly CLI conventions."
homepage: https://github.com/ALT-F1-OpenClaw/openclaw-skill-gitlab-by-altf1be
metadata:
  {"openclaw": {"emoji": "🦊", "requires": {"env": ["GITLAB_HOST", "GITLAB_TOKEN"]}, "optional": {"env": ["GITLAB_PROJECT", "GITLAB_GROUP", "GITLAB_MAX_RESULTS"]}, "primaryEnv": "GITLAB_HOST"}}
---

# GitLab by @altf1be

Full-coverage GitLab skill scaffold targeting **GitLab REST API v4**.

## Setup

1. Create a GitLab token with the scopes you need.
2. Set environment variables (or create `.env` in `{baseDir}`):

```bash
GITLAB_HOST=https://gitlab.com
GITLAB_TOKEN=glpat-your-token
GITLAB_PROJECT=
GITLAB_GROUP=
GITLAB_MAX_RESULTS=50
```

3. Install dependencies:

```bash
cd {baseDir} && npm install
```

## Current Scaffold

This initial scaffold includes:
- package metadata
- environment template
- CLI entrypoint
- full-coverage command-group skeleton
- docs/references placeholders

## Planned API Groups

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
- runners
- environments
- releases
- snippets
- search

## Notes

- Base API URL: `${GITLAB_HOST}/api/v4`
- Auth header will use: `PRIVATE-TOKEN: ${GITLAB_TOKEN}`
- This scaffold is intentionally review-first before deep endpoint implementation.
