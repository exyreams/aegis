-- Enable Row Level Security on sensitive tables

-- Enable RLS on user table
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "users_own_data" ON "user"
  FOR ALL USING (id = current_setting('app.current_user_id', true));

-- Enable RLS on session table  
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_sessions" ON "session"
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Enable RLS on account table
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_accounts" ON "account"
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Enable RLS on RFQ cache
ALTER TABLE "rfq_cache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_rfqs" ON "rfq_cache"
  FOR ALL USING (
    borrower = current_setting('app.current_user_party', true) OR
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE daml_party = current_setting('app.current_user_party', true) 
      AND role = 'admin'
    )
  );

-- Enable RLS on bid cache
ALTER TABLE "bid_cache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_bids" ON "bid_cache"
  FOR ALL USING (
    lender = current_setting('app.current_user_party', true) OR
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE daml_party = current_setting('app.current_user_party', true) 
      AND role = 'admin'
    )
  );

-- Enable RLS on credit profile cache
ALTER TABLE "credit_profile_cache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_credit_profiles" ON "credit_profile_cache"
  FOR ALL USING (
    party = current_setting('app.current_user_party', true) OR
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE daml_party = current_setting('app.current_user_party', true) 
      AND role = 'admin'
    )
  );