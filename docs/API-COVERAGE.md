# API Coverage

Status: partial implementation with broad read coverage plus selected write operations.

Implemented command groups:

- auth / current user
  - `user-get-current`
- projects
  - `project-list`
  - `project-get`
- groups
  - `group-list`
  - `group-get`
- issues
  - `issue-list`
  - `issue-get`
- merge requests
  - `mr-list`
  - `mr-get`
- pipelines
  - `pipeline-list`
  - `pipeline-get`
- jobs
  - `job-list`
- repository files
  - `file-get`
  - `file-create`
- branches
  - `branch-list`
  - `branch-get`
- tags
  - `tag-list`
  - `tag-get`
- commits
  - `commit-list`
  - `commit-get`
- webhooks
  - `webhook-list`
  - `webhook-create`
- releases
  - `release-list`
  - `release-get`
- environments
  - `environment-list`
- runners
  - `runner-list`
- search
  - `search`
- snippets
  - `snippet-list`
  - `snippet-get`

Known limitations and token-boundary notes:

- `runner-list` supports both instance and project forms, but instance-level runner listing may require elevated/admin permissions on the GitLab host.
- `webhook-create` is implemented, but successful execution depends on project maintainer/owner privileges and any host-level outbound webhook restrictions.
- `file-create` is implemented for create-only flows. Update/delete variants remain unimplemented for this run.
- Search coverage follows GitLab REST API search scopes and may vary by project/group permissions and host edition.
- Snippet coverage currently focuses on list operations only.

Deferred command families for later milestones:

- issue create/update/close flows
- merge request create/update/merge flows
- discussions/notes
- pipeline trigger/retry/cancel flows
- job retry/play/trace flows
- repository file update/delete
- release create/update/delete
- snippet create/update/delete
