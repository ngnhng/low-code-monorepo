import type { Config, Data } from '@measured/puck';
import {
  ButtonGroup,
  ButtonGroupProps,
} from '../_components/blocks/ButtonGroup';
import { Card, CardProps } from '../_components/blocks/Card';
import { Columns, ColumnsProps } from '../_components/blocks/Columns';
import { Flex, FlexProps } from '../_components/blocks/Flex';
import { Logos, LogosProps } from '../_components/blocks/Logos';
import { Stats, StatsProps } from '../_components/blocks/Stats';
import { Text, TextProps } from '../_components/blocks/Text';
import {
  VerticalSpace,
  VerticalSpaceProps,
} from '../_components/blocks/VerticalSpace';
import type { RootProps } from './root';
import Root from './root';
import type { TableProps } from '../_components/blocks/Table';
import { Table } from '../_components/blocks/Table';
import { Kanban, KanbanProps } from '../_components/blocks/Kanban';
import { Charts, ChartsProps } from '../_components/blocks/Chart';

export type { RootProps } from './root';

type CProps = {
  Table: TableProps;
  Kanban: KanbanProps;
  Charts: ChartsProps;
  ButtonGroup: ButtonGroupProps;
  Card: CardProps;
  Columns: ColumnsProps;
  Flex: FlexProps;
  Logos: LogosProps;
  Stats: StatsProps;
  Text: TextProps;
  VerticalSpace: VerticalSpaceProps;
};

export type UserConfig = Config<
  CProps,
  RootProps,
  'layout' | 'typography' | 'interactive'
>;

export const conf: Config<
  CProps,
  RootProps,
  'layout' | 'typography' | 'interactive'
> = {
  root: {
    render: Root,
  },
  categories: {
    layout: {
      components: [
        'Table',
        'Kanban',
        'Charts',
        'Columns',
        'Flex',
        'VerticalSpace',
      ],
    },
    typography: {
      components: ['Text'],
    },
    interactive: {
      title: 'Actions',
      components: [],
    },
  },
  components: {
    Table,
    Kanban,
    Charts,
    ButtonGroup,
    Card,
    Columns,
    Flex,
    Logos,
    Stats,
    Text,
    VerticalSpace,
  },
};

export const initialData: Record<string, Data> = {
  '/': {
    content: [],
    root: { props: { title: 'Test' } },
    zones: {},
  },
  '/pricing': {
    content: [],
    root: { props: { title: 'Pricing' } },
  },
  '/about': {
    content: [],
    root: { props: { title: 'About' } },
  },
};

export default conf;
