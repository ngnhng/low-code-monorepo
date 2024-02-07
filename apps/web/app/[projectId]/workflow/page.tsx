'use client';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import React, { useEffect, useRef, FC, useState } from 'react';
import axios from 'axios';

import { useMobxStore } from 'lib/mobx/store-provider';
import { observer } from 'mobx-react-lite';
import useSWR from 'swr';
import PropertiesPanel from './_components/modeler-panel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@repo/ui';

export default function Page() {
  const {
    workflow: { setCurrentWorkflow },
  } = useMobxStore();

  const { data, isLoading, error } = useSWR('workflow', () => {
    return axios
      .get(
        'https://cdn.statically.io/gh/camunda/camunda-modeler/v3.5.0/resources/diagram/simple.bpmn',
      )
      .then((r) => r.data);
  });

  useEffect(() => {
    if (data) {
      setCurrentWorkflow(data);
    }
  }, [data]);

  if (isLoading || error) return <div>Loading...</div>;

  return <Modeler />;
}

const Modeler = observer(() => {
  const {
    workflow: { currentWorkflow, newRenderer },
  } = useMobxStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [modeler, setModeler] = useState(null);

  useEffect(() => {
    const initializeModeler = async () => {
      if (containerRef.current && sidebarRef.current) {
        const modeler = await newRenderer({
          container: containerRef.current,
          propertiesPanel: {
            parent: sidebarRef.current,
          },
          keyboard: {
            bindTo: document,
          },
        });
        await modeler.importXML(currentWorkflow);

        setModeler(modeler);
      }
    };

    initializeModeler();
  }, [currentWorkflow]);

  if (!currentWorkflow) {
    return <div>Loading Modeler...</div>;
  }

  return (
    <>
      <div className="h-screen">
        {/*<div className="flex-grow flex">
          <div ref={containerRef} className="flex-grow"></div>
          <div ref={sidebarRef} className="w-1/4 bg-gray-200"></div>
        </div>
        <div className="w-full h-1/4 bg-gray-200">
          {modeler !== null && (
            <PropertiesPanel modeler={modeler} container={panelRef} />
          )}
        </div>*/}
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-full">
              <div ref={containerRef} className="bg-gray h-full"></div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={25}>
                <div ref={sidebarRef} className="bg-gray-200 h-full"></div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="bg-gray-200 h-full">
                  {modeler !== null && (
                    <PropertiesPanel modeler={modeler} container={panelRef} />
                  )}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} className="overflow-auto">
                <div>{modeler !== null && <DebugXML modeler={modeler} />}</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
});

const DebugXML: FC<{ modeler: any }> = ({ modeler }) => {
  const [xml, setXml] = useState('');
  useEffect(() => {
    const update = () => {
      modeler.saveXML({ format: true }).then(({ xml }) => {
        setXml(xml);
      });
    };
    modeler.on('commandStack.changed', update);

    return () => {
      modeler.off('commandStack.changed', update);
    };
  }, [modeler]);

  return (
    <div className="overflow-auto">
      <pre>{xml}</pre>
    </div>
  );
};
