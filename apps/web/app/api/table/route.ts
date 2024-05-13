/* eslint-disable @typescript-eslint/no-unused-vars */
export async function GET() {
    return Response.json([
        {
            label: "Col 1",
            type: "string",
            id: "123",
        },
        {
            label: "Col 2",
            type: "number",
            id: "456",
        },
        {
            label: "Col 3",
            type: "boolean",
            id: "789",
        },
        {
            label: "Col 4",
            type: "date",
            id: "111",
        },
        {
            label: "Col 5",
            type: "time",
            id: "222",
        },
    ]);
}

type TableData = {
    tid: string;
    name: string;
    label: string;
    columns: Column[];
    mm: boolean;
};

type Column = {
    id: string;
    name: string;
    label: string;
    type: string;
};

//[
//    {
//        tid: "mqmzwblmxi3",
//        name: "campaign___participants",
//        label: "Campaign Participants",
//        columns: [
//            {
//                id: "cxjcw85ncos",
//                name: "id",
//                label: "id",
//                type: "primary_key",
//            },
//            {
//                id: "cdsmmk7esgp",
//                name: "name",
//                label: "Name",
//                type: "string",
//            },
//            {
//                id: "cj99pzkmp6t",
//                name: "phone___number",
//                label: "Phone Number",
//                type: "string",
//            },
//            {
//                id: "cpw5wafg6hx",
//                name: "survey____spending",
//                label: "Survey - Spending",
//                type: "string",
//            },
//            {
//                id: "cogydb45mnu",
//                name: "link___to___feedback",
//                label: "Link To Feedback",
//                type: "link",
//            },
//            {
//                id: "cdmbauypmym",
//                name: "link___to___feedback_2",
//                label: "Link To Feedback 2",
//                type: "link",
//            },
//        ],
//        mm: false,
//    },
//    {
//        tid: "mcth4ale8v5",
//        name: "campaign___feedback",
//        label: "Campaign Feedback",
//        columns: [
//            {
//                id: "cgt2hibgwdb",
//                name: "id",
//                label: "id",
//                type: "primary_key",
//            },
//            {
//                id: "cduupahle5q",
//                name: "name",
//                label: "Name",
//                type: "string",
//            },
//            {
//                id: "cf5oxgag7hi",
//                name: "phone___number",
//                label: "Phone Number",
//                type: "string",
//            },
//            {
//                id: "cepe59efwn5",
//                name: "comments",
//                label: "Comments",
//                type: "string",
//            },
//            {
//                id: "cnzow1qbkgb",
//                name: "campaign___participants_cxh7wvcuvsy",
//                label: "Campaign Participants",
//                type: "link",
//            },
//            {
//                id: "ccz5sglgkfr",
//                name: "campaign___participants_cmlv8yj87bs",
//                label: "Campaign Participants",
//                type: "link",
//            },
//        ],
//        mm: false,
//    },
//];
