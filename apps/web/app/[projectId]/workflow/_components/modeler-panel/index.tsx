import React from 'react';
import PropertiesView from './properties-view';

const PropertiesPanel = ({ modeler, container }) => {
  return (
    <div ref={container} className="h-full">
      <PropertiesView modeler={modeler} />
    </div>
  );
};

export default PropertiesPanel;
