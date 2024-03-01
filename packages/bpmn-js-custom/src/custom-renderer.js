import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";

import { append as svgAppend, attr as svgAttr, classes as svgClasses, create as svgCreate } from "tiny-svg";

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

        const suitabilityScore = this.getSuitabilityScore(element);
        const accessToken = this.getAccessToken(element);

        if (accessToken) {
            this.drawGoogleSheet(parentNode);
        }

        if (!isNil(suitabilityScore)) {
            //const color = this.getColor(suitabilityScore);

            //const rect = drawRect(
            //    parentNode,
            //    50,
            //    20,
            //    TASK_BORDER_RADIUS,
            //    color
            //);

            //svgAttr(rect, {
            //    transform: "translate(-20, -10)",
            //});

            //var text = svgCreate("text");

            //svgAttr(text, {
            //    fill: "#fff",
            //    transform: "translate(-15, 5)",
            //});

            //svgClasses(text).add("djs-label");

            //svgAppend(text, document.createTextNode(suitabilityScore));

            //svgAppend(parentNode, text);

            this.drawCustomQA(parentNode);
        }

        return shape;
    }

    drawGoogleSheet(parentNode) {
        const background = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, COLOR_GREEN);
        svgAttr(background, {
            fill: "#000",
            transform: "translate(8, 52)",
        });

        const text = svgCreate("text");
        svgAttr(text, {
            fill: "#fff",
            transform: "translate(15, 69)",
        });

        svgAppend(text, document.createTextNode("GS"));
        svgAppend(parentNode, text);
    }

    drawCustomQA(parentNode) {
        const background = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, COLOR_BLACK);
        svgAttr(background, {
            fill: "#000",
            transform: "translate(8, 52)",
        });

        const text = svgCreate("text");
        svgAttr(text, {
            fill: "#fff",
            transform: "translate(15, 69)",
        });

        svgAppend(text, document.createTextNode("QA"));

        svgAppend(parentNode, text);
    }

    getShapePath(shape) {
        if (is(shape, "bpmn:Task")) {
            return getRoundRectPath(shape, TASK_BORDER_RADIUS);
        }

        return this.bpmnRenderer.getShapePath(shape);
    }

    getSuitabilityScore(element) {
        const businessObject = getBusinessObject(element);

        const { suitable } = businessObject;

        return Number.isFinite(suitable) ? suitable : null;
    }

    getAccessToken(element) {
        const businessObject = getBusinessObject(element);
        const { accessToken } = businessObject;
        return accessToken ?? null;
    }

    getColor(suitabilityScore) {
        if (suitabilityScore > 75) {
            return COLOR_GREEN;
        } else if (suitabilityScore > 25) {
            return COLOR_YELLOW;
        }

        return COLOR_RED;
    }
}

CustomRenderer.$inject = ["eventBus", "bpmnRenderer"];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, color) {
    const rect = svgCreate("rect");

    svgAttr(rect, {
        width: width,
        height: height,
        rx: borderRadius,
        ry: borderRadius,
        stroke: color,
        strokeWidth: 2,
        fill: color,
    });

    svgAppend(parentNode, rect);

    return rect;
}
