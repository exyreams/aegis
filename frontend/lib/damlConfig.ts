// DAML configuration utilities

export interface DamlConfig {
  httpJsonUrl: string;
  wsJsonUrl: string;
  party: string;
  token: string;
  reconnectThreshold?: number;
}

export const getDamlConfig = (party?: string, token?: string): DamlConfig => {
  const httpJsonUrl = process.env.NEXT_PUBLIC_DAML_JSON_API_URL;
  const wsJsonUrl = process.env.NEXT_PUBLIC_DAML_WS_URL;

  return {
    httpJsonUrl,
    wsJsonUrl,
    party: party || "Alice",
    token: token || "",
    reconnectThreshold: 5,
  };
};

export const getDefaultDamlConfig = (): DamlConfig => {
  return getDamlConfig();
};
