//import styles from "./style.module.css";

import React, {  } from "react";
import { ComponentConfig } from "@measured/puck";
//import { getClassNameFactory } from "lib";

//const getClassName = getClassNameFactory("Chart", styles);
//const getClassNameInput = getClassNameFactory("Input", styles);

//const initialData = {};

export type ChartProps = {
   config: {
      url: string;
      title: string;
      chartType: unknown;
   };
};

export const Chart: ComponentConfig<ChartProps> = {
   fields: {
      config: {
         type: "custom",
         render: () => {
            return <div></div>;
         },
      },
   },
   defaultProps: {
      config: {
         url: "",
         title: "",
         chartType: "",
      },
   },
   render: () => {
      return <div></div>;
   },
};
