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
      groupBy: string | null;
      headerField?: string;
      customHeaderField?: string;
      secondaryField?: string;
      customSecondaryField?: string;
   };
};

export const Kanban: ComponentConfig<KanbanProps> = {
   fields: {
      config: {
         type: "custom",
         render: ({ field, value, onChange }) => {
            const [rawData, setData] = useState([]);
            const [categoryList, setCategoryList] = useState<string[]>([]);

            const fetchData = async (source: CancelTokenSource) => {
               try {
                  const response = (
                     await axios.get(value.url, {
                        cancelToken: source.token,
                     })
                  ).data;

                  setData(response);
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
               const keys = Array.from(
                  new Set(
                     rawData.reduce((accumulated: string[], element) => {
                        accumulated.push(...Object.keys(element));
                        return accumulated;
                     }, [])
                  )
               ).filter((key) =>
                  rawData.every((entry) => Object.keys(entry).includes(key))
               );

               setCategoryList(keys);
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
                        onChange={(e) => {
                           const clone = structuredClone(value);
                           clone[prop] = e.currentTarget.value;

                           onChange(clone);
                        }}
                        value={value[prop]}
                     />
                  </label>
               );
            };

            return (
               <>
                  <Input prop="url" name="Data source URL" />
                  <Select prop="groupBy" name="Group by" />
                  <Select prop="headerField" name="Header Field" />
                  <Select prop="secondaryField" name="Secondary Field" />
               </>
            );
         },
      },
   },
   defaultProps: {
      config: {
         url: "",
         groupBy: null,
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
      }, []);

      useEffect(() => {
         if (!config.groupBy) return;

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
               {config.groupBy ? (
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
                                                {`${
                                                   entry[config.headerField!] ??
                                                   ""
                                                }`}
                                             </div>
                                             <div
                                                className={getClassName(
                                                   "itemSecondary"
                                                )}
                                             >
                                                {`${
                                                   entry[
                                                      config.secondaryField!
                                                   ] ?? ""
                                                }`}
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
