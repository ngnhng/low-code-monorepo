import type { Config, Data } from '@measured/puck';
import {
  ButtonGroup,
  ButtonGroupProps,
} from '../components/gui-editor/blocks/ButtonGroup';
import { Card, CardProps } from '../components/gui-editor/blocks/Card';
import { Columns, ColumnsProps } from '../components/gui-editor/blocks/Columns';
import { Flex, FlexProps } from '../components/gui-editor/blocks/Flex';
import { Logos, LogosProps } from '../components/gui-editor/blocks/Logos';
import { Stats, StatsProps } from '../components/gui-editor/blocks/Stats';
import { Text, TextProps } from '../components/gui-editor/blocks/Text';
import {
  VerticalSpace,
  VerticalSpaceProps,
} from '../components/gui-editor/blocks/VerticalSpace';
import type { RootProps } from './root';
import Root from './root';
import type { TableProps } from '../components/gui-editor/blocks/Table';
import { Table } from '../components/gui-editor/blocks/Table';
import { Kanban, KanbanProps } from '../components/gui-editor/blocks/Kanban';
import { Charts, ChartsProps } from '../components/gui-editor/blocks/Chart';

interface CProps {
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
}

// We avoid the name config as next gets confused
export const conf: Config<CProps, RootProps> = {
  root: {
    render: Root,
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
    content: [
      //  {
      //    //type: 'Charts',
      //    //props: {
      //    //  id: 'test',
      //    //  config: {
      //    //    url: 'https://tryz.vercel.app/api/test',
      //    //    title: 'Title',
      //    //    chartType: 'bar',
      //    //    width: '100%',
      //    //    height: '600px',
      //    //  },
      //    //},
      //  },
    ],
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
