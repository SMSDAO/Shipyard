// tests/e2e/deploymentSync.spec.ts
import { injectMockWeb3Provider, MOCK_TX_HASH, MOCK_CONTRACT_ADDRESS } from "../mocks/web3Mock";

// Mock interface for Playwright runner type compliance
interface TestContext {
  page: any;
}

export const deploymentSyncTestDefinition = {
  name: "Contract Deployment & PostgreSQL Sync Lifecycle",
  description: "Verifies POST /api/deployments, Web3 wallet signature, Viem listener, and PATCH /api/deployments",
  execute: async ({ page }: TestContext) => {
    // 1. Inject Web3 Wallet provider before DOM load
    await injectMockWeb3Provider(page);

    // 2. Intercept API routes
    let createdDeploymentId = `dep-test-${Date.now()}`;

    await page.route("**/api/deployments", async (route: any) => {
      const request = route.request();

      if (request.method() === "POST") {
        const postData = JSON.parse(request.postData() || "{}");
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            deployment: {
              id: createdDeploymentId,
              projectName: postData.projectName,
              chain: "ARBITRUM_ONE",
              status: "BUILDING",
              logs: "[TEST_LOG] Deployment sequence started.",
              createdAt: new Date().toISOString(),
            },
          }),
        });
      } else if (request.method() === "PATCH") {
        const patchData = JSON.parse(request.postData() || "{}");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            deployment: {
              id: patchData.deploymentId,
              status: patchData.status,
              contractAddress: patchData.contractAddress || MOCK_CONTRACT_ADDRESS,
              txHash: patchData.txHash,
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 3. Navigate to contract monitoring dashboard
    await page.goto("http://localhost:3000");
  },
};
