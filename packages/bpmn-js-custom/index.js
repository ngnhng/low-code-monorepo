//import CustomContextPad from "./CustomContextPad";
import CustomPalette from "./src/custom-palette";
import CustomRenderer from "./src/custom-renderer";
import CustomModdle from "./src/custom.json";

export const customModdle = ["value", CustomModdle];

export default {
    __init__: ["customPalette", "customRenderer"],
    //customContextPad: ["type", CustomContextPad],
    customPalette: ["type", CustomPalette],
    customRenderer: ["type", CustomRenderer],
    customModdle,
};
