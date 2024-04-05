//import CustomContextPad from "./CustomContextPad";
import CustomPalette from "./src/custom-palette";
import CustomRenderer from "./src/custom-renderer";
// import CustomModdle from "./src/custom.json";
import GSModel from "./src/model.json"

// export const customModdle = ["value", CustomModdle];
export const gsModel = ["value", GSModel];

export default {
    __init__: ["customPalette", "customRenderer"],
    //customContextPad: ["type", CustomContextPad],
    customPalette: ["type", CustomPalette],
    customRenderer: ["type", CustomRenderer],
    // customModdle,
    gsModel
};
