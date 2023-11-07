'use client';

import React from 'react';
// import { QueryBuilder } from 'react-querybuilder';
// import 'react-querybuilder/dist/query-builder.css';
import ReactBpmn from 'react-bpmn';

const Page = () => {
  function onShown() {
    console.log('diagram shown');
  }

  function onLoading() {
    console.log('diagram loading');
  }

  function onError(err) {
    console.log('failed to show diagram');
  }

  return (
    <div>
      <header>BPMN.io</header>
      <ReactBpmn 
        url="https://cdn.statically.io/gh/camunda/camunda-modeler/v3.5.0/resources/diagram/simple.bpmn"
        onShown={ onShown }
        onLoading={ onLoading }
        onError={ onError }
        style={{
          height: '100vh'
        }}
      >

      </ReactBpmn>
    </div>
  )
}

export default Page