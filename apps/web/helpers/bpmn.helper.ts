import { is } from 'bpmn-js/lib/util/ModelUtil';

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
