import type { Config, Data } from "@measured/puck";
import {
  ButtonGroup,
  ButtonGroupProps,
} from "../app/[projectId]/edit/_components/blocks/ButtonGroup";
import {
  Card,
  CardProps,
} from "../app/[projectId]/edit/_components/blocks/Card";
import {
  Columns,
  ColumnsProps,
} from "../app/[projectId]/edit/_components/blocks/Columns";
import {
  Flex,
  FlexProps,
} from "../app/[projectId]/edit/_components/blocks/Flex";
import {
  Logos,
  LogosProps,
} from "../app/[projectId]/edit/_components/blocks/Logos";
import {
  Stats,
  StatsProps,
} from "../app/[projectId]/edit/_components/blocks/Stats";
import {
  Text,
  TextProps,
} from "../app/[projectId]/edit/_components/blocks/Text";
import {
  VerticalSpace,
  VerticalSpaceProps,
} from "../app/[projectId]/edit/_components/blocks/VerticalSpace";
import type { RootProps } from "./root";
import Root from "./root";
import type { TableProps } from "../app/[projectId]/edit/_components/blocks/Table";
import { Table } from "../app/[projectId]/edit/_components/blocks/Table";
import {
  Kanban,
  KanbanProps,
} from "../app/[projectId]/edit/_components/blocks/Kanban";
import {
  Charts,
  ChartsProps,
} from "../app/[projectId]/edit/_components/blocks/Chart";

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
  "/": {
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
    root: { props: { title: "Test" } },
    zones: {},
  },
  "/pricing": {
    content: [],
    root: { props: { title: "Pricing" } },
  },
  "/about": {
    content: [],
    root: { props: { title: "About" } },
  },
};

export default conf;
