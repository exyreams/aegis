"use client";

import DamlLedger from "@daml/react";
import { ALICE_TOKEN } from "@/lib/jwtToken";
import { getDamlConfig } from "@/lib/damlConfig";

interface DamlProviderProps {
  children: React.ReactNode;
}

export function DamlProvider({ children }: DamlProviderProps) {
  const config = getDamlConfig();

  // DAML requires trailing slash
  const httpBaseUrl = config.httpJsonUrl.endsWith('/') ? config.httpJsonUrl : `${config.httpJsonUrl}/`;
  
  console.log('DAML Provider config:', { httpBaseUrl, party: config.party });

  return (
    <DamlLedger
      token={config.token || ALICE_TOKEN}
      party={config.party}
      httpBaseUrl={httpBaseUrl}
      reconnectThreshold={config.reconnectThreshold}
    >
      {children}
    </DamlLedger>
  );
}