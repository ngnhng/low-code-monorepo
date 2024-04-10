export default `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:yalc="http://some-company/schema/bpmn/gs" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start Campaign">
      <bpmn:extensionElements>
        <yalc:ioMapping>
          <yalc:output source="=_globalContext_user" target="_globalContext_user" />
        </yalc:ioMapping>
      </bpmn:extensionElements>
    </bpmn:startEvent>
    <bpmn:endEvent id="Event_1nbhlw0" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="188" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="153" y="231" width="77" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1nbhlw0_di" bpmnElement="Event_1nbhlw0">
        <dc:Bounds x="352" y="188" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
