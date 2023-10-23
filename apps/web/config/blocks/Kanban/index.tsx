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

const getClassName = getClassNameFactory("Kanban", styles);
const getClassNameInput = getClassNameFactory("Input", styles);

const initialData = {};

export type KanbanProps = {
   config: {
      url: string;
      groupBy: string;
      headerField: string;
      customHeaderField: string;
      secondaryField: string;
      customSecondaryField: string;
   };
};

const LoadingAnimation = () => {
   return (
      <div className="App">
         <div className="loading">
            <svg
               xmlns="http://www.w3.org/2000/svg"
               version="1.1"
               width="50px"
               height="50px"
            >
               <circle cx="25" cy="25" r="20" strokeLinecap="round" />
            </svg>
            <style jsx>
               {`
                  @keyframes spin {
                     0% {
                        scale: 1 1;
                        stroke-dashoffset: 200;
                        transform: none;
                     }
                     50% {
                        scale: 1 1;
                        stroke-dashoffset: 0;
                        transform: none;
                     }
                     50.0001% {
                        scale: 1 -1;
                        transform: translateY(-50px);
                     }
                     99.9999% {
                        scale: 1 -1;
                        stroke-dashoffset: 200;
                        transform: translateY(-50px);
                     }
                     100% {
                        scale: 1 1;
                        transform: none;
                     }
                  }

                  @keyframes osuSpinnerKurwa {
                     from {
                        transform: rotate(0deg);
                     }
                     to {
                        transform: rotate(360deg);
                     }
                  }

                  .loading {
                     width: 100%;

                     padding: 50px;

                     {/* background-color: #151515; */}
                     border-radius: 20px;

                     display: flex;
                     justify-content: center;
                  }

                  circle {
                     fill: none;
                     stroke: rgb(71, 71, 71);
                     stroke-width: 5px;
                     stroke-dasharray: 200;
                     stroke-dashoffset: 150;

                     animation: spin 2s infinite;
                     shape-rendering: geometricPrecision;
                  }

                  svg {
                     animation: linear osuSpinnerKurwa 2s infinite;
                  }
               `}
            </style>
         </div>
      </div>
   );
};

