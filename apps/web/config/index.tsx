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
import { Charts, ChartsProps } from "./blocks/Chart";

type Props = {
   Table: TableProps;
   Kanban: KanbanProps;
   Charts: ChartsProps;
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
      Charts,
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
            type: "Charts",
            props: {
               id: "test",
               config: {
                  url: "https://tryz.vercel.app/api/test",
                  title: "Title",
                  chartType: "bar",
                  width: "100%",
                  height: "600px",
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
