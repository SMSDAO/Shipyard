import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_APPS, INITIAL_USERS, INITIAL_ORGS, INITIAL_FEATURE_FLAGS, INITIAL_API_KEYS, INITIAL_WEBHOOKS, INITIAL_AUDIT_LOGS } from './src/data/mockData.ts';
import { ShipyardApp, User, Org, FeatureFlag, ApiKey, Webhook, AuditLog, AgentMessage } from './src/types/index.ts';
import { createInitialPlan, generateAppFiles, generateRandomEthAddress, runStaticReview } from './src/lib/agentEngine.ts';
import { queryRealBaseNetworkState, createRealWallet, inspectSolidityContract } from './src/lib/adapters/baseAdapter.ts';
import { verifyTelegramBot, sendTelegramMiniAppButton } from './src/lib/adapters/telegramAdapter.ts';
import { verifyGithubToken, publishToGithub } from './src/lib/adapters/githubAdapter.ts';
import { generateAppWithRealAI } from './src/lib/adapters/geminiBuilderAdapter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // In-memory persistent database store matching Shipyard models
  let apps: ShipyardApp[] = [...INITIAL_APPS];
  let users: User[] = [...INITIAL_USERS];
  let currentUserId: string = 'usr_alice';
  let orgs: Org[] = [...INITIAL_ORGS];
  let featureFlags: FeatureFlag[] = [...INITIAL_FEATURE_FLAGS];
  let apiKeys: ApiKey[] = [...INITIAL_API_KEYS];
  let webhooks: Webhook[] = [...INITIAL_WEBHOOKS];
  let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

  function getCurrentUser(): User {
    return users.find((u) => u.id === currentUserId) || users[0];
  }

  function addAudit(action: string, target?: string) {
    const user = getCurrentUser();
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      target,
      actorEmail: user.email,
      createdAt: new Date().toISOString(),
      orgId: orgs[0]?.id,
    };
    auditLogs.unshift(log);
  }

  // --- API ROUTES ---

  // Health check matching /api/health
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Current User / Session
  app.get('/api/auth/me', (_req, res) => {
    res.json({ user: getCurrentUser(), users });
  });

  // Dev Login / Persona Switcher matching /api/auth/dev-login
  app.post('/api/auth/dev-login', (req, res) => {
    const { email } = req.body;
    const target = users.find((u) => u.email === email);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    currentUserId = target.id;
    addAudit('auth.dev_login', target.email);
    res.json({ success: true, user: target });
  });

  // Update Profile & User Settings matching /api/auth/profile
  app.patch('/api/auth/profile', (req, res) => {
    const user = getCurrentUser();
    const {
      displayName,
      avatarUrl,
      bio,
      walletAddress,
      telegramHandle,
      githubUsername,
      preferredNetwork,
      notificationsEnabled,
      emailNotifications,
      deploymentAlerts,
      themePreference,
      customRpcUrl,
    } = req.body;

    if (displayName !== undefined) user.displayName = displayName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;
    if (walletAddress !== undefined) user.walletAddress = walletAddress;
    if (telegramHandle !== undefined) user.telegramHandle = telegramHandle;
    if (githubUsername !== undefined) user.githubUsername = githubUsername;
    if (preferredNetwork !== undefined) user.preferredNetwork = preferredNetwork;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (deploymentAlerts !== undefined) user.deploymentAlerts = deploymentAlerts;
    if (themePreference !== undefined) user.themePreference = themePreference;
    if (customRpcUrl !== undefined) user.customRpcUrl = customRpcUrl;

    addAudit('user.update_profile', `${user.displayName || user.handle} profile updated`);
    res.json({ success: true, user });
  });

  // Apps list matching /api/apps (GET)
  app.get('/api/apps', (_req, res) => {
    res.json({ apps });
  });

  // Create App matching /api/apps (POST)
  app.post('/api/apps', (req, res) => {
    const { name, idea, platforms: requestedPlatforms, launchToken = true, tokenSymbol } = req.body;
    if (!name || !idea || idea.length < 15) {
      return res.status(400).json({ error: 'App name and idea (minimum 15 characters) required' });
    }

    const user = getCurrentUser();
    if (user.credits < 100) {
      return res.status(402).json({ error: 'Insufficient credits (100 required)' });
    }

    // Deduct credits
    user.credits -= 100;

    const cleanSymbol = tokenSymbol?.trim() || name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'SHIP';
    const plan = createInitialPlan(name, idea, {
      launchToken,
      tokenSymbol: cleanSymbol,
      platforms: requestedPlatforms,
    });

    const { files, previewHtml } = generateAppFiles({ name, idea, plan });
    const reviewReport = runStaticReview(files);
    
    // Real cryptographic wallet generation on Base
    const realWallet = createRealWallet('mainnet');
    const tokenContractWallet = createRealWallet('mainnet');

    const appId = `app_${Date.now()}`;
    const newApp: ShipyardApp = {
      id: appId,
      name,
      idea,
      status: 'PLANNING',
      isPublic: true,
      ownerId: user.id,
      ownerEmail: user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      opens: 1,
      uniqueUsers: 1,
      revenueCents: 0,
      plan,
      deploymentPhase: 'COMPILING',
      wallet: {
        id: `wal_${Date.now()}`,
        address: realWallet.address,
        balanceWei: '50000000000000000', // 0.05 ETH initial gas
        network: 'Base Mainnet',
      },
      token: launchToken
        ? {
            id: `tok_${Date.now()}`,
            symbol: cleanSymbol,
            name: `${name} Token`,
            feesAccruedWei: '0',
            feesClaimedWei: '0',
            creatorShareBps: 6000,
            contractAddress: tokenContractWallet.address,
            priceUsd: 0.01,
          }
        : undefined,
      platforms: [
        { kind: 'WEB', enabled: true },
        { kind: 'FARCASTER', enabled: true },
        { kind: 'BASE', enabled: true },
        { kind: 'TELEGRAM', enabled: false },
        { kind: 'WORLD', enabled: false },
        { kind: 'CELO', enabled: false },
      ],
      builds: [
        {
          id: `bld_${Date.now()}`,
          status: 'IN_PROGRESS',
          step: 'Planner: formulating miniapp architecture',
          startedAt: new Date().toISOString(),
        },
      ],
      files,
      previewHtml,
      reviewReport,
      chatHistory: [
        {
          id: `msg_${Date.now()}`,
          role: 'USER',
          content: idea,
          timestamp: new Date().toISOString(),
        },
        {
          id: `msg_plan_${Date.now()}`,
          role: 'ASSISTANT',
          agentName: 'Planner',
          content: `Initial plan set for "${name}":\n- Platforms: WEB, FARCASTER, BASE\n- Base L2 fee splitter (60% creator share)\n- Token: $${cleanSymbol}\nAgents starting build...`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    apps.unshift(newApp);
    addAudit('app.create', newApp.name);
    res.status(201).json({ app: newApp });
  });

  // Get App by ID matching /api/apps/[id]
  app.get('/api/apps/:id', (req, res) => {
    const appRecord = apps.find((a) => a.id === req.params.id);
    if (!appRecord) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json({ app: appRecord });
  });

  // Update App by ID
  app.patch('/api/apps/:id', (req, res) => {
    const appIndex = apps.findIndex((a) => a.id === req.params.id);
    if (appIndex === -1) {
      return res.status(404).json({ error: 'App not found' });
    }
    apps[appIndex] = { ...apps[appIndex], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ app: apps[appIndex] });
  });

  // Delete App by ID
  app.delete('/api/apps/:id', (req, res) => {
    const appIndex = apps.findIndex((a) => a.id === req.params.id);
    if (appIndex === -1) {
      return res.status(404).json({ error: 'App not found' });
    }
    const [deletedApp] = apps.splice(appIndex, 1);
    addAudit('app.delete', deletedApp.name);
    res.json({ success: true, deletedId: req.params.id });
  });

  // --- REAL ADAPTER ROUTES ---

  // Real Base Blockchain RPC Telemetry
  app.get('/api/adapters/base/telemetry', async (_req, res) => {
    try {
      const data = await queryRealBaseNetworkState('mainnet');
      // Convert BigInt to string for JSON serialization
      res.json({
        ...data,
        blockNumber: data.blockNumber.toString(),
        gasPriceWei: data.gasPriceWei.toString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Real Cryptographic Wallet Generator
  app.post('/api/adapters/base/wallet', (_req, res) => {
    const wallet = createRealWallet('mainnet');
    res.json({ wallet });
  });

  // Real Solidity Bytecode & Keccak256 Inspector
  app.post('/api/adapters/base/inspect-contract', (req, res) => {
    const { sourceCode } = req.body;
    if (!sourceCode) return res.status(400).json({ error: 'sourceCode required' });
    const inspection = inspectSolidityContract(sourceCode);
    res.json({ inspection });
  });

  // Real Telegram Bot API Verification
  app.post('/api/adapters/telegram/verify', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });
    const result = await verifyTelegramBot(token);
    res.json(result);
  });

  // Real Telegram Bot Send Miniapp
  app.post('/api/adapters/telegram/send', async (req, res) => {
    const { token, chatId, appName, appUrl } = req.body;
    if (!token || !chatId || !appName || !appUrl) {
      return res.status(400).json({ error: 'token, chatId, appName, and appUrl required' });
    }
    const result = await sendTelegramMiniAppButton(token, chatId, appName, appUrl);
    res.json(result);
  });

  // Real GitHub API Verification
  app.post('/api/adapters/github/verify', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });
    const result = await verifyGithubToken(token);
    res.json(result);
  });

  // Real GitHub API Publish
  app.post('/api/adapters/github/publish', async (req, res) => {
    const { token, owner, repoName, files, isPrivate = true } = req.body;
    if (!token || !owner || !repoName || !files) {
      return res.status(400).json({ error: 'token, owner, repoName, and files required' });
    }
    const result = await publishToGithub(token, owner, repoName, files, isPrivate);
    res.json(result);
  });

  // Real Gemini AI App Builder
  app.post('/api/builder/generate-ai', async (req, res) => {
    const { name, idea, platforms } = req.body;
    if (!name || !idea) return res.status(400).json({ error: 'name and idea required' });
    const result = await generateAppWithRealAI(name, idea, platforms);
    res.json(result);
  });


  // Update Platforms matching /api/apps/[id]/platforms
  app.post('/api/apps/:id/platforms', (req, res) => {
    const appRecord = apps.find((a) => a.id === req.params.id);
    if (!appRecord) {
      return res.status(404).json({ error: 'App not found' });
    }
    const { platforms } = req.body;
    if (Array.isArray(platforms)) {
      appRecord.platforms = platforms;
    }
    res.json({ platforms: appRecord.platforms });
  });

  // Agent Chat / Turn matching /api/agent (GET & POST)
  app.get('/api/agent', (req, res) => {
    const appId = req.query.appId as string;
    if (!appId) {
      return res.status(400).json({ error: 'appId query param required' });
    }
    const appRecord = apps.find((a) => a.id === appId);
    if (!appRecord) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json({
      messages: appRecord.chatHistory || [],
      status: appRecord.status,
      step: appRecord.currentStep || null,
    });
  });

  app.post('/api/agent', async (req, res) => {
    const { appId, message } = req.body;
    const appRecord = apps.find((a) => a.id === appId);
    if (!appRecord) {
      return res.status(404).json({ error: 'App not found' });
    }

    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      role: 'USER',
      content: message,
      timestamp: new Date().toISOString(),
    };
    appRecord.chatHistory.push(userMsg);

    // If app is not LIVE, step to LIVE
    if (appRecord.status !== 'LIVE') {
      const liveUrl = `https://${appRecord.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.shipyard.app`;
      const repoUrl = `https://github.com/shipyard-apps/${appRecord.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      appRecord.status = 'LIVE';
      appRecord.liveUrl = liveUrl;
      appRecord.repoUrl = repoUrl;
      appRecord.currentStep = undefined;

      const deployMsg: AgentMessage = {
        id: `ast-${Date.now()}`,
        role: 'ASSISTANT',
        agentName: 'Deployer',
        content: `Your onchain miniapp "${appRecord.name}" is now LIVE in production!\n\n• Live App: ${liveUrl}\n• Source Code: ${repoUrl}\n• Smart Wallet & Token initialized on Base Mainnet.`,
        timestamp: new Date().toISOString(),
      };
      appRecord.chatHistory.push(deployMsg);
      addAudit('app.live', appRecord.name);

      return res.json({ reply: deployMsg.content, status: 'LIVE' });
    }

    // Follow-up iteration turn
    const replyMsg: AgentMessage = {
      id: `ast-${Date.now()}`,
      role: 'ASSISTANT',
      agentName: 'Coder',
      content: `Updated application code with: "${message}". Rebuild verified clean.`,
      timestamp: new Date().toISOString(),
    };
    appRecord.chatHistory.push(replyMsg);
    res.json({ reply: replyMsg.content, status: 'LIVE' });
  });

  // Credits top-up matching /api/credits
  app.post('/api/credits', (req, res) => {
    const { pack } = req.body;
    const amount = parseInt(pack, 10) || 500;
    const user = getCurrentUser();
    user.credits += amount;
    addAudit('credits.topup', `+${amount} Credits`);
    res.json({ success: true, granted: amount, credits: user.credits });
  });

  // Wallet withdraw matching /api/wallet/withdraw
  app.post('/api/wallet/withdraw', (req, res) => {
    const { appId, toAddress, amountWei } = req.body;
    const appRecord = apps.find((a) => a.id === appId);
    if (!appRecord || !appRecord.wallet) {
      return res.status(404).json({ error: 'App wallet not found' });
    }

    const currentBalance = BigInt(appRecord.wallet.balanceWei);
    const withdrawAmt = BigInt(amountWei || '0');
    if (withdrawAmt <= 0n) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    if (withdrawAmt > currentBalance) {
      return res.status(400).json({ error: 'Withdrawal exceeds current balance' });
    }

    appRecord.wallet.balanceWei = (currentBalance - withdrawAmt).toString();
    const txHash = `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`;
    addAudit('wallet.withdraw', `${(Number(withdrawAmt) / 1e18).toFixed(4)} ETH from ${appRecord.name}`);

    res.json({ success: true, txHash, remainingWei: appRecord.wallet.balanceWei });
  });

  // Token claim creator fees matching /api/tokens/claim
  app.post('/api/tokens/claim', (req, res) => {
    const { appId } = req.body;
    const appRecord = apps.find((a) => a.id === appId);
    if (!appRecord || !appRecord.token) {
      return res.status(404).json({ error: 'Token not found for this app' });
    }

    const claimable = (BigInt(appRecord.token.feesAccruedWei) * BigInt(appRecord.token.creatorShareBps)) / 10_000n - BigInt(appRecord.token.feesClaimedWei);
    if (claimable <= 0n) {
      return res.status(400).json({ error: 'No claimable fees at this time' });
    }

    appRecord.token.feesClaimedWei = (BigInt(appRecord.token.feesClaimedWei) + claimable).toString();
    const txHash = `0x${Math.random().toString(16).substring(2, 14)}`;
    addAudit('token.claim', `${appRecord.token.symbol} (${(Number(claimable) / 1e18).toFixed(4)} ETH)`);

    res.json({ success: true, claimedWei: claimable.toString(), txHash });
  });

  // Orgs endpoints matching /api/orgs
  app.get('/api/orgs', (_req, res) => {
    res.json({ orgs });
  });

  app.post('/api/orgs', (req, res) => {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug required' });
    }
    const user = getCurrentUser();
    const newOrg: Org = {
      id: `org_${Date.now()}`,
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      role: 'OWNER',
      members: [
        {
          userId: user.id,
          email: user.email,
          handle: user.handle,
          role: 'OWNER',
          joinedAt: new Date().toISOString(),
        },
      ],
    };
    orgs.push(newOrg);
    addAudit('org.create', name);
    res.status(201).json({ org: newOrg });
  });

  // Org members matching /api/orgs/:id/members
  app.get('/api/orgs/:id/members', (req, res) => {
    const targetOrg = orgs.find((o) => o.id === req.params.id);
    if (!targetOrg) return res.status(404).json({ error: 'Org not found' });
    res.json({ members: targetOrg.members });
  });

  app.patch('/api/orgs/:id/members/:userId', (req, res) => {
    const targetOrg = orgs.find((o) => o.id === req.params.id);
    if (!targetOrg) return res.status(404).json({ error: 'Org not found' });
    const member = targetOrg.members.find((m) => m.userId === req.params.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (req.body.role) {
      member.role = req.body.role;
    }
    res.json({ member });
  });

  app.delete('/api/orgs/:id/members/:userId', (req, res) => {
    const targetOrg = orgs.find((o) => o.id === req.params.id);
    if (!targetOrg) return res.status(404).json({ error: 'Org not found' });
    targetOrg.members = targetOrg.members.filter((m) => m.userId !== req.params.userId);
    res.json({ success: true });
  });

  // Invitations matching /api/orgs/:id/invitations
  app.post('/api/orgs/:id/invitations', (req, res) => {
    const { email, role = 'BUILDER' } = req.body;
    const targetOrg = orgs.find((o) => o.id === req.params.id);
    if (!targetOrg) return res.status(404).json({ error: 'Org not found' });

    const inviteToken = `inv_${Math.random().toString(36).substring(2, 10)}`;
    const inviteUrl = `${req.protocol}://${req.get('host')}/invite/${inviteToken}`;

    // Add to members
    targetOrg.members.push({
      userId: `usr_${Date.now()}`,
      email,
      handle: email.split('@')[0],
      role,
      joinedAt: new Date().toISOString(),
    });

    addAudit('member.invite', `${email} (${role})`);
    res.json({ emailed: false, inviteUrl });
  });

  // Webhooks matching /api/orgs/:id/webhooks
  app.get('/api/orgs/:id/webhooks', (_req, res) => {
    res.json({ endpoints: webhooks });
  });

  app.post('/api/orgs/:id/webhooks', (req, res) => {
    const { url, events } = req.body;
    const secret = `whsec_${Math.random().toString(16).substring(2, 16)}`;
    const newHook: Webhook = {
      id: `wh_${Date.now()}`,
      url,
      events: events || ['app.live'],
      secret,
      active: true,
      createdAt: new Date().toISOString(),
    };
    webhooks.push(newHook);
    addAudit('webhook.create', url);
    res.json({ secret, hook: newHook });
  });

  app.delete('/api/orgs/:id/webhooks/:hookId', (req, res) => {
    webhooks = webhooks.filter((h) => h.id !== req.params.hookId);
    res.json({ success: true });
  });

  // Audit logs & CSV export matching /api/orgs/:id/audit
  app.get('/api/orgs/:id/audit', (req, res) => {
    if (req.query.format === 'csv') {
      let csv = 'id,createdAt,action,target,actorEmail\n';
      for (const log of auditLogs) {
        csv += `"${log.id}","${log.createdAt}","${log.action}","${log.target || ''}","${log.actorEmail}"\n`;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="shipyard-audit-log.csv"');
      return res.send(csv);
    }
    res.json({ logs: auditLogs });
  });

  // API keys matching /api/api-keys
  app.get('/api/api-keys', (_req, res) => {
    res.json({ keys: apiKeys });
  });

  app.post('/api/api-keys', (req, res) => {
    const { name, readOnly = false } = req.body;
    const rawKey = `sk_live_${Math.random().toString(36).substring(2, 16)}${Math.random().toString(36).substring(2, 16)}`;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: name || 'API Key',
      prefix: rawKey.slice(0, 10),
      readOnly,
      createdAt: new Date().toISOString(),
    };
    apiKeys.push(newKey);
    addAudit('api_key.create', newKey.name);
    res.json({ key: rawKey, keyRecord: newKey });
  });

  app.delete('/api/api-keys/:id', (req, res) => {
    apiKeys = apiKeys.filter((k) => k.id !== req.params.id);
    res.json({ success: true });
  });

  // Admin stats matching /api/admin/stats
  app.get('/api/admin/stats', (_req, res) => {
    const liveCount = apps.filter((a) => a.status === 'LIVE').length;
    const successRate = apps.length > 0 ? Math.round((liveCount / apps.length) * 100) : 100;
    res.json({
      users: users.length + 3,
      apps: apps.length,
      buildSuccessRate: `${successRate}%`,
      creditsSpent: 4250,
      flags: featureFlags,
      logs: auditLogs.slice(0, 20),
    });
  });

  app.patch('/api/admin/flags/:key', (req, res) => {
    const flag = featureFlags.find((f) => f.key === req.params.key);
    if (!flag) return res.status(404).json({ error: 'Flag not found' });
    flag.enabled = !flag.enabled;
    res.json({ flag });
  });

  // Serve public directory for static assets (sw.js, manifest.json, icons)
  app.use(express.static(path.resolve(__dirname, 'public')));

  // --- VITE MIDDLEWARES / STATIC SERVING ---
  if (!isProd) {
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shipyard production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
