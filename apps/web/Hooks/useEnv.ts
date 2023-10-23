import { useState } from "react";

export enum EnvVariable {
  environment,
  serverEndPoint,
  website
}

type EnvVariables = {[key in keyof typeof EnvVariable]:string}

const DefaultVariables:EnvVariables = {
  environment:"local",//"local" | "prod"
  serverEndPoint:"http://localhost:3000",
  website:"http://localhost:3001"
}

export function useEnv()
{
  const [variables, setVariables] = useState(DefaultVariables);

  const getVariables = () => {
    var variables:EnvVariables = DefaultVariables;
    for(var environmentVariable in EnvVariable)
    {
       var value = process.env["REACT_APP_" + environmentVariable];
       if(value === undefined) value = "";
       
       variables[environmentVariable] = value
    }
    setVariables(variables);
 }

  return variables
}