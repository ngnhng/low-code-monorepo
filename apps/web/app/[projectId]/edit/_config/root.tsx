import { ReactNode } from 'react';

import { DefaultRootProps } from '@measured/puck';

export type RootProps = {
  children: ReactNode;
  title: string;
} & DefaultRootProps;

function Root({ children, editMode }: RootProps): JSX.Element {
  return <>{children}</>;
}

export default Root;
