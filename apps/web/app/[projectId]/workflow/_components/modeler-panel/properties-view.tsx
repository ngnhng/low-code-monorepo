/* eslint-disable unicorn/no-null */
"use client";

import React, { useState, useEffect } from "react";
import { ElementProperties } from "./element-properties";
import { useMobxStore } from "lib/mobx/store-provider";

const PropertiesView = ({ modeler }) => {
    const [selectedElements, setSelectedElements] = useState([]);
    const {
        workflow: { activeElement, setActiveElement },
    } = useMobxStore();

    useEffect(() => {
        const selectionChangedHandler = (e) => {
            console.log("selectionChangedHandler", e);
            setSelectedElements(e.newSelection);
            setActiveElement(e.newSelection[0]);
        };

        const elementChangedHandler = (e) => {
            console.log("elementChangedHandler", e);
            const { element } = e;
            if (!element || element.id !== element.id) return;
            setActiveElement(element);
        };

        modeler.on("selection.changed", selectionChangedHandler);
        modeler.on("element.changed", elementChangedHandler);

        // Cleanup function to remove event listeners
        return () => {
            modeler.off("selection.changed", selectionChangedHandler);
            modeler.off("element.changed", elementChangedHandler);
        };
    }, [modeler]); // Dependency array ensures effect runs on mount and unmount

    return (
        <>
            {selectedElements.length === 1 && (
                <ElementProperties modeler={modeler} element={activeElement} />
            )}
            {selectedElements.length === 0 && (
                <span>Please select an element.</span>
            )}
            {selectedElements.length > 1 && (
                <span>Please select a single element.</span>
            )}
        </>
    );
};

export default PropertiesView;
