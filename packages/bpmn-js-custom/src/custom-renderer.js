import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";

import { append as svgAppend, attr as svgAttr, classes as svgClasses, create as svgCreate, remove as svgRemove } from "tiny-svg";

import { getRoundRectPath } from "bpmn-js/lib/draw/BpmnRenderUtil";

import { is, getBusinessObject } from "bpmn-js/lib/util/ModelUtil";

import { isNil } from "min-dash";

const HIGH_PRIORITY = 1500,
    TASK_BORDER_RADIUS = 2,
    COLOR_GREEN = "#52B415",
    COLOR_YELLOW = "#ffc800",
    COLOR_RED = "#cc0000",
    COLOR_BLACK = "#000";

export default class CustomRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);

        this.bpmnRenderer = bpmnRenderer;
    }

    canRender(element) {
        // ignore labels
        return !element.labelTarget;
    }

    drawShape(parentNode, element) {
        const shape = this.bpmnRenderer.drawShape(parentNode, element);

        const isGoogleSheet = this.getAccessToken(element);

        if (isGoogleSheet) {
            this.drawGoogleSheet(parentNode);
            svgRemove(shape);
        }

        return shape;
    }

    drawGoogleSheet(parentNode) {
        const rect = drawRect(parentNode, 100, 80, 10, COLOR_BLACK, "transparent");

        const background = drawRect(parentNode, 80, 20, TASK_BORDER_RADIUS, COLOR_GREEN);
        svgAttr(background, {
            transform: "translate(8, 52)",
        });

        const text = svgCreate("text");
        svgAttr(text, {
            fill: "#fff",
            transform: "translate(15, 65)",
            fontSize: "10"
        });

        svgAppend(text, document.createTextNode("Google Sheet"));
        svgAppend(parentNode, text);
    }

    getShapePath(shape) {
        if (is(shape, "bpmn:Task")) {
            return getRoundRectPath(shape, TASK_BORDER_RADIUS);
        }

        return this.bpmnRenderer.getShapePath(shape);
    }

    getAccessToken(element) {
        const businessObject = getBusinessObject(element);
        const { isGoogleSheet } = businessObject;
        return isGoogleSheet ?? false;
    }
}

CustomRenderer.$inject = ["eventBus", "bpmnRenderer"];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, color, fill) {
    const rect = svgCreate("rect");

    svgAttr(rect, {
        width: width,
        height: height,
        rx: borderRadius,
        ry: borderRadius,
        stroke: color,
        strokeWidth: 2,
        fill: fill ?? color,
    });

    svgAppend(parentNode, rect);

    return rect;
}
