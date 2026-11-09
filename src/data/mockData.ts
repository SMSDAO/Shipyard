import { ShipyardApp, User, Org, FeatureFlag, AuditLog, ApiKey, Webhook } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_gxqstudio',
    email: 'gxqstudio@gmail.com',
    handle: 'gxqstudio.eth',
    displayName: 'Lead Web3 Architect (Admin)',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Web3 & DevOps Systems Architect for SMSDAO/Shipyard. Overseeing multi-chain RPC provider failovers (Base L2, Arbitrum One, Polygon, Ethereum, Solana) and zero-drift deployment engine.',
    credits: 99999,
    role: 'OWNER',
    isSuperAdmin: true,
    walletAddress: '0x89A89c72E26E55D02aB56B98492062d5cD27f27A',
    telegramHandle: 'gxqstudio',
    githubUsername: 'SMSDAO',
    preferredNetwork: 'Base Mainnet',
    notificationsEnabled: true,
    emailNotifications: true,
    deploymentAlerts: true,
    themePreference: 'neon',
    customRpcUrl: 'https://mainnet.base.org',
  },
  {
    id: 'usr_alice',
    email: 'alice@shipyard.local',
    handle: 'alice.eth',
    displayName: 'Alice Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Full-stack onchain builder & founder. Building Farcaster mini-apps, Base liquidity tools, and autonomous agent swarms.',
    credits: 1450,
    role: 'OWNER',
    isSuperAdmin: false,
    walletAddress: '0x71C028b3F1e6B26c9135a57497d3419b13cda89F',
    telegramHandle: 'alice_onchain',
    githubUsername: 'alicevance',
    preferredNetwork: 'Base Mainnet',
    notificationsEnabled: true,
    emailNotifications: true,
    deploymentAlerts: true,
    themePreference: 'emerald',
    customRpcUrl: 'https://mainnet.base.org',
  },
  {
    id: 'usr_admin',
    email: 'admin@shipyard.local',
    handle: 'admin',
    displayName: 'System Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform architect overseeing multi-tenant security, smart contract audits, and node infra.',
    credits: 9999,
    role: 'OWNER',
    isSuperAdmin: true,
    walletAddress: '0x99A3143F1e6B26c9135a57497d3419b13cdc44B',
    telegramHandle: 'shipyard_sysadmin',
    githubUsername: 'shipyard-admin',
    preferredNetwork: 'Base Mainnet',
    notificationsEnabled: true,
    emailNotifications: false,
    deploymentAlerts: true,
    themePreference: 'neon',
    customRpcUrl: 'https://mainnet.base.org',
  },
  {
    id: 'usr_bob',
    email: 'bob@shipyard.local',
    handle: 'bob.base',
    displayName: 'Bob Martinez',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'Smart contract dev specializing in ERC-20 bonding curves and Telegram mini-app frontends.',
    credits: 320,
    role: 'BUILDER',
    isSuperAdmin: false,
    walletAddress: '0x33F89143F1e6B26c9135a57497d3419b13ce721',
    telegramHandle: 'bob_dev_base',
    githubUsername: 'bobmartinez',
    preferredNetwork: 'Base Sepolia',
    notificationsEnabled: false,
    emailNotifications: true,
    deploymentAlerts: true,
    themePreference: 'sapphire',
    customRpcUrl: 'https://sepolia.base.org',
  },
];

export const INITIAL_ORGS: Org[] = [
  {
    id: 'org_shipyard_labs',
    name: 'Shipyard Labs',
    slug: 'shipyard-labs',
    role: 'OWNER',
    members: [
      { userId: 'usr_alice', email: 'alice@shipyard.local', handle: 'alice.eth', role: 'OWNER', joinedAt: '2026-01-10T00:00:00Z' },
      { userId: 'usr_bob', email: 'bob@shipyard.local', handle: 'bob.base', role: 'BUILDER', joinedAt: '2026-02-15T00:00:00Z' },
      { userId: 'usr_carol', email: 'carol@design.xyz', handle: 'carol.art', role: 'VIEWER', joinedAt: '2026-03-01T00:00:00Z' },
    ],
  },
  {
    id: 'org_arcade_dao',
    name: 'Arcade DAO',
    slug: 'arcade-dao',
    role: 'ADMIN',
    members: [
      { userId: 'usr_alice', email: 'alice@shipyard.local', handle: 'alice.eth', role: 'ADMIN', joinedAt: '2026-02-01T00:00:00Z' },
      { userId: 'usr_admin', email: 'admin@shipyard.local', handle: 'admin', role: 'OWNER', joinedAt: '2026-01-01T00:00:00Z' },
    ],
  },
];

