import React from 'react';
import PropertiesView from './properties-view';

const PropertiesPanel = ({ container }) => {
  return (
    <div ref={container} className="h-full">
      <PropertiesView  />
    </div>
  );
};

export default PropertiesPanel;
