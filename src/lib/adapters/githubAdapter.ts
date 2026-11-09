/**
 * Real GitHub API Adapter
 * Directly interfaces with api.github.com to verify accounts, create repos, and commit files
 */

export interface GithubRepoResult {
  ok: boolean;
  repoUrl?: string;
  repoName?: string;
  defaultBranch?: string;
  committedFiles?: string[];
  error?: string;
  statusCode?: number;
}

export interface GithubUserInfo {
  login: string;
  id: number;
  avatar_url: string;
  type: string;
  public_repos: number;
}

const GITHUB_API_BASE = 'https://api.github.com';

export async function verifyGithubToken(token: string): Promise<{ ok: boolean; user?: GithubUserInfo; error?: string }> {
  if (!token || token.trim().length < 8) {
    return { ok: false, error: 'Invalid or missing GitHub Personal Access Token' };
  }

  try {
    const res = await fetch(`${GITHUB_API_BASE}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!res.ok) {
      return { ok: false, error: `GitHub API error: ${res.status} ${res.statusText}` };
    }

    const user = (await res.json()) as GithubUserInfo;
    return { ok: true, user };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to connect to GitHub' };
  }
}

export async function publishToGithub(
  token: string,
  owner: string,
  repoName: string,
  files: Record<string, string>,
  isPrivate: boolean = true
): Promise<GithubRepoResult> {
  const cleanName = repoName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const headers = {
    'Authorization': `Bearer ${token.trim()}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    // 1. Check or create repo
    const checkRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${cleanName}`, {
      headers,
    });

    let html_url = `https://github.com/${owner}/${cleanName}`;

    if (checkRes.status === 404) {
      // Create repository under user or organization
      const createEndpoint = `${GITHUB_API_BASE}/user/repos`;
      const createRes = await fetch(createEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: cleanName,
          private: isPrivate,
          auto_init: true,
          description: `Onchain miniapp generated with Shipyard`,
        }),
      });

      if (!createRes.ok && createRes.status !== 422) {
        return {
          ok: false,
          error: `Failed to create repository: ${createRes.status} ${createRes.statusText}`,
          statusCode: createRes.status,
        };
      }

      if (createRes.ok) {
        const repoData = await createRes.json();
        html_url = repoData.html_url;
      }
    } else if (checkRes.ok) {
      const existingData = await checkRes.json();
      html_url = existingData.html_url;
    }

    // 2. Commit files to repo
    const committed: string[] = [];
    for (const [filePath, content] of Object.entries(files)) {
      const url = `${GITHUB_API_BASE}/repos/${owner}/${cleanName}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}`;
      
      const existing = await fetch(url, { headers });
      const sha = existing.ok ? ((await existing.json()) as { sha?: string }).sha : undefined;

      const putRes = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Add ${filePath} via Shipyard Builder`,
          content: Buffer.from(content).toString('base64'),
          ...(sha ? { sha } : {}),
        }),
      });

      if (putRes.ok) {
        committed.push(filePath);
      }
    }

    return {
      ok: true,
      repoUrl: html_url,
      repoName: cleanName,
      defaultBranch: 'main',
      committedFiles: committed,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: `GitHub Adapter error: ${err.message}`,
    };
  }
}
