import QAIcon, { GSIcon64, mailIcon, tableServiceIcon } from "./custom-icons";

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

        // function createTask(type) {
        //     return function (event) {
        //         const businessObject = bpmnFactory.create(type);

        //         businessObject.suitable = 50;

        //         const shape = elementFactory.createShape({
        //             type: type,
        //             businessObject: businessObject,
        //         });

        //         create.start(event, shape);
        //     };
        // }

        function createGSTask(type) {
            return function (event) {
                const businessObject = bpmnFactory.create(type);

                businessObject.isGoogleSheet = true;

                const shape = elementFactory.createShape({
                    type: type,
                    businessObject: businessObject,
                });

                create.start(event, shape);
            };
        }

        function createMailServiceTask(type) {
            return function (event) {
                const businessObject = bpmnFactory.create(type);

                businessObject.isMailService = true;

                const shape = elementFactory.createShape({
                    type: type,
                    businessObject: businessObject,
                });

                create.start(event, shape);
            };
        }

        function createTableServiceTask(type) {
            return function (event) {
                const businessObject = bpmnFactory.create(type);

                businessObject.isTableService = true;

                const shape = elementFactory.createShape({
                    type: type,
                    businessObject: businessObject,
                });

                create.start(event, shape);
            };
        }

        return {
            "create.gs-task": {
                group: "activity",
                title: translate("Create Google Sheet Task"),
                imageUrl: GSIcon64,
                className: "bpmn-custom-palette-icon",
                action: {
                    dragstart: createGSTask("bpmn:ServiceTask"),
                    click: createGSTask("bpmn:ServiceTask"),
                },
            },
            "create.mail-service-task": {
                group: "activity",
                title: translate("Create Mail Sender Service Task"),
                imageUrl: mailIcon,
                className: "bpmn-custom-palette-icon",
                action: {
                    dragstart: createMailServiceTask("bpmn:ServiceTask"),
                    click: createMailServiceTask("bpmn:ServiceTask"),
                },
            },
            "create.table-service-task": {
                group: "activity",
                title: translate("Create Table Service Task"),
                imageUrl: tableServiceIcon,
                className: "bpmn-custom-palette-icon",
                action: {
                    dragstart: createTableServiceTask("bpmn:ServiceTask"),
                    click: createTableServiceTask("bpmn:ServiceTask"),
                },
            },
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
