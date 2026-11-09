export interface SecurityVulnerability {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  title: string;
  description: string;
  lineNumber?: number;
}

export class SolidityStaticAnalyzer {
  public static analyze(sourceCode: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = sourceCode.split("\n");

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // 1. Reentrancy Vulnerability Check
      if (line.includes(".call{value:") && !line.includes("nonReentrant")) {
        vulnerabilities.push({
          severity: "CRITICAL",
          title: "Potential Reentrancy Attack Risk",
          description: "Low-level call transferring value detected without explicit nonReentrant guard.",
          lineNumber: lineNum,
        });
      }

      // 2. Tx.origin Authorization Vulnerability
      if (line.includes("tx.origin")) {
        vulnerabilities.push({
          severity: "HIGH",
          title: "Use of tx.origin for Authentication",
          description: "tx.origin detected. Use msg.sender to prevent phishing attack vector exploits.",
          lineNumber: lineNum,
        });
      }

      // 3. Unchecked Return Values
      if (line.includes(".send(") || (line.includes(".call(") && !line.includes("require("))) {
        vulnerabilities.push({
          severity: "MEDIUM",
          title: "Unchecked Call Return Value",
          description: "The return value of an external call is not validated.",
          lineNumber: lineNum,
        });
      }

      // 4. Floating Pragma
      if (line.includes("pragma solidity ^") || line.includes("pragma solidity >")) {
        vulnerabilities.push({
          severity: "INFO",
          title: "Floating Compiler Pragma",
          description: "Lock compiler version (e.g. pragma solidity 0.8.24;) for deterministic builds.",
          lineNumber: lineNum,
        });
      }
    });

    return vulnerabilities;
  }
}
