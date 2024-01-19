'use client';

import { observer } from "mobx-react-lite";
//import { useMobxStore } from "lib/mobx/store-provider";
import { SWRConfig } from "swr";
// eslint-disable-next-line unicorn/prefer-node-protocol
import { SWR_CONFIG } from "constants/swr-config";
import StoreWrapper from "./wrappers/store-wrapper";
import { FC, ReactNode } from "react";

export interface IAppProvider {
  children: ReactNode;
}

export const AppProvider: FC<IAppProvider> = observer((properties) => {
  const { children } = properties;

  //store
  //const {
  // appConfig: { envConfig },
  //} = useMobxStore();

  return (
    <StoreWrapper>
      <SWRConfig value={SWR_CONFIG}>
        {children}
      </SWRConfig>
    </StoreWrapper>
  )
})
