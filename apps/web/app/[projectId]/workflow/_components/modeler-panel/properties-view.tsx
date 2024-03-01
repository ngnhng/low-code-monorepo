/* eslint-disable unicorn/no-null */
'use client';

import React, { useState, useEffect } from 'react';
import { ElementProperties } from './element-properties';

const PropertiesView = ({ modeler }) => {
  const [selectedElements, setSelectedElements] = useState([]);
  const [element, setElement] = useState(null);

  useEffect(() => {
    const selectionChangedHandler = (e) => {
      setSelectedElements(e.newSelection);
      setElement(e.newSelection[0]);
    };

    const elementChangedHandler = (e) => {
      const { element } = e;
      if (!element || element.id !== element.id) return;
      setElement(element);
    };

    modeler.on('selection.changed', selectionChangedHandler);
    modeler.on('element.changed', elementChangedHandler);

    // Cleanup function to remove event listeners
    return () => {
      modeler.off('selection.changed', selectionChangedHandler);
      modeler.off('element.changed', elementChangedHandler);
    };
  }, [modeler]); // Dependency array ensures effect runs on mount and unmount

  return (
    <>
      {selectedElements.length === 1 && (
        <ElementProperties modeler={modeler} element={element} />
      )}
      {selectedElements.length === 0 && <span>Please select an element.</span>}
      {selectedElements.length > 1 && (
        <span>Please select a single element.</span>
      )}
    </>
  );
};

export default PropertiesView;