export const INITIAL_FEATURE_FLAGS: FeatureFlag[] = [
  { key: 'ai_agent_v2', label: 'AI Multi-Agent Pipeline v2', description: 'Enables deep chain-of-thought planning and dynamic contract verification.', enabled: true },
  { key: 'clanker_bonding_curve', label: 'Clanker / Base DEX Launch', description: 'Automatically deploys Uniswap v3 fee pools on Base when token launch is enabled.', enabled: true },
  { key: 'telegram_bot_gateway', label: 'Telegram Mini App Gateway', description: 'Direct webhook deployment to Telegram Bot API with instant inline query support.', enabled: true },
  { key: 'world_id_verification', label: 'World ID Sybil Defense', description: 'Adds World ID zero-knowledge proof verification badge on mint actions.', enabled: true },
  { key: 'strict_security_reviewer', label: 'Strict Reviewer AST Analysis', description: 'Enforces static regex rejection for any external child processes, eval, or tx.origin.', enabled: true },
];

export const INITIAL_API_KEYS: ApiKey[] = [
  { id: 'key_1', name: 'CI/CD Automated Deployer', prefix: 'sk_live_948f', readOnly: false, createdAt: '2026-02-20T14:22:00Z', lastUsedAt: '2026-10-25T09:15:00Z' },
  { id: 'key_2', name: 'Analytics Worker Read-Only', prefix: 'sk_live_38bf', readOnly: true, createdAt: '2026-03-05T11:40:00Z', lastUsedAt: '2026-10-27T18:00:00Z' },
];

export const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: 'wh_1',
    url: 'https://api.shipyard-labs.com/hooks/deployments',
    events: ['app.live', 'token.launched', 'funds.withdrawn'],
    secret: 'whsec_994b28ff40e21a7c8b0e51382410a',
    active: true,
    createdAt: '2026-02-22T10:00:00Z',
    lastDelivery: {
      success: true,
      status: 200,
      timestamp: '2026-10-27T20:15:00Z',
      payloadSnippet: '{"event":"app.live","appId":"app_pixel_arcade","timestamp":"2026-10-27T20:15:00Z"}',
    },
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log_1', action: 'app.create', target: 'Pixel Arcade', actorEmail: 'alice@shipyard.local', createdAt: '2026-10-27T20:10:00Z', orgId: 'org_shipyard_labs' },
  { id: 'log_2', action: 'build.deploy', target: 'Pixel Arcade (LIVE)', actorEmail: 'deployer-agent@shipyard.internal', createdAt: '2026-10-27T20:14:00Z', orgId: 'org_shipyard_labs' },
  { id: 'log_3', action: 'token.launch', target: '$PIXEL on Base', actorEmail: 'deployer-agent@shipyard.internal', createdAt: '2026-10-27T20:14:30Z', orgId: 'org_shipyard_labs' },
  { id: 'log_4', action: 'api_key.create', target: 'CI/CD Automated Deployer', actorEmail: 'alice@shipyard.local', createdAt: '2026-10-25T14:22:00Z', orgId: 'org_shipyard_labs' },
  { id: 'log_5', action: 'credits.topup', target: '+500 Credits ($25.00)', actorEmail: 'alice@shipyard.local', createdAt: '2026-10-24T18:30:00Z', orgId: 'org_shipyard_labs' },
];

