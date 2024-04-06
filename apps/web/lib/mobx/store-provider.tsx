'use client';

import { RootStore } from 'stores/root';
import {
  useContext,
  createContext,
  ReactNode,
  PropsWithChildren,
  ComponentType,
} from 'react';

const rootStore: RootStore = new RootStore();

export const MobxStoreContext = createContext<RootStore>(rootStore);

export const MobxStoreProvider = ({ children }: { children: ReactNode }) => {
  const store = rootStore ?? new RootStore();
  return (
    <MobxStoreContext.Provider value={store}>
      {children}
    </MobxStoreContext.Provider>
  );
};

// hook -- use this in most cases
export const useMobxStore = () => {
  const context = useContext(MobxStoreContext);
  if (!context)
    throw new Error(
      'useMobxStore must be used from a child component of MobxStoreProvider',
    );
  return context;
};

// consumer
interface WithMobxStoreProperties {
  mobxStore: RootStore;
}

export const withMobxStore = <P extends object>(
  Component: ComponentType<P & WithMobxStoreProperties>,
) => {
  return (properties: PropsWithChildren<P>) => (
    <MobxStoreContext.Consumer>
      {(context) => {
        if (context === undefined) {
          throw new Error(
            'withMobxStore must be used within MobxStoreProvider',
          );
        }
        return <Component {...(properties as P)} mobxStore={context} />;
      }}
    </MobxStoreContext.Consumer>
  );
};
