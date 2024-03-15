import { getBusinessObject, is } from "bpmn-js/lib/util/ModelUtil";

export function hasDefinition(event, definitionType) {
    const definitions = event.businessObject.eventDefinitions || [];

    return definitions.some((d) => is(d, definitionType));
}

export function getExtensionElement(element, type) {
    if (!element || !element.extensionElements) {
        return;
    }

    return element.extensionElements.values.find((extensionElement) => {
        return extensionElement.$instanceOf(type);
    });
}

export function getRelevantBusinessObject(element) {
    const businessObject = getBusinessObject(element);
    if (is(element, "bpmn:Participant")) {
        return businessObject.get("processRef");
    }
    return businessObject;
}

export function createModdleElement(modeler, elementType, properties, parent) {
	const moddle = modeler.get("moddle");
	const element = moddle.create(elementType, properties);
	parent && (element.$parent = parent);
	return element;
}
