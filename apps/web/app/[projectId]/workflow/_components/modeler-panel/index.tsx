import React from 'react';
import PropertiesView from './properties-view';

const PropertiesPanel = ({ modeler, container }) => {
  return (
    <div ref={container}>
      <PropertiesView modeler={modeler} />
    </div>
  );
};

export default PropertiesPanel;