export const Kanban: ComponentConfig<KanbanProps> = {
   fields: {
      config: {
         type: "custom",
         render: ({ field, value, onChange }) => {
            const [rawData, setData] = useState<Object[]>([]);
            const [categoryList, setCategoryList] = useState<string[]>([]);
            const [isLoading, setIsLoading] = useState<boolean>(true);

            const fetchData = async (source: CancelTokenSource) => {
               setIsLoading(true);

               try {
                  const response = (
                     await axios.get(value.url, {
                        cancelToken: source.token,
                     })
                  ).data;

                  setData(response);
                  setIsLoading(false);
               } catch (error) {
                  console.log(error);
               }
            };

            useEffect(() => {
               const source = axios.CancelToken.source();
               fetchData(source);

               return () => {
                  source.cancel();
               };
            }, [value.url]);

            useEffect(() => {
               if (value.url === "") return;

               const keys = Array.from(
                  new Set(
                     rawData.reduce(
                        (accumulated: string[], element: Object) => {
                           accumulated.push(...Object.keys(element));
                           return accumulated;
                        },
                        []
                     ) as string[]
                  )
               ).filter((key) =>
                  rawData.every((entry) => Object.keys(entry).includes(key))
               );

               setCategoryList(keys);
               onChange({
                  ...value,
                  groupBy: value.groupBy !== "" ? value.groupBy : keys[0] ?? "",
                  headerField:
                     value.headerField !== ""
                        ? value.headerField
                        : keys[0] ?? "",
                  secondaryField:
                     value.secondaryField !== ""
                        ? value.secondaryField
                        : keys[0] ?? "",
               });
            }, [JSON.stringify(rawData)]);

            const Select = ({ prop, name }) => {
               return (
                  <label className={getClassNameInput()}>
                     <div className={getClassNameInput("label")}>
                        <div className={getClassNameInput("labelIcon")}>
                           <ChevronDown size={16} />
                        </div>
                        {name as string}
                     </div>
                     <select
                        className={getClassNameInput("input")}
                        onChange={(e) => {
                           const clone = structuredClone(value);
                           clone[prop] = e.currentTarget.value;

                           onChange(clone);
                           console.log(clone);
                        }}
                        value={value[prop]}
                     >
                        {categoryList.map((option) => (
                           <option
                              key={option}
                              label={option}
                              value={option as string | number}
                           />
                        ))}
                     </select>
                  </label>
               );
            };

            const Input = ({ prop, name }) => {
               return (
                  <label className={getClassNameInput()}>
                     <div className={getClassNameInput("label")}>
                        <div className={getClassNameInput("labelIcon")}>
                           <Type size={16} />
                        </div>
                        {name}
                     </div>
                     <input
                        type="text"
                        className={getClassNameInput("input")}
                        autoComplete="off"
                        onBlur={(e) => {
                           const clone = structuredClone(value);
                           clone[prop] = e.currentTarget.value;

                           onChange(clone);
                        }}
                        defaultValue={value[prop]}
                     />
                  </label>
               );
            };

            return (
               <>
                  <Input prop="url" name="Data source URL" />
                  {!isLoading ? (
                     <>
                        <Select prop="groupBy" name="Group by" />
                        <Select prop="headerField" name="Header Field" />
                        <Input
                           prop="customHeaderField"
                           name="Format Header Field"
                        />
                        <Select prop="secondaryField" name="Secondary Field" />
                        <Input
                           prop="customSecondaryField"
                           name="Format Secondary Field"
                        />
                     </>
                  ) : (
                     <LoadingAnimation />
                  )}
               </>
            );
         },
      },
   },
   defaultProps: {
      config: {
         url: "",
         groupBy: "",
         headerField: "",
         customHeaderField: "{value}",
         secondaryField: "",
         customSecondaryField: "{value}",
      },
   },
   render: ({ config }) => {
      const [rawData, setData] = useState<Object[]>([]);
      const [categorized, setCategorized] = useState<Object>({});

      const fetchData = async (source: CancelTokenSource) => {
         try {
            const response = (
               await axios.get(config.url, {
                  cancelToken: source.token,
               })
            ).data;

            setData(response);
         } catch (error) {
            console.log(error);
         }
      };

      useEffect(() => {
         if (config.url === "") return;

         const source = axios.CancelToken.source();
         fetchData(source);

         return () => {
            source.cancel();
         };
      }, [config.url]);

      useEffect(() => {
         if (config.groupBy === "") return;

         const categorizedList = rawData.reduce((accumulate, element) => {
            const value = element[config.groupBy as string];

            let key = "";
            if (["boolean", "number", "string"].includes(typeof value))
               key = value;
            else key = JSON.stringify(value);

            accumulate[key] = accumulate[key] || [];
            accumulate[key].push(element);

            return accumulate;
         }, {});

         setCategorized(categorizedList);

         console.log(categorizedList);
      }, [config.groupBy, JSON.stringify(rawData)]);

      return (
         <div className={getClassName("container")}>
            <div className={getClassName("wrapper")}>
               {!(config.groupBy === "") || !(config.url === "") ? (
                  Object.keys(categorized).map((category) => {
                     return (
                        <div
                           className={getClassName("category")}
                           key={category}
                        >
                           <div className={getClassName("categoryTitle")}>
                              {category}
                           </div>
                           <div className={getClassName("itemList")}>
                              <div className={getClassName("itemListWrapper")}>
                                 {categorized[category].map((entry, idx) => {
                                    return (
                                       <div
                                          className={getClassName("item")}
                                          key={idx}
                                       >
                                          <div
                                             className={getClassName(
                                                "itemInformation"
                                             )}
                                          >
                                             <div
                                                className={getClassName(
                                                   "itemHeader"
                                                )}
                                             >
                                                {`${config.customHeaderField.replaceAll(
                                                   "{value}",
                                                   entry[config.headerField!] ??
                                                      ""
                                                )}`}
                                             </div>
                                             <div
                                                className={getClassName(
                                                   "itemSecondary"
                                                )}
                                             >
                                                {`${config.customSecondaryField.replaceAll(
                                                   "{value}",
                                                   entry[
                                                      config.secondaryField!
                                                   ] ?? ""
                                                )}`}
                                             </div>
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        </div>
                     );
                  })
               ) : (
                  <div className={getClassName("category")}>
                     <div className={getClassName("categoryTitle")}>
                        Try adding your datasource and config the Kanban
                     </div>
                     <div className={getClassName("itemList")}>
                        <div className={getClassName("itemListWrapper")}>
                           <div className={getClassName("item")}></div>
                           <div className={getClassName("item")}></div>
                           <div className={getClassName("item")}></div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      );
   },
};
