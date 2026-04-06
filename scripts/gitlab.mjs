#!/usr/bin/env node

import { config } from 'dotenv';
import { Command } from 'commander';

config();

const program = new Command();

function cfg() {
  const host = process.env.GITLAB_HOST;
  const token = process.env.GITLAB_TOKEN;
  if (!host || !token) {
    console.error('ERROR: Missing required env vars: GITLAB_HOST and/or GITLAB_TOKEN');
    process.exit(1);
  }
  return {
    host: host.replace(/\/$/, ''),
    token,
    project: process.env.GITLAB_PROJECT || '',
    group: process.env.GITLAB_GROUP || '',
    maxResults: parseInt(process.env.GITLAB_MAX_RESULTS || '50', 10),
  };
}

const CFG = new Proxy({}, { get: (_, prop) => cfg()[prop] });

function out(data) {
  console.log(JSON.stringify(data, null, 2));
}

function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function encProject(project) {
  if (!project) return '';
  return encodeURIComponent(String(project));
}

function encPath(value, label = 'value') {
  if (!value) die(`Missing ${label}`);
  return encodeURIComponent(String(value));
}

function reqProject(input) {
  const value = input || CFG.project;
  if (!value) die('Missing project. Pass --project <id-or-path> or set GITLAB_PROJECT');
  return value;
}

function reqGroup(input) {
  const value = input || CFG.group;
  if (!value) die('Missing group. Pass --group <id-or-path> or set GITLAB_GROUP');
  return value;
}

function reqOpt(value, message) {
  if (value === undefined || value === null || value === '') die(message);
  return value;
}

function addQuery(params, key, value) {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

function addBool(params, key, enabled) {
  if (enabled) params.set(key, 'true');
}

function addListQuery(params, options, extra = {}) {
  const perPage = options.perPage || extra.defaultPerPage || String(CFG.maxResults);
  addQuery(params, 'per_page', perPage);
  addQuery(params, 'page', options.page);
  addQuery(params, 'order_by', options.orderBy);
  addQuery(params, 'sort', options.sort);
  for (const [fromKey, toKey] of extra.mappings || []) {
    addQuery(params, toKey, options[fromKey]);
  }
}

function jsonBody(payload) {
  return JSON.stringify(payload);
}

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, '\n');
}

function collect(value, previous = []) {
  previous.push(value);
  return previous;
}

