import "server-only";

export enum EnvVariable {
   CLIENT_URL = "CLIENT_URL",
   SERVER_URL = "SERVER_URL",
   LOGIN_REQUEST = "LOGIN_REQUEST",
   LOGIN_CALLBACK = "LOGIN_CALLBACK",
   API_URL = "API_URL",
}

const DefaultVariables: Record<EnvVariable, string> = {
   [EnvVariable.SERVER_URL]: "http://localhost:3000",
   [EnvVariable.CLIENT_URL]: "http://localhost:3001",
   [EnvVariable.LOGIN_REQUEST]: "",
   [EnvVariable.LOGIN_CALLBACK]:
      "http://localhost:3000/api/oauth/google/callback",
   [EnvVariable.API_URL]: "http://localhost:3000/api",
};

const prefix = "LOW_CODE_";

export const getEnv = (variable: EnvVariable): string => {
   const value = process.env[`${prefix}${variable}`];
   if (value) {
      return value;
   }

   const defaultValue = DefaultVariables[variable];
   if (defaultValue) {
      return defaultValue;
   }

   throw new Error(`Environment variable ${variable} is not defined`);
};
