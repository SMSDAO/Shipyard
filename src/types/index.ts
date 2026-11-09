export type AppStatus = 
  | 'DRAFT' 
  | 'PLANNING' 
  | 'DESIGNING' 
  | 'CODING' 
  | 'REVIEWING' 
  | 'DEPLOYING' 
  | 'LIVE' 
  | 'FAILED';

export type PlatformKind = 'WEB' | 'FARCASTER' | 'TELEGRAM' | 'WORLD' | 'CELO' | 'BASE';

export interface PlatformConfig {
  kind: PlatformKind;
  enabled: boolean;
  config?: Record<string, string>;
}

export interface AppWallet {
  id: string;
  address: string;
  balanceWei: string;
  network: string;
}

export interface AppToken {
  id: string;
  symbol: string;
  name: string;
  feesAccruedWei: string;
  feesClaimedWei: string;
  creatorShareBps: number; // e.g. 6000 = 60%
  contractAddress: string;
  pairAddress?: string;
  priceUsd?: number;
}

export interface BuildJob {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  step: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface AgentMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  timestamp: string;
  agentName?: 'Planner' | 'Designer' | 'Coder' | 'Reviewer' | 'Deployer';
  actionTaken?: string;
}

export interface ReviewIssue {
  file: string;
  severity: 'error' | 'warn';
  message: string;
}

export interface ReviewReport {
  ok: boolean;
  issues: ReviewIssue[];
  passedChecks: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface BuildPlan {
  needsContracts: boolean;
  launchToken: boolean;
  tokenSymbol?: string;
  theme?: string;
  platforms?: PlatformKind[];
}

export interface ShipyardApp {
  id: string;
  name: string;
  idea: string;
  status: AppStatus;
  isPublic: boolean;
  ownerId: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  opens: number;
  uniqueUsers: number;
  revenueCents: number;
  liveUrl?: string;
  repoUrl?: string;
  wallet?: AppWallet;
  token?: AppToken;
  platforms: PlatformConfig[];
  builds: BuildJob[];
  files: GeneratedFile[];
  reviewReport?: ReviewReport;
  chatHistory: AgentMessage[];
  currentStep?: string;
  plan?: BuildPlan;
  category?: 'Arcade' | 'Tipping' | 'Meme' | 'DeFi' | 'Social' | 'NFT';
  previewHtml?: string;
  deploymentPhase?: 'COMPILING' | 'TESTING' | 'AUDITING' | 'ONCHAIN' | 'LIVE';
  themeSetting?: 'emerald' | 'neon' | 'gold' | 'sapphire';
}

export type DeploymentPhase = 'COMPILING' | 'TESTING' | 'AUDITING' | 'ONCHAIN' | 'LIVE';

export type OrgRole = 'OWNER' | 'ADMIN' | 'BUILDER' | 'VIEWER';

export interface OrgMember {
  userId: string;
  email: string;
  handle: string;
  role: OrgRole;
  joinedAt: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
  members: OrgMember[];
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastDelivery?: {
    success: boolean;
    status: number;
    timestamp: string;
    payloadSnippet?: string;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  fullKey?: string;
  readOnly: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  target?: string;
  actorEmail: string;
  createdAt: string;
  orgId?: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  handle: string;
  credits: number;
  role: OrgRole;
  isSuperAdmin: boolean;
  walletAddress?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  telegramHandle?: string;
  githubUsername?: string;
  preferredNetwork?: 'Base Mainnet' | 'Base Sepolia' | 'Optimism' | 'Arbitrum';
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  deploymentAlerts?: boolean;
  themePreference?: 'emerald' | 'neon' | 'gold' | 'sapphire';
  customRpcUrl?: string;
}
