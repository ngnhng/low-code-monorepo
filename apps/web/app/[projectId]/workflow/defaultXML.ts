export default `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:yalc="http://some-company/schema/bpmn/gs" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start Campaign">
      <bpmn:extensionElements>
        <yalc:ioMapping />
      </bpmn:extensionElements>
      <bpmn:outgoing>Flow_140gkst</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_140gkst" sourceRef="StartEvent_1" targetRef="Activity_0fqqzji" />
    <bpmn:userTask id="Activity_0fqqzji" name="Submit Campaign Details">
      <bpmn:incoming>Flow_140gkst</bpmn:incoming>
      <bpmn:outgoing>Flow_07uflcd</bpmn:outgoing>
      <bpmn:outgoing>Flow_1rre50b</bpmn:outgoing>
      <bpmn:outgoing>Flow_1pweka2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Activity_09je6yg" name="Append on Google Sheet" yalc:isGoogleSheet="true">
      <bpmn:extensionElements>
        <yalc:taskDefinition type="getData" />
        <yalc:ioMapping>
          <yalc:input source="=_globalContext_user" target="_localContext_user" />
          <yalc:input source="sheetId" target="" />
          <yalc:input source="sheetData" target="" />
          <yalc:input source="range" target="" />
          <yalc:output source="sheetData" target="" />
        </yalc:ioMapping>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_07uflcd</bpmn:incoming>
      <bpmn:outgoing>Flow_1kayzhc</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_07uflcd" sourceRef="Activity_0fqqzji" targetRef="Activity_09je6yg">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:serviceTask id="Activity_0nubkcx" name="Adjust prices on Database">
      <bpmn:incoming>Flow_1rre50b</bpmn:incoming>
      <bpmn:outgoing>Flow_1reh90v</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_1rre50b" sourceRef="Activity_0fqqzji" targetRef="Activity_0nubkcx">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:task id="Activity_1kbhp25" name="Start logging statistics">
      <bpmn:incoming>Flow_1pweka2</bpmn:incoming>
      <bpmn:outgoing>Flow_0nyukji</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1pweka2" sourceRef="Activity_0fqqzji" targetRef="Activity_1kbhp25">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:intermediateCatchEvent id="Event_1b994of" name="Wait until Campaign ended">
      <bpmn:incoming>Flow_1kayzhc</bpmn:incoming>
      <bpmn:incoming>Flow_0nyukji</bpmn:incoming>
      <bpmn:incoming>Flow_1reh90v</bpmn:incoming>
      <bpmn:outgoing>Flow_1f3olxu</bpmn:outgoing>
      <bpmn:outgoing>Flow_124k1n3</bpmn:outgoing>
      <bpmn:timerEventDefinition id="TimerEventDefinition_0i1qsfr" />
    </bpmn:intermediateCatchEvent>
    <bpmn:sequenceFlow id="Flow_1kayzhc" sourceRef="Activity_09je6yg" targetRef="Event_1b994of">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_0nyukji" sourceRef="Activity_1kbhp25" targetRef="Event_1b994of">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_1reh90v" sourceRef="Activity_0nubkcx" targetRef="Event_1b994of">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:serviceTask id="Activity_1vnx7xv" name="Revert prices on Database">
      <bpmn:incoming>Flow_1f3olxu</bpmn:incoming>
      <bpmn:outgoing>Flow_18lupp4</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Activity_0ddtv7h" name="Finalize statistics">
      <bpmn:incoming>Flow_124k1n3</bpmn:incoming>
      <bpmn:outgoing>Flow_1e9llzo</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_1f3olxu" sourceRef="Event_1b994of" targetRef="Activity_1vnx7xv">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_124k1n3" sourceRef="Event_1b994of" targetRef="Activity_0ddtv7h">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:endEvent id="Event_1nbhlw0">
      <bpmn:incoming>Flow_18lupp4</bpmn:incoming>
      <bpmn:incoming>Flow_1e9llzo</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_18lupp4" sourceRef="Activity_1vnx7xv" targetRef="Event_1nbhlw0">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_1e9llzo" sourceRef="Activity_0ddtv7h" targetRef="Event_1nbhlw0">
      <bpmn:extensionElements>
        <yalc:conditionExpression></yalc:conditionExpression>
      </bpmn:extensionElements>
    </bpmn:sequenceFlow>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="188" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="153" y="231" width="77" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1n62vt7_di" bpmnElement="Activity_0fqqzji">
        <dc:Bounds x="310" y="166" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_09je6yg_di" bpmnElement="Activity_09je6yg">
        <dc:Bounds x="500" y="166" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_10u1pio_di" bpmnElement="Activity_0nubkcx">
        <dc:Bounds x="500" y="280" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1kbhp25_di" bpmnElement="Activity_1kbhp25">
        <dc:Bounds x="500" y="400" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1uui36m_di" bpmnElement="Event_1b994of">
        <dc:Bounds x="732" y="302" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="708" y="345" width="84" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0x794v3_di" bpmnElement="Activity_0ddtv7h">
        <dc:Bounds x="900" y="350" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1nbhlw0_di" bpmnElement="Event_1nbhlw0">
        <dc:Bounds x="1082" y="302" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_05tobim_di" bpmnElement="Activity_1vnx7xv">
        <dc:Bounds x="900" y="210" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_140gkst_di" bpmnElement="Flow_140gkst">
        <di:waypoint x="209" y="206" />
        <di:waypoint x="310" y="206" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_07uflcd_di" bpmnElement="Flow_07uflcd">
        <di:waypoint x="410" y="206" />
        <di:waypoint x="500" y="206" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1rre50b_di" bpmnElement="Flow_1rre50b">
        <di:waypoint x="410" y="206" />
        <di:waypoint x="455" y="206" />
        <di:waypoint x="455" y="320" />
        <di:waypoint x="500" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1pweka2_di" bpmnElement="Flow_1pweka2">
        <di:waypoint x="410" y="206" />
        <di:waypoint x="455" y="206" />
        <di:waypoint x="455" y="440" />
        <di:waypoint x="500" y="440" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1kayzhc_di" bpmnElement="Flow_1kayzhc">
        <di:waypoint x="600" y="206" />
        <di:waypoint x="666" y="206" />
        <di:waypoint x="666" y="320" />
        <di:waypoint x="732" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0nyukji_di" bpmnElement="Flow_0nyukji">
        <di:waypoint x="600" y="440" />
        <di:waypoint x="666" y="440" />
        <di:waypoint x="666" y="320" />
        <di:waypoint x="732" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1reh90v_di" bpmnElement="Flow_1reh90v">
        <di:waypoint x="600" y="320" />
        <di:waypoint x="732" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1f3olxu_di" bpmnElement="Flow_1f3olxu">
        <di:waypoint x="768" y="320" />
        <di:waypoint x="834" y="320" />
        <di:waypoint x="834" y="250" />
        <di:waypoint x="900" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_124k1n3_di" bpmnElement="Flow_124k1n3">
        <di:waypoint x="768" y="320" />
        <di:waypoint x="834" y="320" />
        <di:waypoint x="834" y="390" />
        <di:waypoint x="900" y="390" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_18lupp4_di" bpmnElement="Flow_18lupp4">
        <di:waypoint x="1000" y="250" />
        <di:waypoint x="1041" y="250" />
        <di:waypoint x="1041" y="320" />
        <di:waypoint x="1082" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1e9llzo_di" bpmnElement="Flow_1e9llzo">
        <di:waypoint x="1000" y="390" />
        <di:waypoint x="1041" y="390" />
        <di:waypoint x="1041" y="320" />
        <di:waypoint x="1082" y="320" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`