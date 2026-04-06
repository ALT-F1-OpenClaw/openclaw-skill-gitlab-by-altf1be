# Granted GitLab Credentials

This file documents the **fine-grained GitLab personal access token** configuration granted for the GitLab skill.

## Token Metadata

- **Purpose / name:** `openclaw-skill-gitlab-2026-04-06`
- **Description:** `my projects only`
- **Host:** `https://gitlab.com`
- **Access scope:** **Only my personal projects**
- **Expiration date:** `2027-04-06`
- **Token value:** not stored in this file

## Notes

- This documentation records the **granted permissions**, not the secret token itself.
- The token itself should be stored only in local secret storage such as `.env`.
- Screenshots indicate a broad, near-full-CRUD configuration for project-scoped GitLab automation.

## Granted Resource Permissions

Below is the permission set visible in the provided screenshots.

### Wiki
- **Markdown Upload** → `Create, Read`
- **Wiki** → `Create, Read, Update`

### System Migration and Integration
- **Webhook** → `Create, Read, Test, Update`
- **Webhook Custom Header** → `Update`
- **Webhook Event** → `Resend`

### System Access
- **Member** → `Create, Read`
- **Statistic** → `Read`

### Search
- **Global Search** → `Use`

### Repository
- **Approval Configuration** → `Read, Update`
- **Approval Rule** → `Create, Read, Update`
- **Approval Setting** → `Read, Update`
- **Branch** → `Create, Protect, Read`
- **Code** → `Download, Push, Read`
- **Commit** → `Create, Read, Update`
- **Merge Request** → `Approve, Delete, Merge, Read`
- **Merge Request Approval Rule** → `Create, Read, Update`
- **Merge Request Approval State** → `Read`
- **Protected Branch** → `Read, Update`
- **Protected Tag** → `Read`
- **Push Rule** → `Create, Read, Update`
- **Repository** → `Create, Read, Update`
- **Repository Submodule** → `Update`
- **Repository Tag** → `Create, Read`
- **Tag** → `Protect`
- **Merge Request Dependency** → `Create, Read`

### Projects
- **Project** → `Archive, Fork, Read, Share, Transfer, Update`
- **Pages Domain** → `Create, Read, Update, Verify`
- **Page** → `Read, Update`

### Project Planning
- **Epic Label Event** → `Read`
- **Feature Flag** → `Create, Read, Update`
- **Feature Flag User List** → `Create, Read, Update`
- **Issue Label Event** → `Read`
- **Label** → `Create, Promote, Read, Update`
- **Merge Request Label Event** → `Read`
- **Work Item** → `Read, Write`
- **Snapshot** → `Read`
- **Remote Mirror Public Key** → `Read`
- **Remote Mirror** → `Create, Read, Update`
- **Release Link** → `Create, Read, Update`
- **Release** → `Create, Read, Update`

### Packages and Registry
- **Virtual Registry Cleanup Policy** → `Create, Read, Update`
- **Virtual Registry** → `Create, Read, Update`
- **Package Pipeline** → `Read`
- **Package** → `Create, Read`
- **Dependency Proxy Cache** → `Purge`
- **Debian Distribution** → `Create, Read, Update`
- **Container Repository Protection Rule** → `Create, Read, Update`
- **Container Repository** → `Read`
- **Container Registry Protection Tag Rule** → `Create, Read, Update`

### Notifications
- **Todo** → `Create`

### Note
- **Vulnerability Note** → `Create, Read, Update`

### Groups
- **Avatar** → `Read`
- **Group** → `Archive, Read, Share, Transfer`
- **Member Role** → `Create, Read`
- **Template** → `Read`

### CI/CD
- **Artifact** → `Delete`
- **Catalog Version** → `Publish`
- **CI Config** → `Read, Validate`
- **Cluster Agent** → `Create, Read`
- **CI Minute** → `Create, Transfer`
- **Cluster** → `Create, Read, Update`
- **Cluster Agent Token** → `Create, Read, Revoke`
- **Cluster Agent URL Configuration** → `Create, Read`
- **Deployments** → `Approve, Create, Read, Update`
- **Environment** → `Create, Read, Stop, Update`
- **Job** → `Read, Run job, Update`
- **Job Artifact** → `Read, Update`
- **Merge Train** → `Read`
- **Merge Train Merge Request** → `Add`
- **Pipeline** → `Create, Read, Update`
- **Pipeline Schedule** → `Create, Read, Update`
- **Protected Environment** → `Create, Read, Update`
- **Pull Mirror** → `Create, Read, Update`
- **Repository Storage Move** → `Create, Read`
- **Resource Group** → `Read, Update`
- **Runner** → `Assign, Read`
- **Runner Registration Token** → `Reset`
- **Secure File** → `Create, Read`
- **Terraform State** → `Create, Lock, Read`
- **Trigger** → `Create, Read, Update`
- **Variable** → `Create, Read, Update`