async function glFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${CFG.host}/api/v4${path}`;
  const headers = {
    'PRIVATE-TOKEN': CFG.token,
    'Accept': 'application/json',
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const resp = await fetch(url, { ...options, headers });
  const text = await resp.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!resp.ok) {
    const detail = data?.message || data?.error || text || resp.statusText;
    throw new Error(`${resp.status} ${detail}`);
  }

  return data;
}

async function readFileContent(filePath) {
  const { readFile } = await import('node:fs/promises');
  return normalizeNewlines(await readFile(filePath, 'utf8'));
}

function wrap(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
      process.exit(1);
    }
  };
}

program
  .name('gitlab')
  .description('OpenClaw GitLab skill — broad GitLab REST API v4 CLI coverage')
  .version('1.0.0');

program
  .command('user-get-current')
  .description('Get current authenticated user')
  .action(wrap(async () => {
    out(await glFetch('/user'));
  }));

program
  .command('project-list')
  .description('List projects visible to the authenticated user')
  .option('--search <text>', 'Search projects by name/path')
  .option('--owned', 'Limit to owned projects')
  .option('--membership', 'Limit to projects you are a member of')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const params = new URLSearchParams();
    params.set('per_page', o.perPage || String(CFG.maxResults));
    if (o.page) params.set('page', String(o.page));
    if (o.search) params.set('search', o.search);
    if (o.owned) params.set('owned', 'true');
    if (o.membership) params.set('membership', 'true');
    out(await glFetch(`/projects?${params.toString()}`));
  }));

program
  .command('project-get')
  .description('Get project details by numeric ID or full path')
  .option('--project <id>', 'Project id or path')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    out(await glFetch(`/projects/${encProject(project)}`));
  }));

program
  .command('group-list')
  .description('List groups visible to the authenticated user')
  .option('--search <text>', 'Search group name or path')
  .option('--owned', 'Limit to owned groups')
  .option('--all-available', 'Show all available groups')
  .option('--top-level-only', 'Only return top-level groups')
  .option('--min-access-level <level>', 'Minimum access level')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .option('--order-by <field>', 'Order by field')
  .option('--sort <direction>', 'Sort direction')
  .action(wrap(async (o) => {
    const params = new URLSearchParams();
    addListQuery(params, o);
    addQuery(params, 'search', o.search);
    addQuery(params, 'min_access_level', o.minAccessLevel);
    addBool(params, 'owned', o.owned);
    addBool(params, 'all_available', o.allAvailable);
    addBool(params, 'top_level_only', o.topLevelOnly);
    out(await glFetch(`/groups?${params.toString()}`));
  }));

program
  .command('group-get')
  .description('Get group details by numeric ID or full path')
  .option('--group <id>', 'Group id or path')
  .option('--with-projects', 'Include projects in the response')
  .action(wrap(async (o) => {
    const group = reqGroup(o.group);
    const params = new URLSearchParams();
    addBool(params, 'with_projects', o.withProjects);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    out(await glFetch(`/groups/${encPath(group, 'group')}${suffix}`));
  }));

program
  .command('issue-list')
  .description('List project issues')
  .option('--project <id>', 'Project id or path')
  .option('--state <state>', 'opened, closed, or all')
  .option('--labels <labels>', 'Comma-separated labels')
  .option('--search <text>', 'Search title/description')
  .option('--author-id <id>', 'Filter by author id')
  .option('--assignee-id <id>', 'Filter by assignee id')
  .option('--milestone <name>', 'Filter by milestone title')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .option('--order-by <field>', 'Order by field')
  .option('--sort <direction>', 'Sort direction')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addListQuery(params, o, {
      mappings: [
        ['state', 'state'],
        ['labels', 'labels'],
        ['search', 'search'],
        ['authorId', 'author_id'],
        ['assigneeId', 'assignee_id'],
        ['milestone', 'milestone'],
      ],
    });
    out(await glFetch(`/projects/${encProject(project)}/issues?${params.toString()}`));
  }));

program
  .command('issue-get')
  .description('Get issue details by IID')
  .option('--project <id>', 'Project id or path')
  .option('--issue <iid>', 'Issue IID')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const issue = reqOpt(o.issue, 'Missing issue IID. Pass --issue <iid>');
    out(await glFetch(`/projects/${encProject(project)}/issues/${encPath(issue, 'issue')}`));
  }));

program
  .command('mr-list')
  .description('List project merge requests')
  .option('--project <id>', 'Project id or path')
  .option('--state <state>', 'opened, closed, locked, merged, or all')
  .option('--source-branch <branch>', 'Filter by source branch')
  .option('--target-branch <branch>', 'Filter by target branch')
  .option('--author-id <id>', 'Filter by author id')
  .option('--assignee-id <id>', 'Filter by assignee id')
  .option('--labels <labels>', 'Comma-separated labels')
  .option('--search <text>', 'Search title/description')
  .option('--wip <value>', 'true or false')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .option('--order-by <field>', 'Order by field')
  .option('--sort <direction>', 'Sort direction')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addListQuery(params, o, {
      mappings: [
        ['state', 'state'],
        ['sourceBranch', 'source_branch'],
        ['targetBranch', 'target_branch'],
        ['authorId', 'author_id'],
        ['assigneeId', 'assignee_id'],
        ['labels', 'labels'],
        ['search', 'search'],
        ['wip', 'wip'],
      ],
    });
    out(await glFetch(`/projects/${encProject(project)}/merge_requests?${params.toString()}`));
  }));

program
  .command('mr-get')
  .description('Get merge request details by IID')
  .option('--project <id>', 'Project id or path')
  .option('--mr <iid>', 'Merge request IID')
  .option('--include-diverged-commits-count', 'Include diverged commits count')
  .option('--render-html', 'Render HTML fields')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const mr = reqOpt(o.mr, 'Missing merge request IID. Pass --mr <iid>');
    const params = new URLSearchParams();
    addBool(params, 'include_diverged_commits_count', o.includeDivergedCommitsCount);
    addBool(params, 'render_html', o.renderHtml);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    out(await glFetch(`/projects/${encProject(project)}/merge_requests/${encPath(mr, 'merge request')}${suffix}`));
  }));

program
  .command('pipeline-list')
  .description('List project pipelines')
  .option('--project <id>', 'Project id or path')
  .option('--status <status>', 'Pipeline status')
  .option('--ref <ref>', 'Git ref')
  .option('--source <source>', 'Pipeline source')
  .option('--sha <sha>', 'Commit sha')
  .option('--username <username>', 'Triggered by username')
  .option('--name <name>', 'Pipeline name')
  .option('--updated-after <date>', 'ISO timestamp')
  .option('--updated-before <date>', 'ISO timestamp')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .option('--order-by <field>', 'Order by field')
  .option('--sort <direction>', 'Sort direction')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addListQuery(params, o, {
      mappings: [
        ['status', 'status'],
        ['ref', 'ref'],
        ['source', 'source'],
        ['sha', 'sha'],
        ['username', 'username'],
        ['name', 'name'],
        ['updatedAfter', 'updated_after'],
        ['updatedBefore', 'updated_before'],
      ],
    });
    out(await glFetch(`/projects/${encProject(project)}/pipelines?${params.toString()}`));
  }));

program
  .command('pipeline-get')
  .description('Get pipeline details by ID')
  .option('--project <id>', 'Project id or path')
  .option('--pipeline <id>', 'Pipeline ID')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const pipeline = reqOpt(o.pipeline, 'Missing pipeline ID. Pass --pipeline <id>');
    out(await glFetch(`/projects/${encProject(project)}/pipelines/${encPath(pipeline, 'pipeline')}`));
  }));

program
  .command('job-list')
  .description('List project jobs or jobs for a specific pipeline')
  .option('--project <id>', 'Project id or path')
  .option('--pipeline <id>', 'Restrict to a pipeline ID')
  .option('--scope <status>', 'Repeatable job status scope', collect, [])
  .option('--include-retried', 'Include retried jobs')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .option('--order-by <field>', 'Order by field')
  .option('--sort <direction>', 'Sort direction')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addListQuery(params, o);
    if (o.scope) {
      for (const scope of [].concat(o.scope)) params.append('scope[]', scope);
    }
    addBool(params, 'include_retried', o.includeRetried);
    const base = o.pipeline
      ? `/projects/${encProject(project)}/pipelines/${encPath(o.pipeline, 'pipeline')}/jobs`
      : `/projects/${encProject(project)}/jobs`;
    out(await glFetch(`${base}?${params.toString()}`));
  }));

program
  .command('file-get')
  .description('Get repository file metadata and base64 content')
  .option('--project <id>', 'Project id or path')
  .option('--path <path>', 'Repository file path')
  .option('--ref <ref>', 'Branch, tag, or sha')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const filePath = reqOpt(o.path, 'Missing file path. Pass --path <path>');
    const ref = reqOpt(o.ref, 'Missing ref. Pass --ref <ref>');
    const params = new URLSearchParams({ ref });
    out(await glFetch(`/projects/${encProject(project)}/repository/files/${encPath(filePath, 'path')}?${params.toString()}`));
  }));

program
  .command('file-create')
  .description('Create a repository file')
  .option('--project <id>', 'Project id or path')
  .option('--path <path>', 'Repository file path')
  .option('--branch <branch>', 'Target branch')
  .option('--content <text>', 'Inline file content')
  .option('--content-file <file>', 'Read file content from local file')
  .option('--commit-message <message>', 'Commit message')
  .option('--encoding <encoding>', 'text or base64')
  .option('--author-email <email>', 'Commit author email')
  .option('--author-name <name>', 'Commit author name')
  .option('--execute-filemode', 'Set executable bit on the new file')
  .option('--start-branch <branch>', 'Create target branch from this branch')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const filePath = reqOpt(o.path, 'Missing file path. Pass --path <path>');
    const branch = reqOpt(o.branch, 'Missing branch. Pass --branch <branch>');
    const commitMessage = reqOpt(o.commitMessage, 'Missing commit message. Pass --commit-message <message>');
    if (o.content && o.contentFile) {
      die('Pass either --content or --content-file, not both');
    }
    const content = o.contentFile ? await readFileContent(o.contentFile) : o.content;
    reqOpt(content, 'Missing file content. Pass --content <text> or --content-file <file>');
    const body = {
      branch,
      content,
      commit_message: commitMessage,
    };
    if (o.encoding) body.encoding = o.encoding;
    if (o.authorEmail) body.author_email = o.authorEmail;
    if (o.authorName) body.author_name = o.authorName;
    if (o.executeFilemode) body.execute_filemode = true;
    if (o.startBranch) body.start_branch = o.startBranch;
    out(await glFetch(`/projects/${encProject(project)}/repository/files/${encPath(filePath, 'path')}`, {
      method: 'POST',
      body: jsonBody(body),
    }));
  }));

program
  .command('branch-list')
  .description('List repository branches')
  .option('--project <id>', 'Project id or path')
  .option('--search <text>', 'Search branch name')
  .option('--regex <regex>', 'Regex filter')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addQuery(params, 'per_page', o.perPage || String(CFG.maxResults));
    addQuery(params, 'page', o.page);
    addQuery(params, 'search', o.search);
    addQuery(params, 'regex', o.regex);
    out(await glFetch(`/projects/${encProject(project)}/repository/branches?${params.toString()}`));
  }));

program
  .command('branch-get')
  .description('Get repository branch details')
  .option('--project <id>', 'Project id or path')
  .option('--branch <name>', 'Branch name')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const branch = reqOpt(o.branch, 'Missing branch name. Pass --branch <name>');
    out(await glFetch(`/projects/${encProject(project)}/repository/branches/${encPath(branch, 'branch')}`));
  }));

program
  .command('tag-list')
  .description('List repository tags')
  .option('--project <id>', 'Project id or path')
  .option('--search <text>', 'Search tag name')
  .option('--order-by <field>', 'Order by name or updated')
  .option('--sort <direction>', 'Sort direction')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addListQuery(params, o, {
      mappings: [
        ['search', 'search'],
      ],
    });
    out(await glFetch(`/projects/${encProject(project)}/repository/tags?${params.toString()}`));
  }));

program
  .command('tag-get')
  .description('Get repository tag details')
  .option('--project <id>', 'Project id or path')
  .option('--tag <name>', 'Tag name')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const tag = reqOpt(o.tag, 'Missing tag name. Pass --tag <name>');
    out(await glFetch(`/projects/${encProject(project)}/repository/tags/${encPath(tag, 'tag')}`));
  }));

program
  .command('commit-list')
  .description('List repository commits')
  .option('--project <id>', 'Project id or path')
  .option('--ref <ref>', 'Ref name')
  .option('--path <path>', 'Only commits touching this path')
  .option('--author <author>', 'Author name or email')
  .option('--since <date>', 'ISO timestamp')
  .option('--until <date>', 'ISO timestamp')
  .option('--with-stats', 'Include commit stats')
  .option('--first-parent', 'Follow only first parent')
  .option('--all', 'Return all commits')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addQuery(params, 'per_page', o.perPage || String(CFG.maxResults));
    addQuery(params, 'page', o.page);
    addQuery(params, 'ref_name', o.ref);
    addQuery(params, 'path', o.path);
    addQuery(params, 'author', o.author);
    addQuery(params, 'since', o.since);
    addQuery(params, 'until', o.until);
    addBool(params, 'with_stats', o.withStats);
    addBool(params, 'first_parent', o.firstParent);
    addBool(params, 'all', o.all);
    out(await glFetch(`/projects/${encProject(project)}/repository/commits?${params.toString()}`));
  }));

program
  .command('commit-get')
  .description('Get repository commit details')
  .option('--project <id>', 'Project id or path')
  .option('--sha <sha>', 'Commit SHA')
  .option('--stats', 'Include commit stats')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const sha = reqOpt(o.sha, 'Missing commit SHA. Pass --sha <sha>');
    const params = new URLSearchParams();
    addBool(params, 'stats', o.stats);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    out(await glFetch(`/projects/${encProject(project)}/repository/commits/${encPath(sha, 'sha')}${suffix}`));
  }));

program
  .command('webhook-list')
  .description('List project webhooks')
  .option('--project <id>', 'Project id or path')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addQuery(params, 'per_page', o.perPage || String(CFG.maxResults));
    addQuery(params, 'page', o.page);
    out(await glFetch(`/projects/${encProject(project)}/hooks?${params.toString()}`));
  }));

program
  .command('webhook-create')
  .description('Create a project webhook')
  .option('--project <id>', 'Project id or path')
  .option('--url <url>', 'Webhook target URL')
  .option('--name <name>', 'Webhook name')
  .option('--description <text>', 'Webhook description')
  .option('--token <token>', 'Webhook secret token')
  .option('--push-events', 'Trigger on push events')
  .option('--tag-push-events', 'Trigger on tag push events')
  .option('--merge-requests-events', 'Trigger on merge request events')
  .option('--issues-events', 'Trigger on issue events')
  .option('--confidential-issues-events', 'Trigger on confidential issue events')
  .option('--note-events', 'Trigger on note events')
  .option('--confidential-note-events', 'Trigger on confidential note events')
  .option('--job-events', 'Trigger on job events')
  .option('--pipeline-events', 'Trigger on pipeline events')
  .option('--wiki-page-events', 'Trigger on wiki page events')
  .option('--deployment-events', 'Trigger on deployment events')
  .option('--releases-events', 'Trigger on release events')
  .option('--enable-ssl-verification', 'Enable SSL verification')
  .option('--custom-header <header>', 'Repeatable header in Name: Value form', collect, [])
  .option('--push-events-branch-filter <pattern>', 'Branch name filter for push events')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const url = reqOpt(o.url, 'Missing webhook URL. Pass --url <url>');
    const body = { url };
    if (o.name) body.name = o.name;
    if (o.description) body.description = o.description;
    if (o.token) body.token = o.token;
    if (o.pushEventsBranchFilter) body.push_events_branch_filter = o.pushEventsBranchFilter;
    for (const [flag, key] of [
      ['pushEvents', 'push_events'],
      ['tagPushEvents', 'tag_push_events'],
      ['mergeRequestsEvents', 'merge_requests_events'],
      ['issuesEvents', 'issues_events'],
      ['confidentialIssuesEvents', 'confidential_issues_events'],
      ['noteEvents', 'note_events'],
      ['confidentialNoteEvents', 'confidential_note_events'],
      ['jobEvents', 'job_events'],
      ['pipelineEvents', 'pipeline_events'],
      ['wikiPageEvents', 'wiki_page_events'],
      ['deploymentEvents', 'deployment_events'],
      ['releasesEvents', 'releases_events'],
      ['enableSslVerification', 'enable_ssl_verification'],
    ]) {
      if (o[flag]) body[key] = true;
    }
    if (o.customHeader) {
      const headers = [].concat(o.customHeader).map((entry) => {
        const idx = entry.indexOf(':');
        if (idx < 1) die(`Invalid --custom-header value "${entry}". Use Name: Value`);
        return {
          key: entry.slice(0, idx).trim(),
          value: entry.slice(idx + 1).trim(),
        };
      });
      body.custom_headers = headers;
    }
    out(await glFetch(`/projects/${encProject(project)}/hooks`, {
      method: 'POST',
      body: jsonBody(body),
    }));
  }));

program
  .command('release-list')
  .description('List project releases')
  .option('--project <id>', 'Project id or path')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .option('--order-by <field>', 'Order by released_at or created_at')
  .option('--sort <direction>', 'Sort direction')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addListQuery(params, o);
    out(await glFetch(`/projects/${encProject(project)}/releases?${params.toString()}`));
  }));

program
  .command('release-get')
  .description('Get release details by tag name')
  .option('--project <id>', 'Project id or path')
  .option('--tag <name>', 'Tag name')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const tag = reqOpt(o.tag, 'Missing release tag. Pass --tag <name>');
    out(await glFetch(`/projects/${encProject(project)}/releases/${encPath(tag, 'tag')}`));
  }));

program
  .command('environment-list')
  .description('List project environments')
  .option('--project <id>', 'Project id or path')
  .option('--name <name>', 'Filter by environment name')
  .option('--search <text>', 'Search environment name')
  .option('--states <states>', 'Comma-separated states')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const project = reqProject(o.project);
    const params = new URLSearchParams();
    addQuery(params, 'per_page', o.perPage || String(CFG.maxResults));
    addQuery(params, 'page', o.page);
    addQuery(params, 'name', o.name);
    addQuery(params, 'search', o.search);
    addQuery(params, 'states', o.states);
    out(await glFetch(`/projects/${encProject(project)}/environments?${params.toString()}`));
  }));

program
  .command('runner-list')
  .description('List instance or project runners')
  .option('--project <id>', 'Project id or path; omit for instance runners')
  .option('--type <type>', 'instance_type, group_type, project_type, or specific')
  .option('--status <status>', 'online, offline, stale, or never_contacted')
  .option('--paused <true|false>', 'Filter paused runners')
  .option('--tag-list <tags>', 'Comma-separated runner tags')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const params = new URLSearchParams();
    addQuery(params, 'per_page', o.perPage || String(CFG.maxResults));
    addQuery(params, 'page', o.page);
    addQuery(params, 'type', o.type);
    addQuery(params, 'status', o.status);
    addQuery(params, 'paused', o.paused);
    addQuery(params, 'tag_list', o.tagList);
    const path = o.project
      ? `/projects/${encProject(o.project)}/runners`
      : '/runners';
    out(await glFetch(`${path}?${params.toString()}`));
  }));

program
  .command('snippet-list')
  .description('List personal or project snippets')
  .option('--project <id>', 'Project id or path; omit for personal snippets')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const params = new URLSearchParams();
    addQuery(params, 'per_page', o.perPage || String(CFG.maxResults));
    addQuery(params, 'page', o.page);
    const path = o.project
      ? `/projects/${encProject(o.project)}/snippets`
      : '/snippets';
    out(await glFetch(`${path}?${params.toString()}`));
  }));

program
  .command('snippet-get')
  .description('Get personal or project snippet details')
  .option('--project <id>', 'Project id or path; omit for personal snippets')
  .option('--snippet <id>', 'Snippet ID')
  .action(wrap(async (o) => {
    const snippet = reqOpt(o.snippet, 'Missing snippet ID. Pass --snippet <id>');
    const path = o.project
      ? `/projects/${encProject(o.project)}/snippets/${encPath(snippet, 'snippet')}`
      : `/snippets/${encPath(snippet, 'snippet')}`;
    out(await glFetch(path));
  }));

program
  .command('search')
  .description('Search a GitLab API scope')
  .option('--scope <scope>', 'Search scope')
  .option('--query <query>', 'Search query')
  .option('--project <id>', 'Project id or path for project-scoped search')
  .option('--group <id>', 'Group id or path for group-scoped search')
  .option('--page <n>', 'Page number')
  .option('--per-page <n>', 'Results per page')
  .action(wrap(async (o) => {
    const scope = reqOpt(o.scope, 'Missing search scope. Pass --scope <scope>');
    const query = reqOpt(o.query, 'Missing search query. Pass --query <query>');
    const params = new URLSearchParams();
    addQuery(params, 'scope', scope);
    addQuery(params, 'search', query);
    addQuery(params, 'per_page', o.perPage || String(CFG.maxResults));
    addQuery(params, 'page', o.page);
    let base = '/search';
    if (o.project) {
      base = `/projects/${encProject(o.project)}/search`;
    } else if (o.group) {
      base = `/groups/${encPath(o.group, 'group')}/search`;
    }
    out(await glFetch(`${base}?${params.toString()}`));
  }));

program.parse();
