'use client';

import React, { useState, useEffect} from 'react';
// import { QueryBuilder } from 'react-querybuilder';
// import 'react-querybuilder/dist/query-builder.css';
import Modeler from "bpmn-js/lib/Modeler";
import axios from 'axios';
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

const Page = () => {
  // url="https://cdn.statically.io/gh/camunda/camunda-modeler/v3.5.0/resources/diagram/simple.bpmn"
  const [diagram, diagramSet] = useState("");
  const container = document.getElementById("bpmn-container");

  useEffect(() => {
    if (diagram.length === 0) {
      axios
        .get(
          "https://cdn.statically.io/gh/camunda/camunda-modeler/v3.5.0/resources/diagram/simple.bpmn"
        )
        .then((r) => {
          diagramSet(r.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [diagram]);

  if (diagram.length > 0) {
    const modeler = new Modeler({
      container,
      keyboard: {
        bindTo: document
      }
    });
    modeler
      .importXML(diagram)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.log("Warnings", warnings);
        }

        const canvas = modeler.get("modeling");
        canvas.setColor("CalmCustomerTask", {
          stroke: "green",
          fill: "yellow"
        });
      })
      .catch((err) => {
        console.log("error", err);
      });
  }


  return (
    <div>
      <header>BPMN.io</header>
      
      <div
        id="bpmn-container"
        style={{
          border: "1px solid #000000",
          height: "90vh",
          width: "90vw",
          margin: "auto"
        }}
      ></div>
    </div>
  )
}

export default Page