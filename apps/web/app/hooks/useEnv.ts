import { useEffect, useState } from "react";

export enum EnvVariable {
  CLIENT_URL,
  SERVER_URL,
  LOGIN_REQUEST,
  LOGIN_CALLBACK,
}

type EnvVariables = {[key in keyof typeof EnvVariable]:string}

const DefaultVariables:EnvVariables = {
  SERVER_URL:"http://localhost:3000",
  CLIENT_URL:"http://localhost:3001",
  LOGIN_REQUEST:"",
  LOGIN_CALLBACK:"",
}

export function useEnv()
{
  const [variables, setVariables] = useState(DefaultVariables);

  useEffect(()=>{
    getVariables();
 },[]);

  const getVariables = () => {
    console.log("start function: ", process.env.GOOGLE_LOGIN_REQUEST)

    var variables:EnvVariables = DefaultVariables;
    for(var environmentVariable in EnvVariable)
    {
       var value = process.env["LOWCODE_" + environmentVariable];
       console.log("value: " + value);
       if(value === undefined) value = "";
       
       variables[environmentVariable] = value
    }
    setVariables(variables);
 }

  return variables
}

export function useEnvKey(key:EnvVariable, defaultValue:string)
{
   const environmentVariable = useEnv();
   var variable = environmentVariable[key];
   if(variable=== "") variable= defaultValue;
   return variable;
}