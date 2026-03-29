#!/usr/bin/env node

/**
 * Clone script for HagiCode Mono repositories
 * This script clones all repositories defined in monospecs.yaml
 */

import { promises as fs } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '..', 'monospecs.yaml');

/**
 * Execute a command without going through a shell.
 */
async function execCommand(command, args = [], options = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      maxBuffer: 10 * 1024 * 1024,
      ...options
    });
    return { stdout: stdout?.trim(), stderr: stderr?.trim() };
  } catch (error) {
    throw error;
  }
}

/**
 * Run git and return trimmed stdout.
 */
async function git(args, options = {}) {
  return execCommand('git', args, options);
}

/**
 * Check if a URL is accessible.
 * When branch is provided, verify that branch exists as well.
 */
async function checkRepoAccessible(url, branch) {
  try {
    const ref = branch ? `refs/heads/${branch}` : 'HEAD';
    const { stdout } = await git(['ls-remote', url, ref]);
    return Boolean(stdout);
  } catch (error) {
    return false;
  }
}

/**
 * Verify AGENTS.md file exists in a repository
 */
async function verifyAgentsMd(repoPath) {
  const agentsPath = path.join(repoPath, 'AGENTS.md');
  try {
    await fs.access(agentsPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check whether a local branch already exists.
 */
async function hasLocalBranch(repoPath, branch) {
  try {
    await git(['show-ref', '--verify', '--quiet', `refs/heads/${branch}`], { cwd: repoPath });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Ensure an existing repository is on the configured branch.
 */
async function ensureBranch(repoPath, branch) {
  if (!branch) {
    return;
  }

  await git(['fetch', 'origin', branch], { cwd: repoPath });

  const { stdout: currentBranch } = await git(['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: repoPath
  });

  if (currentBranch === branch) {
    console.log(`  🌿 Branch ready: ${branch}`);
    return;
  }

  if (await hasLocalBranch(repoPath, branch)) {
    await git(['checkout', branch], { cwd: repoPath });
  } else {
    await git(['checkout', '-b', branch, '--track', `origin/${branch}`], { cwd: repoPath });
  }

  console.log(`  🌿 Switched to branch: ${branch}`);
}

/**
 * Verify repository branch configuration before cloning.
 */
async function validateRepoConfig(repo) {
  const { url, branch, displayName } = repo;
  const accessible = await checkRepoAccessible(url, branch);
  if (!accessible) {
    const target = branch ? `branch \"${branch}\"` : 'default branch';
    throw new Error(`${displayName}: repository or ${target} is not accessible`);
  }
}

/**
 * Clone a single repository
 */
async function cloneRepo(repo, monoRoot) {
  const { displayName, url, path: repoPath, type, optional, branch } = repo;
  const fullPath = path.join(monoRoot, repoPath);
  const branchDisplay = branch ? ` @ ${branch}` : '';

  // Format repo type for display
  const typeDisplay = type ? ` [${type}]` : '';
  console.log(`\n📦 Processing: ${displayName}${branchDisplay}${typeDisplay}`);

  // Check if this is an optional repository
  if (optional) {
    const repoAvailable = await checkRepoAccessible(url, branch);
    if (!repoAvailable) {
      console.log(`  ⏭️  Skipped (optional, repository not accessible): ${url}`);
      return { skipped: true, optional: true };
    }
  } else {
    await validateRepoConfig(repo);
  }

  // Check if directory already exists
  try {
    await fs.access(fullPath);

    // Directory exists, check if it's a git repo
    try {
      await git(['rev-parse', '--git-dir'], { cwd: fullPath });
      console.log(`  ✅ Already exists: ${repoPath}`);

      // Fetch remote updates before switching branch.
      try {
        if (branch) {
          await ensureBranch(fullPath, branch);
        } else {
          await git(['fetch', 'origin'], { cwd: fullPath });
          console.log('  🔄 Fetched latest changes');
        }
      } catch (fetchError) {
        console.log(`  ⚠️  Could not sync branch: ${fetchError.message}`);
      }

      // Verify AGENTS.md for web repositories
      if (type && type.includes('frontend')) {
        const hasAgentsMd = await verifyAgentsMd(fullPath);
        if (hasAgentsMd) {
          console.log('  📄 AGENTS.md found');
        } else {
          console.log('  ⚠️  AGENTS.md not found (recommended for web repositories)');
        }
      }

      return { updated: true };
    } catch (gitError) {
      // Directory exists but not a git repo
      console.log(`  ⚠️  Directory exists but is not a git repository: ${repoPath}`);
      console.log('  💡 Skipping. Remove or rename the directory to clone.');
      return { skipped: true };
    }
  } catch (accessError) {
    // Directory doesn't exist, proceed with clone
  }

  // Create parent directory if needed
  const parentDir = path.dirname(fullPath);
  try {
    await fs.mkdir(parentDir, { recursive: true });
  } catch (mkdirError) {
    // Ignore if already exists
  }

  // Clone the repository
  try {
    const cloneArgs = ['clone'];
    if (branch) {
      cloneArgs.push('--branch', branch, '--single-branch');
    }
    cloneArgs.push(url, repoPath);

    await git(cloneArgs, { cwd: monoRoot });
    console.log(`  ✅ Cloned: ${url} -> ${repoPath}${branch ? ` (${branch})` : ''}`);

    // Verify AGENTS.md for web repositories
    if (type && type.includes('frontend')) {
      const hasAgentsMd = await verifyAgentsMd(fullPath);
      if (hasAgentsMd) {
        console.log('  📄 AGENTS.md found');
      } else {
        console.log('  ⚠️  AGENTS.md not found (recommended for web repositories)');
      }
    }

    return { cloned: true };
  } catch (cloneError) {
    console.error(`  ❌ Failed to clone ${displayName}:`, cloneError.message);
    throw cloneError;
  }
}

/**
 * Main function
 */
async function main() {
  const monoRoot = path.join(__dirname, '..');

  try {
    // Read monospecs.yaml config
    const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    let config;

    try {
      config = yaml.load(configContent);
    } catch (yamlError) {
      console.error('\n❌ Error: Failed to parse monospecs.yaml');
      console.error(`  ${yamlError.message}`);
      process.exit(1);
    }

    // Check for repositories configuration
    if (!config.repositories || !Array.isArray(config.repositories)) {
      console.error('\n❌ Error: No repositories configuration found in monospecs.yaml');
      console.error('  Please add a "repositories" array to your monospecs.yaml file.');
      console.error('\n  Example:');
      console.error('  repositories:');
      console.error('    - path: "repos/example"');
      console.error('      url: "https://github.com/org/example.git"');
      console.error('      displayName: "Example Repository"');
      process.exit(1);
    }

    console.log('🚀 HagiCode Mono - Repository Clone Script');
    console.log(`📂 Monorepo root: ${monoRoot}`);
    console.log(`📋 Found ${config.repositories.length} repositories to process`);

    // Clone each repository
    let successCount = 0;
    let skipCount = 0;
    let optionalSkipCount = 0;
    let failCount = 0;

    for (const repo of config.repositories) {
      try {
        const result = await cloneRepo(repo, monoRoot);

        if (result?.optional) {
          optionalSkipCount++;
        } else if (result?.skipped) {
          skipCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`  ✅ Successfully processed: ${successCount}`);
    console.log(`  ⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`  📋 Skipped (optional, not available): ${optionalSkipCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log('='.repeat(50));

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