export const INITIAL_APPS: ShipyardApp[] = [
  {
    id: 'app_pixel_arcade',
    name: 'Pixel Arcade',
    idea: 'A retro cyberpunk arcade miniapp with onchain high scores on Base, weekly prize pools, and 1-click Farcaster Frame play.',
    status: 'LIVE',
    isPublic: true,
    ownerId: 'usr_alice',
    ownerEmail: 'alice@shipyard.local',
    createdAt: '2026-10-25T12:00:00Z',
    updatedAt: '2026-10-27T20:15:00Z',
    opens: 14290,
    uniqueUsers: 3840,
    revenueCents: 34500, // $345.00
    liveUrl: 'https://pixel-arcade.shipyard.app',
    repoUrl: 'https://github.com/shipyard-apps/pixel-arcade',
    category: 'Arcade',
    plan: {
      needsContracts: true,
      launchToken: true,
      tokenSymbol: 'PIXEL',
      theme: 'Retro Emerald Neon',
      platforms: ['WEB', 'FARCASTER', 'BASE'],
    },
    wallet: {
      id: 'wal_pixel',
      address: '0x8391bC3F052eA6b107e3Db6e4a29aB9e25d48123',
      balanceWei: '1420000000000000000', // 1.42 ETH
      network: 'Base Mainnet',
    },
    token: {
      id: 'tok_pixel',
      symbol: 'PIXEL',
      name: 'Pixel Arcade Token',
      feesAccruedWei: '840000000000000000', // 0.84 ETH
      feesClaimedWei: '200000000000000000', // 0.2 ETH
      creatorShareBps: 6000, // 60%
      contractAddress: '0x49e1aF28d09B7520e54d6D84aF3D8321B35e6D1a',
      pairAddress: '0x8b320d3a7719B5a92d8D03aB8e4f552912a7681C',
      priceUsd: 0.042,
    },
    platforms: [
      { kind: 'WEB', enabled: true, config: { domain: 'pixel-arcade.shipyard.app' } },
      { kind: 'FARCASTER', enabled: true, config: { frameUrl: 'https://pixel-arcade.shipyard.app/api/frame' } },
      { kind: 'BASE', enabled: true, config: { chainId: '8453' } },
      { kind: 'TELEGRAM', enabled: false },
      { kind: 'WORLD', enabled: false },
      { kind: 'CELO', enabled: false },
    ],
    builds: [
      { id: 'bld_1', status: 'SUCCESS', step: 'Deployed to Base Mainnet & Vercel', startedAt: '2026-10-25T12:00:00Z', completedAt: '2026-10-25T12:03:12Z' },
    ],
    chatHistory: [
      { id: 'msg_1', role: 'USER', content: 'A retro arcade game with onchain high scores and weekly prize pools for the top players.', timestamp: '2026-10-25T12:00:00Z' },
      {
        id: 'msg_2',
        role: 'ASSISTANT',
        agentName: 'Planner',
        content: `I've analyzed your retro arcade idea.
1. Target Platform: Base L2 + Farcaster Frame for zero-friction browser play.
2. Smart Contracts: High score leaderboard contract with anti-tamper signature checks and automated weekly escrow payouts.
3. Token: $PIXEL token with 60% creator fee share on liquidity volume.
Plan locked: proceeding to Brand Design.`,
        timestamp: '2026-10-25T12:00:45Z',
      },
      {
        id: 'msg_3',
        role: 'ASSISTANT',
        agentName: 'Designer',
        content: `Brand kit compiled:
- Theme: Retro Emerald Neon & Glass Dark UI
- Typography: Press Start / Inter Mono
- Icon: Pixel spaceship badge with glowing emerald shield.`,
        timestamp: '2026-10-25T12:01:20Z',
      },
      {
        id: 'msg_4',
        role: 'ASSISTANT',
        agentName: 'Coder',
        content: `Generated full Next.js 15 App Router codebase:
- app/page.tsx: Interactive Canvas game engine with sound effects, particle blasts, and high score submission.
- contracts/ArcadeLeaderboard.sol: Gas-optimized leaderboard contract on Base.
- app/api/frame/route.ts: Farcaster v2 interactive miniapp frame.`,
        timestamp: '2026-10-25T12:02:10Z',
      },
      {
        id: 'msg_5',
        role: 'ASSISTANT',
        agentName: 'Reviewer',
        content: `Static review passed with 0 errors, 0 warnings.
- SAFE: No private key leaks detected.
- SAFE: No dangerous eval() or child_process invocations.
- SAFE: Smart contract authorization avoids tx.origin.
- SAFE: File paths strictly validated.`,
        timestamp: '2026-10-25T12:02:40Z',
      },
      {
        id: 'msg_6',
        role: 'ASSISTANT',
        agentName: 'Deployer',
        content: `All systems go!
✓ GitHub repository created: shipyard-apps/pixel-arcade
✓ Vercel edge deployment live: https://pixel-arcade.shipyard.app
✓ App smart wallet funded: 0x8391...8123 (1.42 ETH)
✓ $PIXEL token initialized on Base Uniswap pool.`,
        timestamp: '2026-10-25T12:03:12Z',
      },
    ],
    reviewReport: {
      ok: true,
      issues: [],
      passedChecks: [
        'No secret key patterns or private keys exposed',
        'No eval() or dynamic Function() execution',
        'No Node.js child_process in client bundles',
        'No tx.origin authorization flaw in Solidity',
        'All file paths meet strict containment rules',
        'Next.js 15 bundle size within 500KB budget',
      ],
    },
    files: [
      {
        path: 'app/page.tsx',
        language: 'typescript',
        content: `"use client";
import React, { useState, useEffect, useRef } from "react";

export default function ArcadeGame() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(4820);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("0x71C...a89F");

  return (
    <div className="min-h-screen bg-zinc-950 text-emerald-400 p-6 flex flex-col items-center">
      <header className="w-full max-w-xl flex justify-between items-center border-b border-emerald-900/60 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-300">PIXEL ARCADE</h1>
          <p className="text-xs text-emerald-600">Base Mainnet · Leaderboard Edition</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-500 block">CONNECTED WALLET</span>
          <span className="font-mono text-sm bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">{connectedAddress}</span>
        </div>
      </header>

      {/* Arcade Screen Canvas */}
      <div className="w-full max-w-xl my-6 bg-black border-2 border-emerald-500/40 rounded-xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <div className="flex justify-between text-sm font-mono mb-2">
          <span>SCORE: {score}</span>
          <span>HIGH: {highScore}</span>
        </div>
        <div className="h-64 flex flex-col items-center justify-center border border-emerald-900/40 rounded bg-zinc-900/40">
          {!isPlaying ? (
            <div className="text-center space-y-3">
              <p className="text-lg font-bold text-white">READY PLAYER ONE</p>
              <button 
                onClick={() => { setIsPlaying(true); setScore(120); }} 
                className="px-6 py-2 bg-emerald-500 text-black font-black rounded-lg shadow-lg hover:bg-emerald-400">
                START MISSION
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-3xl animate-bounce">👾 💥 🚀</div>
              <p className="text-sm">Blasting enemy crypto invaders...</p>
              <button onClick={() => setScore(s => s + 350)} className="px-4 py-1.5 bg-emerald-900/70 text-emerald-200 border border-emerald-500 rounded text-xs">
                TAP TO FIRE LASER (+350 PTS)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`,
      },
      {
        path: 'contracts/ArcadeScoreLeaderboard.sol',
        language: 'solidity',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Pixel Arcade High Score Leaderboard & Fee Splitter on Base
contract ArcadeScoreLeaderboard {
    address public immutable creator;
    address public immutable platform;
    uint256 public constant CREATOR_SHARE_BPS = 6000; // 60%

    struct ScoreEntry {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    ScoreEntry[] public topScores;
    mapping(address => uint256) public playerBests;

    event NewHighScore(address indexed player, uint256 score);

    constructor(address _creator, address _platform) {
        require(_creator != address(0) && _platform != address(0), "Invalid addresses");
        creator = _creator;
        platform = _platform;
    }

    function submitScore(uint256 score) external payable {
        if (score > playerBests[msg.sender]) {
            playerBests[msg.sender] = score;
            topScores.push(ScoreEntry(msg.sender, score, block.timestamp));
            emit NewHighScore(msg.sender, score);
        }

        if (msg.value > 0) {
            uint256 creatorCut = (msg.value * CREATOR_SHARE_BPS) / 10000;
            uint256 platformCut = msg.value - creatorCut;
            (bool s1, ) = creator.call{value: creatorCut}("");
            (bool s2, ) = platform.call{value: platformCut}("");
            require(s1 && s2, "Payout failed");
        }
    }
}`,
      },
      {
        path: 'farcaster.json',
        language: 'json',
        content: `{
  "accountAssociation": {
    "header": "eyJmaWQiOjk5MzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhiNTc4...\"}",
    "payload": "eyJkb21haW4iOiJwaXhlbC1hcmNhZGUuc2hpcHlhcmQuYXBwIn0",
    "signature": "MHg2ODkzZjEzOWE..."
  },
  "frame": {
    "version": "1",
    "name": "Pixel Arcade",
    "iconUrl": "https://pixel-arcade.shipyard.app/icon.png",
    "homeUrl": "https://pixel-arcade.shipyard.app",
    "imageUrl": "https://pixel-arcade.shipyard.app/og.png",
    "buttonTitle": "Play Arcade",
    "splashImageUrl": "https://pixel-arcade.shipyard.app/splash.png",
    "splashBackgroundColor": "#04110d"
  }
}`,
      },
    ],
  },
  {
    id: 'app_tipbot',
    name: 'TipJar Telegram Bot',
    idea: 'A zero-fee tipping bot for Telegram groups that lets members tip creators micro-amounts in ETH or USDC with animated celebration stickers.',
    status: 'LIVE',
    isPublic: true,
    ownerId: 'usr_alice',
    ownerEmail: 'alice@shipyard.local',
    createdAt: '2026-10-26T08:30:00Z',
    updatedAt: '2026-10-27T16:00:00Z',
    opens: 8920,
    uniqueUsers: 2450,
    revenueCents: 41500,
    liveUrl: 'https://tipjar.shipyard.app',
    repoUrl: 'https://github.com/shipyard-apps/tipjar-bot',
    category: 'Tipping',
    plan: {
      needsContracts: true,
      launchToken: true,
      tokenSymbol: 'TIPS',
      theme: 'Telegram Cyan & Mint',
      platforms: ['WEB', 'TELEGRAM', 'BASE'],
    },
    wallet: {
      id: 'wal_tipjar',
      address: '0x12a9c402Db5b2729a67C5239a54aD0B7C632e88B',
      balanceWei: '2150000000000000000', // 2.15 ETH
      network: 'Base Mainnet',
    },
    token: {
      id: 'tok_tips',
      symbol: 'TIPS',
      name: 'TipJar Reward Token',
      feesAccruedWei: '1200000000000000000',
      feesClaimedWei: '600000000000000000',
      creatorShareBps: 6000,
      contractAddress: '0x9924a68CdB2a8439dE77114E15626F22754d92Fa',
      priceUsd: 0.125,
    },
    platforms: [
      { kind: 'WEB', enabled: true },
      { kind: 'TELEGRAM', enabled: true, config: { botUsername: 'ShipyardTipBot' } },
      { kind: 'BASE', enabled: true },
      { kind: 'FARCASTER', enabled: false },
      { kind: 'WORLD', enabled: false },
      { kind: 'CELO', enabled: false },
    ],
    builds: [
      { id: 'bld_tip', status: 'SUCCESS', step: 'Live on Telegram Gateway', startedAt: '2026-10-26T08:30:00Z', completedAt: '2026-10-26T08:32:45Z' },
    ],
    chatHistory: [
      { id: 'm1', role: 'USER', content: 'A tipping bot for Telegram groups with micro-tips and instant payouts.', timestamp: '2026-10-26T08:30:00Z' },
      { id: 'm2', role: 'ASSISTANT', agentName: 'Planner', content: 'Formulated Telegram bot with Base smart contract escrow and $TIPS token incentives.', timestamp: '2026-10-26T08:30:30Z' },
      { id: 'm3', role: 'ASSISTANT', agentName: 'Deployer', content: 'Telegram webhook configured and verified. Live at @ShipyardTipBot.', timestamp: '2026-10-26T08:32:45Z' },
    ],
    reviewReport: {
      ok: true,
      issues: [],
      passedChecks: ['All security requirements satisfied.'],
    },
    files: [
      {
        path: 'app/api/telegram/route.ts',
        language: 'typescript',
        content: `// Telegram Bot Webhook endpoint\nexport async function POST(req: Request) {\n  const body = await req.json();\n  // Handle /tip @username 5\n  return Response.json({ ok: true, status: "handled" });\n}`,
      },
    ],
  },
  {
    id: 'app_memecraft',
    name: 'MemeCraft Studio',
    idea: 'Turn text prompts into viral onchain memes, auto-minted with creator royalties on Base and shareable directly inside Farcaster Feeds.',
    status: 'LIVE',
    isPublic: true,
    ownerId: 'usr_bob',
    ownerEmail: 'bob@shipyard.local',
    createdAt: '2026-10-26T15:20:00Z',
    updatedAt: '2026-10-27T11:00:00Z',
    opens: 5610,
    uniqueUsers: 1890,
    revenueCents: 19800,
    liveUrl: 'https://memecraft.shipyard.app',
    repoUrl: 'https://github.com/shipyard-apps/memecraft',
    category: 'Meme',
    plan: {
      needsContracts: true,
      launchToken: true,
      tokenSymbol: 'MEME',
      theme: 'Vibrant Neon Glass',
      platforms: ['WEB', 'FARCASTER', 'BASE'],
    },
    wallet: {
      id: 'wal_meme',
      address: '0x448aB01314B2a62885cD9f471aD0b754e38eE811',
      balanceWei: '890000000000000000',
      network: 'Base Mainnet',
    },
    token: {
      id: 'tok_meme',
      symbol: 'MEME',
      name: 'MemeCraft Token',
      feesAccruedWei: '510000000000000000',
      feesClaimedWei: '100000000000000000',
      creatorShareBps: 6000,
      contractAddress: '0x17aB724213B2a62885cD9f471aD0b754e38eE231',
      priceUsd: 0.018,
    },
    platforms: [
      { kind: 'WEB', enabled: true },
      { kind: 'FARCASTER', enabled: true },
      { kind: 'BASE', enabled: true },
      { kind: 'TELEGRAM', enabled: false },
      { kind: 'WORLD', enabled: false },
      { kind: 'CELO', enabled: false },
    ],
    builds: [
      { id: 'bld_meme', status: 'SUCCESS', step: 'Live on Farcaster Frame v2', startedAt: '2026-10-26T15:20:00Z', completedAt: '2026-10-26T15:23:00Z' },
    ],
    chatHistory: [],
    files: [],
  },
  {
    id: 'app_base_bounty',
    name: 'Base Bounty Board',
    idea: 'A developer micro-bounty escrow protocol. Post bounties on GitHub issues; funds are released atomically when PR is merged.',
    status: 'LIVE',
    isPublic: true,
    ownerId: 'usr_alice',
    ownerEmail: 'alice@shipyard.local',
    createdAt: '2026-10-24T18:00:00Z',
    updatedAt: '2026-10-27T09:00:00Z',
    opens: 3240,
    uniqueUsers: 940,
    revenueCents: 12400,
    liveUrl: 'https://base-bounty.shipyard.app',
    repoUrl: 'https://github.com/shipyard-apps/base-bounty',
    category: 'DeFi',
    plan: {
      needsContracts: true,
      launchToken: false,
      platforms: ['WEB', 'BASE'],
    },
    wallet: {
      id: 'wal_bounty',
      address: '0x627B01314B2a62885cD9f471aD0b754e38e89A2',
      balanceWei: '540000000000000000',
      network: 'Base Mainnet',
    },
    platforms: [
      { kind: 'WEB', enabled: true },
      { kind: 'BASE', enabled: true },
      { kind: 'FARCASTER', enabled: false },
      { kind: 'TELEGRAM', enabled: false },
      { kind: 'WORLD', enabled: false },
      { kind: 'CELO', enabled: false },
    ],
    builds: [],
    files: [],
    chatHistory: [],
  },
];
