import styles from "./style.module.css";

import React, { useState, useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { getClassNameFactory } from "@measured/puck/lib";
import axios, { CancelTokenSource } from "axios";
import {
   Trash,
   Type,
   List,
   ChevronDown,
   CheckCircle,
   Hash,
} from "react-feather";

const getClassName = getClassNameFactory("Chart", styles);
const getClassNameInput = getClassNameFactory("Input", styles);

const initialData = {};

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
