import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";

import {
    append as svgAppend,
    attr as svgAttr,
    classes as svgClasses,
    create as svgCreate,
    remove as svgRemove,
    innerSVG as svgInner,
} from "tiny-svg";

import { getRoundRectPath } from "bpmn-js/lib/draw/BpmnRenderUtil";

import { is, getBusinessObject } from "bpmn-js/lib/util/ModelUtil";

import { isNil } from "min-dash";

const HIGH_PRIORITY = 1500,
    TASK_BORDER_RADIUS = 2,
    COLOR_GREEN = "#52B415",
    COLOR_YELLOW = "#ffc800",
    COLOR_RED = "#cc0000",
    COLOR_BLACK = "#000";

const googleSheetSvg = `<path fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table-2" d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>`;
const mailServiceSvg = `<rect width="20" height="16" x="2" y="4" rx="2" fill="none" stroke="currentColor" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" fill="none" stroke="currentColor"/>`
const tableServiceSvg = `<path fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" d="M13.5 2h-12l-.5.5v11l.5.5h12l.5-.5v-11l-.5-.5zM2 3h11v1H2V3zm7 4H6V5h3v2zm0 1v2H6V8h3zM2 5h3v2H2V5zm0 3h3v2H2V8zm0 5v-2h3v2H2zm4 0v-2h3v2H6zm7 0h-3v-2h3v2zm0-3h-3V8h3v2zm-3-3V5h3v2h-3z"/>`;

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
        const isMailService = this.isMailService(element);
        const isTableService = this.isTableService(element);

        if (isGoogleSheet) {
            this.drawGoogleSheet(parentNode);
            svgRemove(shape);
        }

        if (isMailService) {
            this.drawMailService(parentNode);
            svgRemove(shape);
        }

        if (isTableService) {
            this.drawTableService(parentNode);
            svgRemove(shape);
        }

        return shape;
    }

    drawGoogleSheet(parentNode) {
        drawRect(parentNode, 100, 80, 10, COLOR_BLACK, "transparent");

        const svg = svgCreate("g");
        svgInner(svg, googleSheetSvg);
        svgAttr(svg, {
            transform: "translate(72, 53)",
        });

        // svgAppend(text, document.createTextNode("Google Sheet"));
        // svgAppend(parentNode, text);
        svgAppend(parentNode, svg);
    }

    drawMailService(parentNode) {
        drawRect(parentNode, 100, 80, 10, COLOR_BLACK, "transparent");

        const svg = svgCreate("g");
        svgInner(svg, mailServiceSvg);
        svgAttr(svg, {
            transform: "translate(72, 53)",
        });

        // svgAppend(text, document.createTextNode("Google Sheet"));
        // svgAppend(parentNode, text);
        svgAppend(parentNode, svg);
    }

    drawTableService(parentNode) {
        drawRect(parentNode, 100, 80, 10, COLOR_BLACK, "transparent");

        const svg = svgCreate("g");
        svgInner(svg, tableServiceSvg);
        svgAttr(svg, {
            transform: "translate(72, 53)",
        });

        // svgAppend(text, document.createTextNode("Google Sheet"));
        // svgAppend(parentNode, text);
        svgAppend(parentNode, svg);
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

    isMailService(element) {
        const businessObject = getBusinessObject(element);
        const { isMailService } = businessObject;
        return isMailService ?? false;
    }

    isTableService(element) {
        const businessObject = getBusinessObject(element);
        const { isTableService } = businessObject;
        return isTableService ?? false;
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
