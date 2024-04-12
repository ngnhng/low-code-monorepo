export default `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:yalc="http://some-company/schema/bpmn/gs" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start Campaign">
      <bpmn:extensionElements>
        <yalc:ioMapping>
          <yalc:output source="=_globalContext_user" target="_globalContext_user" />
        </yalc:ioMapping>
      </bpmn:extensionElements>
      <bpmn:outgoing>Flow_0606a7s</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="Event_1nbhlw0">
      <bpmn:incoming>Flow_01d3ojh</bpmn:incoming>
      <bpmn:incoming>Flow_0754x5g</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:serviceTask id="Activity_14jr0ka" name="Read data" yalc:isGoogleSheet="true">
      <bpmn:extensionElements>
        <yalc:taskDefinition type="googleSheetGetData" />
        <yalc:ioMapping>
          <yalc:input source="=_globalContext_user" target="_localContext_user" />
          <yalc:input source="=&#34;1sHYGqIh0J4KW9Uo9ldYHQqshVkuxYVc4qhVWz3XNnlU&#34;" target="sheetId" />
          <yalc:input source="=&#34;1&#34;" target="sheetData" />
          <yalc:input source="=&#34;Sheet1!A1:D5&#34;" target="range" />
          <yalc:output source="=sheetData" target="result" />
        </yalc:ioMapping>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_0606a7s</bpmn:incoming>
      <bpmn:outgoing>Flow_1xir659</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_0606a7s" sourceRef="StartEvent_1" targetRef="Activity_14jr0ka" />
    <bpmn:sequenceFlow id="Flow_1xir659" sourceRef="Activity_14jr0ka" targetRef="Gateway_1e0xpcc" />
    <bpmn:exclusiveGateway id="Gateway_1e0xpcc">
      <bpmn:incoming>Flow_1xir659</bpmn:incoming>
      <bpmn:outgoing>Flow_01d3ojh</bpmn:outgoing>
      <bpmn:outgoing>Flow_1qotz77</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Activity_0sq3a45" name="Append Result" yalc:isGoogleSheet="true">
      <bpmn:extensionElements>
        <yalc:taskDefinition type="googleSheetAppendRow" />
        <yalc:ioMapping>
          <yalc:input source="=_globalContext_user" target="_localContext_user" />
          <yalc:input source="=&#34;1sHYGqIh0J4KW9Uo9ldYHQqshVkuxYVc4qhVWz3XNnlU&#34;" target="sheetId" />
          <yalc:input source="=&#34;[[&#39;Good&#39;]]&#34;" target="sheetData" />
          <yalc:input source="=&#34;Sheet1!A1:D5&#34;" target="range" />
          <yalc:output source="=sheetData" target="nnn" />
        </yalc:ioMapping>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1qotz77</bpmn:incoming>
      <bpmn:outgoing>Flow_0754x5g</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_01d3ojh" sourceRef="Gateway_1e0xpcc" targetRef="Event_1nbhlw0">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=len(result) &lt; 1</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_1qotz77" sourceRef="Gateway_1e0xpcc" targetRef="Activity_0sq3a45">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=len(result) &gt; 1</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_0754x5g" sourceRef="Activity_0sq3a45" targetRef="Event_1nbhlw0" />
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
        <dc:Bounds x="812" y="392" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_14jr0ka_di" bpmnElement="Activity_14jr0ka">
        <dc:Bounds x="290" y="370" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1e0xpcc_di" bpmnElement="Gateway_1e0xpcc" isMarkerVisible="true">
        <dc:Bounds x="505" y="385" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0sq3a45_di" bpmnElement="Activity_0sq3a45">
        <dc:Bounds x="630" y="230" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_0606a7s_di" bpmnElement="Flow_0606a7s">
        <di:waypoint x="209" y="206" />
        <di:waypoint x="250" y="206" />
        <di:waypoint x="250" y="410" />
        <di:waypoint x="290" y="410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1xir659_di" bpmnElement="Flow_1xir659">
        <di:waypoint x="390" y="410" />
        <di:waypoint x="505" y="410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_01d3ojh_di" bpmnElement="Flow_01d3ojh">
        <di:waypoint x="555" y="410" />
        <di:waypoint x="812" y="410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1qotz77_di" bpmnElement="Flow_1qotz77">
        <di:waypoint x="530" y="385" />
        <di:waypoint x="530" y="270" />
        <di:waypoint x="630" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0754x5g_di" bpmnElement="Flow_0754x5g">
        <di:waypoint x="730" y="270" />
        <di:waypoint x="780" y="270" />
        <di:waypoint x="780" y="410" />
        <di:waypoint x="812" y="410" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