### Duo
- **Code Suggestion Enabled** → `Read`

### Application Security
- **Audit Event** → `Read`
- **Dependency** → `Read`
- **Dependency List Export** → `Create`
- **External Status Check** → `Read, Retry, Update`
- **External Status Check Service** → `Create, Read, Update`
- **Sbom Occurrence** → `Read`
- **Security Setting** → `Read, Update`
- **Vulnerability** → `Create, Read, Update`
- **Vulnerability Export** → `Create`

### User

#### System Access
- **Access Request** → `Create`
- **Notification Setting** → `Read, Update`
- **Personal Access Token** → `Create, Revoke, Rotate`
- **User SSH Key** → `Create, Read`
- **User** → `Follow, Read, Unfollow`
- **User Counts** → `Read`
- **User Email** → `Create, Read`

#### Groups
- **Avatar** → `Read`
- **Group** → `Create, Read`
- **Namespace** → `Read`
- **User Activity** → `Read`
- **User Association** → `Read`
- **User Avatar** → `Update`
- **User Project Deploy Key** → `Read`
- **User Status** → `Read, Update`
- **User Support Pin** → `Create, Read`
- **User Follower** → `Read`
- **User Following** → `Read`
- **User GPG Key** → `Create, Read, Revoke`
- **User Preference** → `Read, Update`

#### Notifications
- **Todo** → `Read, Update`

#### Project Features
- **Snippet** → `Create, Read, Update`

#### Project Planning
- **Work Item** → `Read`

#### Projects
- **Project** → `Create, Read, Read starred`

#### Repository
- **Merge Request** → `Read`

#### Search
- **Global Search** → `Use`

#### Subscription And Licensing
- **GitLab Subscription** → `Create, Read, Update`

#### Duo
- **Chat Completion** → `Create`
- **Code Suggestion Completion** → `Create`
- **Code Suggestion Connection Detail** → `Read`
- **Code Suggestion Direct Access** → `Create`

#### CI/CD
- **CI Minute** → `Create, Transfer`
- **Runner** → `Create`

#### System Migration and Integration
- **Bitbucket Import** → `Create`
- **GitHub Gist Import** → `Create`
- **GitHub Import** → `Create`
- **Project Import** → `Create, Read`

## Practical Summary for the Skill

This token appears sufficient for:
- reading the current user and visible projects
- reading and updating project metadata
- repository operations
- merge request operations
- issue / work item operations
- pipeline and job operations
- releases
- remote mirrors
- selected group operations
- webhook-related operations
- selected user-level operations and profile metadata
- search and snippets

## Troubleshooting Note: `GET /projects/:id` returns `403 insufficient_granular_scope`

Observed behavior during validation:

- `GET /user` works
- `GET /projects` works
- `GET /projects/:id` fails for projects outside the token boundary

Root cause:

- The token includes **Projects → Project: Read**.
- However, the fine-grained token boundary is set to:
  - **Only my personal projects, including future ones**
- Because of that, direct project-detail access is only authorized for projects inside that selected project boundary.
- When the CLI targets a project outside that boundary, GitLab returns:
  - `403 insufficient_granular_scope`

Practical meaning:

- The missing factor is **not** generic project-read permission.
- The missing factor is **resource-boundary authorization for the targeted project**.

Ways to fix it:

1. Create a broader token boundary.
2. Create a token scoped to the exact target project(s).
3. Keep this token and only use direct project-detail calls on your own personal projects.

## Caution

The token is broad. Before using it in automation beyond local development, consider whether a narrower token would be safer for:
- package registry operations
- system migration / integration operations
- cluster / runner / CI administration
- vulnerability and security-related resources
