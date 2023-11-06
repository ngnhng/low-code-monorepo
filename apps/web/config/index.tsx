import { Config, Data } from "@measured/puck";
import { ButtonGroup, ButtonGroupProps } from "./blocks/ButtonGroup";
import { Card, CardProps } from "./blocks/Card";
import { Columns, ColumnsProps } from "./blocks/Columns";
import { Hero, HeroProps } from "./blocks/Hero";
import { Heading, HeadingProps } from "./blocks/Heading";
import { Flex, FlexProps } from "./blocks/Flex";
import { Logos, LogosProps } from "./blocks/Logos";
import { Stats, StatsProps } from "./blocks/Stats";
import { Text, TextProps } from "./blocks/Text";
import { VerticalSpace, VerticalSpaceProps } from "./blocks/VerticalSpace";

import Root, { RootProps } from "./root";
import { Table, TableProps } from "./blocks/Table";
import { Kanban, KanbanProps } from "./blocks/Kanban";
import { Chart, ChartProps } from "./blocks/Chart";

type Props = {
   Table: TableProps;
   Kanban: KanbanProps;
   Chart: ChartProps;
   ButtonGroup: ButtonGroupProps;
   Card: CardProps;
   Columns: ColumnsProps;
   Hero: HeroProps;
   Heading: HeadingProps;
   Flex: FlexProps;
   Logos: LogosProps;
   Stats: StatsProps;
   Text: TextProps;
   VerticalSpace: VerticalSpaceProps;
};

// We avoid the name config as next gets confused
export const conf: Config<Props, RootProps> = {
   root: {
      render: Root,
   },
   components: {
      Table,
      Kanban,
      Chart,
      ButtonGroup,
      Card,
      Columns,
      Hero,
      Heading,
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
         {
            type: "Chart",
            props: {
               id: "test",
               config: {
                  url: "https://tryz.vercel.app/api/test",
                  title: "",
                  chartType: ""
               },
            },
         },
      ],
      root: { title: "" },
      zones: {},
   },
   "/pricing": {
      content: [],
      root: { title: "Pricing" },
   },
   "/about": {
      content: [],
      root: { title: "About Us" },
   },
};

export default conf;
