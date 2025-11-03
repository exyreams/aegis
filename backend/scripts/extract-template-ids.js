/**
 * Extract DAML template IDs from generated TypeScript bindings
 * Run after: daml build && daml codegen js
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.gray}${msg}${colors.reset}`),
};

const DAML_JS_PATH = path.join(__dirname, "../daml.js");
const ENV_FILE = path.join(__dirname, "../.env");

function findPackageDir() {
  if (!fs.existsSync(DAML_JS_PATH)) {
    throw new Error(
      `DAML JS directory not found: ${DAML_JS_PATH}\nRun: daml build && daml codegen js`
    );
  }

  const dirs = fs.readdirSync(DAML_JS_PATH);
  const packageDir = dirs.find((dir) => dir.startsWith("aegis-rfq-"));
  if (!packageDir) {
    throw new Error(
      "Could not find aegis-rfq package in daml.js directory\nRun: daml build && daml codegen js"
    );
  }
  return packageDir;
}

function extractTemplateIds() {
  try {
    const packageDir = findPackageDir();
    const libPath = path.join(DAML_JS_PATH, packageDir, "lib");

    const modules = [
      "RFQ",
      "Credit",
      "Collateral",
      "Syndication",
      "Yield",
      "SecondaryMarket",
      "Aegis",
      "AuditLog",
    ];
    const templateIds = {};

    for (const module of modules) {
      const modulePath = path.join(libPath, module, "module.js");

      if (!fs.existsSync(modulePath)) {
        log.warn(`Module file not found: ${modulePath} - skipping`);
        continue;
      }

      const moduleContent = fs.readFileSync(modulePath, "utf8");

      const templateIdRegex = /templateId:\s*'([^']+)'/g;
      let match;

      while ((match = templateIdRegex.exec(moduleContent)) !== null) {
        const fullId = match[1];
        const templateName = fullId.split(":").pop();
        templateIds[templateName] = fullId;
      }
    }

    if (Object.keys(templateIds).length === 0) {
      throw new Error("No template IDs found in any module files");
    }

    return templateIds;
  } catch (error) {
    log.error("Error extracting template IDs: " + error.message);
    process.exit(1);
  }
}

function updateEnvFile(templateIds) {
  const envVars = [];

  if (templateIds.RFQ) envVars.push(`DAML_TEMPLATE_RFQ=${templateIds.RFQ}`);
  if (templateIds.Bid) envVars.push(`DAML_TEMPLATE_BID=${templateIds.Bid}`);
  if (templateIds.Loan) envVars.push(`DAML_TEMPLATE_LOAN=${templateIds.Loan}`);
  if (templateIds.LoanProposal)
    envVars.push(`DAML_TEMPLATE_LOAN_PROPOSAL=${templateIds.LoanProposal}`);

  // Credit System Templates
  if (templateIds.CreditProfileContract)
    envVars.push(
      `DAML_TEMPLATE_CREDIT_PROFILE=${templateIds.CreditProfileContract}`
    );
  if (templateIds.RiskAssessment)
    envVars.push(`DAML_TEMPLATE_RISK_ASSESSMENT=${templateIds.RiskAssessment}`);
  if (templateIds.PortfolioRisk)
    envVars.push(`DAML_TEMPLATE_PORTFOLIO_RISK=${templateIds.PortfolioRisk}`);
  if (templateIds.CreditInquiry)
    envVars.push(`DAML_TEMPLATE_CREDIT_INQUIRY=${templateIds.CreditInquiry}`);
  if (templateIds.CreditInsurance)
    envVars.push(
      `DAML_TEMPLATE_CREDIT_INSURANCE=${templateIds.CreditInsurance}`
    );
  if (templateIds.CreditGuarantee)
    envVars.push(
      `DAML_TEMPLATE_CREDIT_GUARANTEE=${templateIds.CreditGuarantee}`
    );

  // Syndication Templates
  if (templateIds.SyndicatedLoan)
    envVars.push(`DAML_TEMPLATE_SYNDICATED_LOAN=${templateIds.SyndicatedLoan}`);
  if (templateIds.SyndicateDecisionVote)
    envVars.push(
      `DAML_TEMPLATE_SYNDICATE_VOTE=${templateIds.SyndicateDecisionVote}`
    );
  if (templateIds.SyndicateFormation)
    envVars.push(
      `DAML_TEMPLATE_SYNDICATE_FORMATION=${templateIds.SyndicateFormation}`
    );
  if (templateIds.SyndicateReport)
    envVars.push(
      `DAML_TEMPLATE_SYNDICATE_REPORT=${templateIds.SyndicateReport}`
    );

  // Collateral Management Templates
  if (templateIds.CollateralPool)
    envVars.push(`DAML_TEMPLATE_COLLATERAL_POOL=${templateIds.CollateralPool}`);
  if (templateIds.SubstitutionRequest)
    envVars.push(
      `DAML_TEMPLATE_SUBSTITUTION_REQUEST=${templateIds.SubstitutionRequest}`
    );
  if (templateIds.CollateralLiquidation)
    envVars.push(
      `DAML_TEMPLATE_COLLATERAL_LIQUIDATION=${templateIds.CollateralLiquidation}`
    );
  if (templateIds.LiquidationSettlement)
    envVars.push(
      `DAML_TEMPLATE_LIQUIDATION_SETTLEMENT=${templateIds.LiquidationSettlement}`
    );

  // Yield Generation Templates
  if (templateIds.LiquidityPool)
    envVars.push(`DAML_TEMPLATE_LIQUIDITY_POOL=${templateIds.LiquidityPool}`);
  if (templateIds.LPToken)
    envVars.push(`DAML_TEMPLATE_LP_TOKEN=${templateIds.LPToken}`);
  if (templateIds.YieldOptimizer)
    envVars.push(`DAML_TEMPLATE_YIELD_OPTIMIZER=${templateIds.YieldOptimizer}`);
  if (templateIds.StakingRewards)
    envVars.push(`DAML_TEMPLATE_STAKING_REWARDS=${templateIds.StakingRewards}`);
  if (templateIds.PerformanceBonus)
    envVars.push(
      `DAML_TEMPLATE_PERFORMANCE_BONUS=${templateIds.PerformanceBonus}`
    );

  // Secondary Market Templates
  if (templateIds.LoanListing)
    envVars.push(`DAML_TEMPLATE_LOAN_LISTING=${templateIds.LoanListing}`);
  if (templateIds.LoanOffer)
    envVars.push(`DAML_TEMPLATE_LOAN_OFFER=${templateIds.LoanOffer}`);
  if (templateIds.SecondaryLoanTransfer)
    envVars.push(
      `DAML_TEMPLATE_SECONDARY_LOAN_TRANSFER=${templateIds.SecondaryLoanTransfer}`
    );
  if (templateIds.TransferSettlement)
    envVars.push(
      `DAML_TEMPLATE_TRANSFER_SETTLEMENT=${templateIds.TransferSettlement}`
    );
  if (templateIds.LoanValuation)
    envVars.push(`DAML_TEMPLATE_LOAN_VALUATION=${templateIds.LoanValuation}`);
  if (templateIds.BorrowerNotification)
    envVars.push(
      `DAML_TEMPLATE_BORROWER_NOTIFICATION=${templateIds.BorrowerNotification}`
    );

  // Aegis Platform Templates
  if (templateIds.AegisPlatform)
    envVars.push(`DAML_TEMPLATE_AEGIS_PLATFORM=${templateIds.AegisPlatform}`);
  if (templateIds.AssetBalance)
    envVars.push(`DAML_TEMPLATE_ASSET_BALANCE=${templateIds.AssetBalance}`);
  if (templateIds.LiquiditySupport)
    envVars.push(
      `DAML_TEMPLATE_LIQUIDITY_SUPPORT=${templateIds.LiquiditySupport}`
    );

  // Audit Log Templates
  if (templateIds.PlatformAuditLog)
    envVars.push(
      `DAML_TEMPLATE_PLATFORM_AUDIT_LOG=${templateIds.PlatformAuditLog}`
    );
  if (templateIds.LenderAuditLog)
    envVars.push(
      `DAML_TEMPLATE_LENDER_AUDIT_LOG=${templateIds.LenderAuditLog}`
    );
  if (templateIds.BorrowerAuditLog)
    envVars.push(
      `DAML_TEMPLATE_BORROWER_AUDIT_LOG=${templateIds.BorrowerAuditLog}`
    );
  if (templateIds.LoanAuditTrail)
    envVars.push(
      `DAML_TEMPLATE_LOAN_AUDIT_TRAIL=${templateIds.LoanAuditTrail}`
    );
  if (templateIds.PoolAuditLog)
    envVars.push(`DAML_TEMPLATE_POOL_AUDIT_LOG=${templateIds.PoolAuditLog}`);
  if (templateIds.ComplianceAuditLog)
    envVars.push(
      `DAML_TEMPLATE_COMPLIANCE_AUDIT_LOG=${templateIds.ComplianceAuditLog}`
    );
  if (templateIds.ActivityMonitor)
    envVars.push(
      `DAML_TEMPLATE_ACTIVITY_MONITOR=${templateIds.ActivityMonitor}`
    );
  if (templateIds.ComplianceAlert)
    envVars.push(
      `DAML_TEMPLATE_COMPLIANCE_ALERT=${templateIds.ComplianceAlert}`
    );
  if (templateIds.PlatformEscalation)
    envVars.push(
      `DAML_TEMPLATE_PLATFORM_ESCALATION=${templateIds.PlatformEscalation}`
    );
  if (templateIds.ComplianceEscalation)
    envVars.push(
      `DAML_TEMPLATE_COMPLIANCE_ESCALATION=${templateIds.ComplianceEscalation}`
    );

  let envContent = "";
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, "utf8");
  }

  const templateSectionRegex =
    /\n# DAML Template IDs \(auto-generated\)[\s\S]*?(?=\n[A-Z_]+=(?!.*DAML_TEMPLATE)|$)/;
  envContent = envContent.replace(templateSectionRegex, "");

  envContent = envContent.replace(/^DAML_TEMPLATE_.*$/gm, "");

  envContent = envContent.replace(/\n{3,}/g, "\n\n");

  envContent = envContent.replace(/\n+$/, "");
  if (envContent.length > 0 && !envContent.endsWith("\n")) {
    envContent += "\n";
  }

  envContent += "\n# DAML Template IDs (auto-generated)\n";
  envContent += envVars.join("\n") + "\n";

  fs.writeFileSync(ENV_FILE, envContent);
  log.success(`Successfully updated .env with ${envVars.length} template IDs`);
}

function main() {
  log.info("Extracting DAML template IDs...\n");

  const templateIds = extractTemplateIds();

  console.log(`${colors.bright}Found template IDs:${colors.reset}`);
  Object.entries(templateIds).forEach(([name, id]) => {
    console.log(
      `  ${colors.cyan}${name}${colors.reset}: ${colors.bright}${id}${colors.reset}`
    );
  });
  console.log("");

  updateEnvFile(templateIds);
}

if (require.main === module) {
  main();
}

module.exports = { extractTemplateIds, updateEnvFile };
