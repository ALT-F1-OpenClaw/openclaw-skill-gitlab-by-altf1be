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

function notYet(group, command, extra = {}) {
  out({
    status: 'scaffold',
    message: 'Command group scaffolded but not implemented yet',
    group,
    command,
    apiBase: `${CFG.host}/api/v4`,
    ...extra,
  });
}

function encProject(project) {
  if (!project) return '';
  return encodeURIComponent(String(project));
}

function reqProject(input) {
  const value = input || CFG.project;
  if (!value) die('Missing project. Pass --project <id-or-path> or set GITLAB_PROJECT');
  return value;
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
  .description('OpenClaw GitLab skill — full-coverage skeleton for GitLab REST API v4')
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
  .description('List groups (scaffold placeholder)')
  .action(() => notYet('groups', 'group-list'));

program
  .command('group-get')
  .description('Get group details (scaffold placeholder)')
  .option('--group <id>', 'Group id or path')
  .action((o) => notYet('groups', 'group-get', { group: o.group || CFG.group || null }));

program
  .command('issue-list')
  .description('List issues (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('issues', 'issue-list', { project: o.project || CFG.project || null }));

program
  .command('issue-get')
  .description('Get issue details (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .option('--issue <iid>', 'Issue IID')
  .action((o) => notYet('issues', 'issue-get', { project: o.project || CFG.project || null, issue: o.issue || null }));

program
  .command('mr-list')
  .description('List merge requests (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('merge_requests', 'mr-list', { project: o.project || CFG.project || null }));

program
  .command('mr-get')
  .description('Get merge request details (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .option('--mr <iid>', 'Merge request IID')
  .action((o) => notYet('merge_requests', 'mr-get', { project: o.project || CFG.project || null, mr: o.mr || null }));

program
  .command('pipeline-list')
  .description('List pipelines (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('pipelines', 'pipeline-list', { project: o.project || CFG.project || null }));

program
  .command('pipeline-get')
  .description('Get pipeline details (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .option('--pipeline <id>', 'Pipeline ID')
  .action((o) => notYet('pipelines', 'pipeline-get', { project: o.project || CFG.project || null, pipeline: o.pipeline || null }));

program
  .command('job-list')
  .description('List jobs (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('jobs', 'job-list', { project: o.project || CFG.project || null }));

program
  .command('file-get')
  .description('Get repository file (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .option('--path <path>', 'Repository file path')
  .option('--ref <ref>', 'Branch, tag, or sha')
  .action((o) => notYet('repository_files', 'file-get', { project: o.project || CFG.project || null, path: o.path || null, ref: o.ref || null }));

program
  .command('file-create')
  .description('Create repository file (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('repository_files', 'file-create', { project: o.project || CFG.project || null }));

program
  .command('branch-list')
  .description('List branches (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('branches', 'branch-list', { project: o.project || CFG.project || null }));

program
  .command('tag-list')
  .description('List tags (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('tags', 'tag-list', { project: o.project || CFG.project || null }));

program
  .command('commit-list')
  .description('List commits (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('commits', 'commit-list', { project: o.project || CFG.project || null }));

program
  .command('webhook-list')
  .description('List webhooks (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('hooks', 'webhook-list', { project: o.project || CFG.project || null }));

program
  .command('release-list')
  .description('List releases (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('releases', 'release-list', { project: o.project || CFG.project || null }));

program
  .command('environment-list')
  .description('List environments (scaffold placeholder)')
  .option('--project <id>', 'Project id or path')
  .action((o) => notYet('environments', 'environment-list', { project: o.project || CFG.project || null }));

program
  .command('runner-list')
  .description('List runners (scaffold placeholder)')
  .action(() => notYet('runners', 'runner-list'));

program
  .command('snippet-list')
  .description('List snippets (scaffold placeholder)')
  .action(() => notYet('snippets', 'snippet-list'));

program
  .command('search')
  .description('Search GitLab scope (scaffold placeholder)')
  .option('--scope <scope>', 'Search scope')
  .option('--query <query>', 'Search query')
  .action((o) => notYet('search', 'search', { scope: o.scope || null, query: o.query || null }));

program.parse();
