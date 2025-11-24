// Export all API module instances for easy importing
export { authApi } from "./auth";
export { creditApi } from "./credit";
export { rfqApi } from "./rfq";
export { bidsApi } from "./bids";
export { collateralApi } from "./collateral";
export { syndicationApi } from "./syndication";
export { yieldApi } from "./yield";
export { secondaryMarketApi } from "./secondary-market";
export { healthApi } from "./health";
export { profileApi } from "./profile";
export { aegisApi } from "./aegis";
export { auditApi } from "./audit";

// Export classes for custom instantiation if needed
export { AuthApi } from "./auth";
export { CreditApi } from "./credit";
export { RfqApi } from "./rfq";
export { BidsApi } from "./bids";
export { CollateralApi } from "./collateral";
export { SyndicationApi } from "./syndication";
export { YieldApi } from "./yield";
export { SecondaryMarketApi } from "./secondary-market";
export { HealthApi } from "./health";
export { ProfileApi } from "./profile";
export { AegisApi } from "./aegis";
export { AuditApi } from "./audit";
export { BaseApiClient } from "./base";

// Import instances for unified client
import { authApi } from "./auth";
import { creditApi } from "./credit";
import { rfqApi } from "./rfq";
import { bidsApi } from "./bids";
import { collateralApi } from "./collateral";
import { syndicationApi } from "./syndication";
import { yieldApi } from "./yield";
import { secondaryMarketApi } from "./secondary-market";
import { healthApi } from "./health";
import { profileApi } from "./profile";
import { aegisApi } from "./aegis";
import { auditApi } from "./audit";

// Create a unified API client that combines all modules
export class UnifiedApiClient {
  public auth = authApi;
  public credit = creditApi;
  public rfq = rfqApi;
  public bids = bidsApi;
  public collateral = collateralApi;
  public syndication = syndicationApi;
  public yield = yieldApi;
  public secondaryMarket = secondaryMarketApi;
  public health = healthApi;
  public profile = profileApi;
  public aegis = aegisApi;
  public audit = auditApi;
}

// Export a default unified client instance
export const api = new UnifiedApiClient();

// For backward compatibility, also export the old apiClient
export default api;
