import React from "react";
import DBCard from "./db-card";

type DB = {
  name: string;
  img: string;
  requiredFields: string[];
};

export const DBListInstance: DB[] = [
  {
    name: "BigQuery",
    img: "/db-icon/big-query.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "PostgreSQL",
    img: "/db-icon/postgre.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "MongoDB",
    img: "/db-icon/mongodb.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "Redis",
    img: "/db-icon/redis.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "MySQL",
    img: "/db-icon/mysql.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "CouchDB",
    img: "/db-icon/couchdb.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "GoogleSheet",
    img: "/db-icon/gg-sheet.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "Slack",
    img: "/db-icon/slack.svg",
    requiredFields: ["PrivateKey"],
  },
  {
    name: "RestAPI",
    img: "/db-icon/rest-api.svg",
    requiredFields: ["PrivateKey"],
  },
];

const DBList = () => {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {DBListInstance.map((instance) => (
        <DBCard
          key={instance.name}
          name={instance.name}
          img={instance.img}
          // requiredFields={instance.requiredFields}
        ></DBCard>
      ))}
    </div>
  );
};

export default DBList;
