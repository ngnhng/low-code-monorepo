import QAIcon, { GSIcon64 } from "./custom-icons";

const SUITABILITY_SCORE_HIGH = 100,
    SUITABILITY_SCORE_AVERGE = 50,
    SUITABILITY_SCORE_LOW = 25;

export default class CustomPalette {
    constructor(bpmnFactory, create, elementFactory, palette, translate) {
        this.bpmnFactory = bpmnFactory;
        this.create = create;
        this.elementFactory = elementFactory;
        this.translate = translate;

        palette.registerProvider(this);
    }

    getPaletteEntries(element) {
        const { bpmnFactory, create, elementFactory, translate } = this;

        function createTask(type) {
            return function (event) {
                const businessObject = bpmnFactory.create(type);

                businessObject.suitable = 50;

                const shape = elementFactory.createShape({
                    type: type,
                    businessObject: businessObject,
                });

                create.start(event, shape);
            };
        }

        function createGSTask(type) {
            return function (event) {
                const businessObject = bpmnFactory.create(type);

                businessObject.accessToken = "trole";

                const shape = elementFactory.createShape({
                    type: type,
                    businessObject: businessObject,
                });

                create.start(event, shape);
            };
        }

        return {
            "create.qa-task": {
                group: "activity",
                title: translate("Create QA Task"),
                imageUrl: QAIcon.dataUrl,
                action: {
                    dragstart: createTask("bpmn:ServiceTask"),
                    click: createTask("bpmn:ServiceTask"),
                },
            },
            "create.gs-task": {
                group: "activity",
                title: translate("Create Google Sheet Task"),
                imageUrl: GSIcon64,
                action: {
                    dragstart: createGSTask("bpmn:ServiceTask"),
                    click: createGSTask("bpmn:ServiceTask"),
                },
            },
            //"create.average-task": {
            //    group: "activity",
            //    className: "bpmn-icon-task yellow",
            //    title: translate("Create Task with average suitability score"),
            //    action: {
            //        dragstart: createTask(SUITABILITY_SCORE_AVERGE),
            //        click: createTask(SUITABILITY_SCORE_AVERGE),
            //    },
            //},
            //"create.high-task": {
            //    group: "activity",
            //    className: "bpmn-icon-task green",
            //    title: translate("Create Task with high suitability score"),
            //    action: {
            //        dragstart: createTask(SUITABILITY_SCORE_HIGH),
            //        click: createTask(SUITABILITY_SCORE_HIGH),
            //    },
            //},
        };
    }
}

CustomPalette.$inject = [
    "bpmnFactory",
    "create",
    "elementFactory",
    "palette",
    "translate",
];
