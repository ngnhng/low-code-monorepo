import { useEffect, useState } from "react";

export enum EnvVariable {
    CLIENT_URL = "CLIENT_URL",
    SERVER_URL = "SERVER_URL",
    LOGIN_REQUEST = "LOGIN_REQUEST",
    LOGIN_CALLBACK = "LOGIN_CALLBACK",
}

const DefaultVariables: Record<EnvVariable, string> = {
    [EnvVariable.SERVER_URL]: "http://localhost:3000",
    [EnvVariable.CLIENT_URL]: "http://localhost:3001",
    [EnvVariable.LOGIN_REQUEST]: "",
    [EnvVariable.LOGIN_CALLBACK]: "",
};

export function useEnv() {
    const [variables, setVariables] = useState(DefaultVariables);

    useEffect(() => {
        const variables: Record<EnvVariable, string> = { ...DefaultVariables };
        for (const environmentVariable in EnvVariable) {
            const value = process.env["LOWCODE_" + environmentVariable] ?? "";
            variables[environmentVariable as EnvVariable] = value;
        }
        setVariables(variables);
    }, []);

    return variables;
}

export function useEnvKey(key: EnvVariable, defaultValue: string) {
    const environmentVariable = useEnv();
    const variable = environmentVariable[key];
    return variable || defaultValue;
}
