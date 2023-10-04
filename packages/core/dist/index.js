"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
var core_exports = {};
__export(core_exports, {
  Button: () => Button,
  DropZone: () => DropZone,
  DropZoneProvider: () => DropZoneProvider,
  FieldLabel: () => FieldLabel,
  IconButton: () => IconButton,
  Puck: () => Puck,
  Render: () => Render,
  dropZoneContext: () => dropZoneContext
});
module.exports = __toCommonJS(core_exports);

// ../tsup-config/react-import.js
var import_react = __toESM(require("react"));

// components/Button/Button.tsx
var import_react2 = require("react");

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/Button/Button.module.css#css-module
var Button_module_default = { "Button": "_Button_1muck_1", "Button--medium": "_Button--medium_1muck_20", "Button--large": "_Button--large_1muck_27", "Button-icon": "_Button-icon_1muck_34", "Button--primary": "_Button--primary_1muck_42", "Button--secondary": "_Button--secondary_1muck_51", "Button--flush": "_Button--flush_1muck_62", "Button--disabled": "_Button--disabled_1muck_66", "Button--fullWidth": "_Button--fullWidth_1muck_76" };

// lib/get-class-name-factory.ts
var import_classnames = __toESM(require("classnames"));
var getClassNameFactory = (rootClass, styles, { baseClass = "" } = {}) => (options = {}) => {
  let descendant = false;
  let modifiers = false;
  if (typeof options === "string") {
    descendant = options;
  } else if (typeof options === "object") {
    modifiers = options;
  }
  if (descendant) {
    return baseClass + styles[`${rootClass}-${descendant}`] || "";
  } else if (modifiers) {
    const prefixedModifiers = {};
    for (let modifier in modifiers) {
      prefixedModifiers[styles[`${rootClass}--${modifier}`]] = modifiers[modifier];
    }
    const c = styles[rootClass];
    return baseClass + (0, import_classnames.default)(__spreadValues({
      [c]: !!c
    }, prefixedModifiers));
  } else {
    return baseClass + styles[rootClass] || "";
  }
};
var get_class_name_factory_default = getClassNameFactory;

// components/Button/Button.tsx
var import_react_spinners = require("react-spinners");
var import_jsx_runtime = require("react/jsx-runtime");
var getClassName = get_class_name_factory_default("Button", Button_module_default);
var Button = ({
  children,
  href,
  onClick,
  variant = "primary",
  type,
  disabled,
  tabIndex,
  newTab,
  fullWidth,
  icon,
  size = "medium"
}) => {
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const ElementType = href ? "a" : "button";
  const el = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    ElementType,
    {
      className: getClassName({
        primary: variant === "primary",
        secondary: variant === "secondary",
        disabled,
        fullWidth,
        [size]: true
      }),
      onClick: (e) => {
        if (!onClick)
          return;
        setLoading(true);
        Promise.resolve(onClick(e)).then(() => {
          setLoading(false);
        });
      },
      type,
      disabled: disabled || loading,
      tabIndex,
      target: newTab ? "_blank" : void 0,
      rel: newTab ? "noreferrer" : void 0,
      href,
      children: [
        icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: getClassName("icon"), children: icon }),
        children,
        loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          "\xA0\xA0",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_spinners.ClipLoader, { color: "inherit", size: "14px" })
        ] })
      ]
    }
  );
  return el;
};

// components/DropZone/index.tsx
var import_react7 = require("react");

// components/DraggableComponent/index.tsx
var import_react4 = require("react");
var import_react_beautiful_dnd = require("react-beautiful-dnd");

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/DraggableComponent/styles.module.css#css-module
var styles_module_default = { "DraggableComponent": "_DraggableComponent_1nlo8_1", "DraggableComponent--isDragging": "_DraggableComponent--isDragging_1nlo8_6", "DraggableComponent-contents": "_DraggableComponent-contents_1nlo8_12", "DraggableComponent-overlay": "_DraggableComponent-overlay_1nlo8_24", "DraggableComponent--isLocked": "_DraggableComponent--isLocked_1nlo8_39", "DraggableComponent--forceHover": "_DraggableComponent--forceHover_1nlo8_45", "DraggableComponent--indicativeHover": "_DraggableComponent--indicativeHover_1nlo8_50", "DraggableComponent--isSelected": "_DraggableComponent--isSelected_1nlo8_57", "DraggableComponent-actions": "_DraggableComponent-actions_1nlo8_70", "DraggableComponent-actionsLabel": "_DraggableComponent-actionsLabel_1nlo8_93", "DraggableComponent-action": "_DraggableComponent-action_1nlo8_70" };

// components/DraggableComponent/index.tsx
var import_react_feather = require("react-feather");

// lib/use-modifier-held.ts
var import_react3 = require("react");
var useModifierHeld = (modifier) => {
  const [modifierHeld, setModifierHeld] = (0, import_react3.useState)(false);
  (0, import_react3.useEffect)(() => {
    function downHandler({ key }) {
      if (key === modifier) {
        setModifierHeld(true);
      }
    }
    function upHandler({ key }) {
      if (key === modifier) {
        setModifierHeld(false);
      }
    }
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [modifier]);
  return modifierHeld;
};

// components/DraggableComponent/index.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var getClassName2 = get_class_name_factory_default("DraggableComponent", styles_module_default);
var DraggableComponent = ({
  children,
  id,
  index,
  isSelected = false,
  onClick = () => null,
  onMount = () => null,
  onMouseOver = () => null,
  onMouseOut = () => null,
  onDelete = () => null,
  onDuplicate = () => null,
  debug,
  label,
  isLocked = false,
  isDragDisabled,
  forceHover = false,
  indicativeHover = false,
  style
}) => {
  const isModifierHeld = useModifierHeld("Alt");
  (0, import_react4.useEffect)(onMount, []);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_react_beautiful_dnd.Draggable,
    {
      draggableId: id,
      index,
      isDragDisabled,
      children: (provided, snapshot) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "div",
        __spreadProps(__spreadValues(__spreadValues({
          ref: provided.innerRef
        }, provided.draggableProps), provided.dragHandleProps), {
          className: getClassName2({
            isSelected,
            isModifierHeld,
            isDragging: snapshot.isDragging,
            isLocked,
            forceHover,
            indicativeHover
          }),
          style: __spreadProps(__spreadValues(__spreadValues({}, style), provided.draggableProps.style), {
            cursor: isModifierHeld ? "initial" : "grab"
          }),
          onMouseOver,
          onMouseOut,
          onClick,
          children: [
            debug,
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: getClassName2("contents"), children }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: getClassName2("overlay"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: getClassName2("actions"), children: [
              label && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: getClassName2("actionsLabel"), children: label }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: getClassName2("action"), onClick: onDuplicate, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_feather.Copy, { size: 16 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: getClassName2("action"), onClick: onDelete, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_feather.Trash, { size: 16 }) })
            ] }) })
          ]
        })
      )
    },
    id
  );
};

// components/DroppableStrictMode/index.tsx
var import_react5 = require("react");
var import_react_beautiful_dnd2 = require("react-beautiful-dnd");
var import_jsx_runtime3 = require("react/jsx-runtime");
var DroppableStrictMode = (_a) => {
  var _b = _a, { children } = _b, props = __objRest(_b, ["children"]);
  const [enabled, setEnabled] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react_beautiful_dnd2.Droppable, __spreadProps(__spreadValues({}, props), { children }));
};
var DroppableStrictMode_default = DroppableStrictMode;

// lib/root-droppable-id.ts
var rootDroppableId = "default-zone";

// lib/setup-zone.ts
var setupZone = (data, zoneKey) => {
  if (zoneKey === rootDroppableId) {
    return data;
  }
  const newData = __spreadValues({}, data);
  newData.zones = data.zones || {};
  newData.zones[zoneKey] = newData.zones[zoneKey] || [];
  return newData;
};

// lib/get-item.ts
var getItem = (selector, data) => {
  if (!selector.zone || selector.zone === rootDroppableId) {
    return data.content[selector.index];
  }
  return setupZone(data, selector.zone).zones[selector.zone][selector.index];
};

// lib/filter.ts
var filter = (obj, validKeys) => {
  return validKeys.reduce((acc, item) => {
    if (typeof obj[item] !== "undefined") {
      return __spreadProps(__spreadValues({}, acc), { [item]: obj[item] });
    }
    return acc;
  }, {});
};

// lib/reorder.ts
var reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// lib/replace.ts
var replace = (list, index, newItem) => {
  const result = Array.from(list);
  result.splice(index, 1);
  result.splice(index, 0, newItem);
  return result;
};

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/DropZone/styles.module.css#css-module
var styles_module_default2 = { "DropZone": "_DropZone_1980k_1", "DropZone-content": "_DropZone-content_1980k_11", "DropZone--userIsDragging": "_DropZone--userIsDragging_1980k_16", "DropZone--draggingOverArea": "_DropZone--draggingOverArea_1980k_20", "DropZone--draggingNewComponent": "_DropZone--draggingNewComponent_1980k_21", "DropZone--isAreaSelected": "_DropZone--isAreaSelected_1980k_27", "DropZone--hoveringOverArea": "_DropZone--hoveringOverArea_1980k_28", "DropZone--isDisabled": "_DropZone--isDisabled_1980k_29", "DropZone--isRootZone": "_DropZone--isRootZone_1980k_30", "DropZone--hasChildren": "_DropZone--hasChildren_1980k_36", "DropZone--isDestination": "_DropZone--isDestination_1980k_41", "DropZone-item": "_DropZone-item_1980k_49", "DropZone-hitbox": "_DropZone-hitbox_1980k_57" };

// components/DropZone/context.tsx
var import_react6 = require("react");
var import_use_debounce = require("use-debounce");

// lib/get-zone-id.ts
var getZoneId = (zoneCompound) => {
  if (!zoneCompound) {
    return [];
  }
  if (zoneCompound && zoneCompound.indexOf(":") > -1) {
    return zoneCompound.split(":");
  }
  return ["root", zoneCompound];
};

// components/DropZone/context.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var dropZoneContext = (0, import_react6.createContext)(null);
var DropZoneProvider = ({
  children,
  value
}) => {
  const [hoveringArea, setHoveringArea] = (0, import_react6.useState)(null);
  const [hoveringZone, setHoveringZone] = (0, import_react6.useState)(
    rootDroppableId
  );
  const [hoveringComponent, setHoveringComponent] = (0, import_react6.useState)();
  const [hoveringAreaDb] = (0, import_use_debounce.useDebounce)(hoveringArea, 75, { leading: false });
  const [areasWithZones, setAreasWithZones] = (0, import_react6.useState)(
    {}
  );
  const [activeZones, setActiveZones] = (0, import_react6.useState)({});
  const { dispatch = null } = value || {};
  const registerZoneArea = (0, import_react6.useCallback)(
    (area) => {
      setAreasWithZones((latest) => __spreadProps(__spreadValues({}, latest), { [area]: true }));
    },
    [setAreasWithZones]
  );
  const registerZone = (0, import_react6.useCallback)(
    (zoneCompound) => {
      if (!dispatch) {
        return;
      }
      dispatch({
        type: "registerZone",
        zone: zoneCompound
      });
      setActiveZones((latest) => __spreadProps(__spreadValues({}, latest), { [zoneCompound]: true }));
    },
    [setActiveZones, dispatch]
  );
  const unregisterZone = (0, import_react6.useCallback)(
    (zoneCompound) => {
      if (!dispatch) {
        return;
      }
      dispatch({
        type: "unregisterZone",
        zone: zoneCompound
      });
      setActiveZones((latest) => __spreadProps(__spreadValues({}, latest), {
        [zoneCompound]: false
      }));
    },
    [setActiveZones, dispatch]
  );
  const [pathData, setPathData] = (0, import_react6.useState)();
  const registerPath = (0, import_react6.useCallback)(
    (selector) => {
      if (!(value == null ? void 0 : value.data)) {
        return;
      }
      const item = getItem(selector, value.data);
      if (!item) {
        return;
      }
      const [area] = getZoneId(selector.zone);
      setPathData((latestPathData = {}) => {
        const pathData2 = latestPathData[area] || [];
        return __spreadProps(__spreadValues({}, latestPathData), {
          [item.props.id]: [
            ...pathData2,
            {
              selector,
              label: item.type
            }
          ]
        });
      });
    },
    [value, setPathData]
  );
  const providerValue = (0, import_react6.useMemo)(() => {
    if (!value) {
      return null;
    }
    return __spreadValues({
      hoveringArea: value.draggedItem ? hoveringAreaDb : hoveringArea,
      setHoveringArea,
      hoveringZone,
      setHoveringZone,
      hoveringComponent,
      setHoveringComponent,
      registerZoneArea,
      areasWithZones,
      registerZone,
      unregisterZone,
      activeZones,
      registerPath,
      pathData
    }, value);
  }, [
    hoveringAreaDb,
    hoveringArea,
    setHoveringArea,
    hoveringZone,
    setHoveringZone,
    hoveringComponent,
    setHoveringComponent,
    registerZoneArea,
    areasWithZones,
    registerZone,
    unregisterZone,
    activeZones,
    registerPath,
    pathData,
    value
    // Make sure this object is stable as well
  ]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_jsx_runtime4.Fragment, { children: value && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(dropZoneContext.Provider, { value: providerValue, children }) });
};

// components/DropZone/index.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var getClassName3 = get_class_name_factory_default("DropZone", styles_module_default2);
function DropZoneEdit({ zone, style }) {
  var _a;
  const ctx = (0, import_react7.useContext)(dropZoneContext);
  console.log("DropZoneEdit", ctx);
  const {
    // These all need setting via context
    data,
    dispatch = () => null,
    config,
    itemSelector,
    setItemSelector = () => null,
    areaId,
    draggedItem,
    placeholderStyle,
    registerZoneArea,
    areasWithZones,
    hoveringComponent
  } = ctx || {};
  console.log("DropZoneEdit - ctx", ctx);
  let content = data.content || [];
  let zoneCompound = rootDroppableId;
  console.log("zoneCompound", zoneCompound);
  (0, import_react7.useEffect)(() => {
    if (areaId && registerZoneArea) {
      registerZoneArea(areaId);
    }
  }, [areaId]);
  (0, import_react7.useEffect)(() => {
    if (ctx == null ? void 0 : ctx.registerZone) {
      ctx == null ? void 0 : ctx.registerZone(zoneCompound);
    }
    return () => {
      if (ctx == null ? void 0 : ctx.unregisterZone) {
        ctx == null ? void 0 : ctx.unregisterZone(zoneCompound);
      }
    };
  }, []);
  if (areaId) {
    if (zone !== rootDroppableId) {
      zoneCompound = `${areaId}:${zone}`;
      console.log("DropZoneEdit - zoneCompound", zoneCompound);
      content = setupZone(data, zoneCompound).zones[zoneCompound];
    }
  }
  const isRootZone = zoneCompound === rootDroppableId || zone === rootDroppableId || areaId === "root";
  const draggedSourceId = draggedItem && draggedItem.source.droppableId;
  const draggedDestinationId = draggedItem && ((_a = draggedItem.destination) == null ? void 0 : _a.droppableId);
  const [zoneArea] = getZoneId(zoneCompound);
  const [draggedSourceArea] = getZoneId(draggedSourceId);
  const userIsDragging = !!draggedItem;
  const draggingOverArea = userIsDragging && zoneArea === draggedSourceArea;
  const draggingNewComponent = draggedSourceId === "component-list";
  if (!(ctx == null ? void 0 : ctx.config) || !ctx.setHoveringArea || !ctx.setHoveringZone || !ctx.setHoveringComponent || !ctx.setItemSelector || !ctx.registerPath || !ctx.dispatch) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { children: "DropZone requires context to work." });
  }
  const {
    hoveringArea = "root",
    setHoveringArea,
    hoveringZone,
    setHoveringZone,
    setHoveringComponent
  } = ctx;
  const hoveringOverArea = hoveringArea ? hoveringArea === zoneArea : isRootZone;
  const hoveringOverZone = hoveringZone === zoneCompound;
  let isEnabled = false;
  if (userIsDragging) {
    if (draggingNewComponent) {
      isEnabled = hoveringOverArea;
    } else {
      isEnabled = draggingOverArea && hoveringOverZone;
    }
  }
  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const isAreaSelected = selectedItem && zoneArea === selectedItem.props.id;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "div",
    {
      className: getClassName3({
        isRootZone,
        userIsDragging,
        draggingOverArea,
        hoveringOverArea,
        draggingNewComponent,
        isDestination: draggedDestinationId === zoneCompound,
        isDisabled: !isEnabled,
        isAreaSelected,
        hasChildren: content.length > 0
      }),
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        DroppableStrictMode_default,
        {
          droppableId: zoneCompound,
          direction: "vertical",
          isDropDisabled: !isEnabled,
          children: (provided, snapshot) => {
            return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
              "div",
              __spreadProps(__spreadValues({}, (provided || { droppableProps: {} }).droppableProps), {
                className: getClassName3("content"),
                ref: provided == null ? void 0 : provided.innerRef,
                style,
                id: zoneCompound,
                onMouseOver: (e) => {
                  e.stopPropagation();
                  setHoveringArea(zoneArea);
                  setHoveringZone(zoneCompound);
                },
                children: [
                  content.map((item, i) => {
                    var _a2;
                    const componentId = item.props.id;
                    const defaultedProps = __spreadProps(__spreadValues(__spreadValues({}, (_a2 = config.components[item.type]) == null ? void 0 : _a2.defaultProps), item.props), {
                      editMode: true
                    });
                    const isSelected = (selectedItem == null ? void 0 : selectedItem.props.id) === componentId || false;
                    const containsZone = areasWithZones ? areasWithZones[componentId] : false;
                    const Render2 = config.components[item.type] ? config.components[item.type].render : () => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { padding: 48, textAlign: "center" }, children: [
                      "No configuration for ",
                      item.type
                    ] });
                    console.log("What", ctx);
                    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: getClassName3("item"), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                        DropZoneProvider,
                        {
                          value: __spreadProps(__spreadValues({}, ctx), {
                            areaId: componentId
                          }),
                          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                            DraggableComponent,
                            {
                              label: item.type.toString(),
                              id: `draggable-${componentId}`,
                              index: i,
                              isSelected,
                              isLocked: userIsDragging,
                              forceHover: hoveringComponent === componentId && !userIsDragging,
                              indicativeHover: userIsDragging && containsZone && hoveringArea === componentId,
                              onMount: () => {
                                ctx.registerPath({
                                  index: i,
                                  zone: zoneCompound
                                });
                              },
                              onClick: (e) => {
                                setItemSelector({
                                  index: i,
                                  zone: zoneCompound
                                });
                                e.stopPropagation();
                              },
                              onMouseOver: (e) => {
                                e.stopPropagation();
                                if (containsZone) {
                                  setHoveringArea(componentId);
                                } else {
                                  setHoveringArea(zoneArea);
                                }
                                setHoveringComponent(componentId);
                                setHoveringZone(zoneCompound);
                              },
                              onMouseOut: () => {
                                setHoveringArea(null);
                                setHoveringZone(null);
                                setHoveringComponent(null);
                              },
                              onDelete: (e) => {
                                dispatch({
                                  type: "remove",
                                  index: i,
                                  zone: zoneCompound
                                });
                                setItemSelector(null);
                                e.stopPropagation();
                              },
                              onDuplicate: (e) => {
                                dispatch({
                                  type: "duplicate",
                                  sourceIndex: i,
                                  sourceZone: zoneCompound
                                });
                                setItemSelector({
                                  zone: zoneCompound,
                                  index: i + 1
                                });
                                e.stopPropagation();
                              },
                              style: {
                                pointerEvents: userIsDragging && draggingNewComponent ? "all" : void 0
                              },
                              children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { zoom: 0.75 }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Render2, __spreadValues({}, defaultedProps)) })
                            }
                          )
                        }
                      ),
                      userIsDragging && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                        "div",
                        {
                          className: getClassName3("hitbox"),
                          onMouseOver: (e) => {
                            e.stopPropagation();
                            setHoveringArea(zoneArea);
                            setHoveringZone(zoneCompound);
                          }
                        }
                      )
                    ] }, item.props.id);
                  }),
                  provided == null ? void 0 : provided.placeholder,
                  (snapshot == null ? void 0 : snapshot.isDraggingOver) && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                    "div",
                    {
                      "data-puck-placeholder": true,
                      style: __spreadProps(__spreadValues({}, placeholderStyle), {
                        background: "var(--puck-color-azure-5)",
                        opacity: 0.3,
                        zIndex: 0
                      })
                    }
                  )
                ]
              })
            );
          }
        }
      )
    }
  );
}
function DropZoneRender({ zone }) {
  const ctx = (0, import_react7.useContext)(dropZoneContext);
  console.log("DropZoneRender", ctx);
  const { data, areaId = "root", config } = ctx || {};
  let zoneCompound = rootDroppableId;
  console.log("zoneCompound", zoneCompound);
  let content = (data == null ? void 0 : data.content) || [];
  if (!data || !config) {
    return null;
  }
  if (areaId && zone && zone !== rootDroppableId) {
    zoneCompound = `${areaId}:${zone}`;
    content = setupZone(data, zoneCompound).zones[zoneCompound];
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, { children: content.map((item) => {
    const Component = config.components[item.type];
    if (Component) {
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        DropZoneProvider,
        {
          value: { data, config, areaId: item.props.id },
          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Component.render, __spreadValues({}, item.props))
        },
        item.props.id
      );
    }
    return null;
  }) });
}
function DropZone(props) {
  const ctx = (0, import_react7.useContext)(dropZoneContext);
  console.log("Render DropZone", ctx);
  console.log("Render DropZone props", props);
  if ((ctx == null ? void 0 : ctx.mode) === "edit") {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DropZoneEdit, __spreadValues({}, props));
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DropZoneRender, __spreadValues({}, props));
}

// components/IconButton/IconButton.tsx
var import_react8 = require("react");

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/IconButton/IconButton.module.css#css-module
var IconButton_module_default = { "IconButton": "_IconButton_13gzt_1" };

// components/IconButton/IconButton.tsx
var import_react_spinners2 = require("react-spinners");
var import_jsx_runtime6 = require("react/jsx-runtime");
var getClassName4 = get_class_name_factory_default("IconButton", IconButton_module_default);
var IconButton = ({
  children,
  href,
  onClick,
  variant = "primary",
  type,
  disabled,
  tabIndex,
  newTab,
  fullWidth,
  title
}) => {
  const [loading, setLoading] = (0, import_react8.useState)(false);
  const ElementType = href ? "a" : "button";
  const el = /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    ElementType,
    {
      className: getClassName4({
        primary: variant === "primary",
        secondary: variant === "secondary",
        disabled,
        fullWidth
      }),
      onClick: (e) => {
        if (!onClick)
          return;
        setLoading(true);
        Promise.resolve(onClick(e)).then(() => {
          setLoading(false);
        });
      },
      type,
      disabled: disabled || loading,
      tabIndex,
      target: newTab ? "_blank" : void 0,
      rel: newTab ? "noreferrer" : void 0,
      href,
      title,
      children: [
        children,
        loading && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
          "\xA0\xA0",
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_react_spinners2.ClipLoader, { color: "inherit", size: "14px" })
        ] })
      ]
    }
  );
  return el;
};

// components/Puck/index.tsx
var import_react12 = require("react");
var import_react_beautiful_dnd4 = require("react-beautiful-dnd");

// components/ExternalInput/index.tsx
var import_react9 = require("react");

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/ExternalInput/styles.module.css#css-module
var styles_module_default3 = { "ExternalInput": "_ExternalInput_l4bks_1", "ExternalInput-actions": "_ExternalInput-actions_l4bks_5", "ExternalInput-button": "_ExternalInput-button_l4bks_9", "ExternalInput-detachButton": "_ExternalInput-detachButton_l4bks_28", "ExternalInput--hasData": "_ExternalInput--hasData_l4bks_35", "ExternalInput-modal": "_ExternalInput-modal_l4bks_55", "ExternalInput--modalVisible": "_ExternalInput--modalVisible_l4bks_69", "ExternalInput-modalInner": "_ExternalInput-modalInner_l4bks_73", "ExternalInput-modalHeading": "_ExternalInput-modalHeading_l4bks_84", "ExternalInput-modalTableWrapper": "_ExternalInput-modalTableWrapper_l4bks_89" };

// components/ExternalInput/index.tsx
var import_react_feather2 = require("react-feather");
var import_jsx_runtime7 = require("react/jsx-runtime");
var getClassName5 = get_class_name_factory_default("ExternalInput", styles_module_default3);
var ExternalInput = ({
  field,
  onChange,
  value = null
}) => {
  const [data, setData] = (0, import_react9.useState)([]);
  const [isOpen, setOpen] = (0, import_react9.useState)(false);
  const [selectedData, setSelectedData] = (0, import_react9.useState)(value);
  (0, import_react9.useEffect)(() => {
    (() => __async(void 0, null, function* () {
      if (field.adaptor) {
        const listData = yield field.adaptor.fetchList(field.adaptorParams);
        if (listData) {
          setData(listData);
        }
      }
    }))();
  }, [field.adaptor, field.adaptorParams]);
  if (!field.adaptor) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { children: "Incorrectly configured" });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "div",
    {
      className: getClassName5({
        hasData: !!selectedData,
        modalVisible: isOpen
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: getClassName5("actions"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              onClick: () => setOpen(true),
              className: getClassName5("button"),
              children: selectedData ? field.getItemSummary ? field.getItemSummary(selectedData) : `${field.adaptor.name} item` : /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_react_feather2.Link, { size: "16" }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
                  "Select from ",
                  field.adaptor.name
                ] })
              ] })
            }
          ),
          selectedData && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              className: getClassName5("detachButton"),
              onClick: () => {
                setSelectedData(null);
                onChange(null);
              },
              children: "Detach"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: getClassName5("modal"), onClick: () => setOpen(false), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "div",
          {
            className: getClassName5("modalInner"),
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: getClassName5("modalHeading"), children: "Select content" }),
              data.length ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: getClassName5("modalTableWrapper"), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("table", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tr", { children: Object.keys(data[0]).map((key) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("th", { style: { textAlign: "left" }, children: key }, key)) }) }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tbody", { children: data.map((item, i) => {
                  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    "tr",
                    {
                      style: { whiteSpace: "nowrap" },
                      onClick: (e) => {
                        onChange(item);
                        setOpen(false);
                        setSelectedData(item);
                      },
                      children: Object.keys(item).map((key) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { children: item[key] }, key))
                    },
                    i
                  );
                }) })
              ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { padding: 24 }, children: "No content" })
            ]
          }
        ) })
      ]
    }
  );
};

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/InputOrGroup/styles.module.css#css-module
var styles_module_default4 = { "Input": "_Input_izwhv_1", "Input-label": "_Input-label_izwhv_27", "Input-labelIcon": "_Input-labelIcon_izwhv_34", "Input-input": "_Input-input_izwhv_39", "Input--readOnly": "_Input--readOnly_izwhv_60", "Input-arrayItem": "_Input-arrayItem_izwhv_69", "Input-fieldset": "_Input-fieldset_izwhv_95", "Input-arrayItemAction": "_Input-arrayItemAction_izwhv_116", "Input-addButton": "_Input-addButton_izwhv_135", "Input-array": "_Input-array_izwhv_69", "Input-radioGroupItems": "_Input-radioGroupItems_izwhv_156", "Input-radio": "_Input-radio_izwhv_156", "Input-radioInner": "_Input-radioInner_izwhv_173", "Input-radioInput": "_Input-radioInput_izwhv_185" };

// components/InputOrGroup/index.tsx
var import_react_feather3 = require("react-feather");
var import_jsx_runtime8 = require("react/jsx-runtime");
var getClassName6 = get_class_name_factory_default("Input", styles_module_default4);
var FieldLabel = ({
  children,
  icon,
  label
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("label"), children: [
      icon && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon") }),
      label
    ] }),
    children
  ] });
};
var InputOrGroup = ({
  name,
  field,
  value,
  label,
  onChange,
  readOnly
}) => {
  if (field.type === "array") {
    if (!field.arrayFields) {
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("b", { className: getClassName6("label"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react_feather3.List, { size: 16 }) }),
        label || name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("array"), children: [
        Array.isArray(value) ? value.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "details",
          {
            className: getClassName6("arrayItem"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("summary", { children: [
                field.getItemSummary ? field.getItemSummary(item, i) : `Item #${i}`,
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("arrayItemAction"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  IconButton,
                  {
                    onClick: () => {
                      const existingValue = value || [];
                      existingValue.splice(i, 1);
                      onChange(existingValue);
                    },
                    title: "Delete",
                    children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react_feather3.Trash, { size: 21 })
                  }
                ) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("fieldset", { className: getClassName6("fieldset"), children: Object.keys(field.arrayFields).map((fieldName) => {
                const subField = field.arrayFields[fieldName];
                return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  InputOrGroup,
                  {
                    name: `${name}_${i}_${fieldName}`,
                    label: subField.label || fieldName,
                    field: subField,
                    value: item[fieldName],
                    onChange: (val) => onChange(
                      replace(value, i, __spreadProps(__spreadValues({}, item), { [fieldName]: val }))
                    )
                  },
                  `${name}_${i}_${fieldName}`
                );
              }) })
            ]
          },
          `${name}_${i}`
        )) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", {}),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            className: getClassName6("addButton"),
            onClick: () => {
              const existingValue = value || [];
              onChange([...existingValue, field.defaultItemProps || {}]);
            },
            children: "+ Add item"
          }
        )
      ] })
    ] });
  }
  if (field.type === "external") {
    if (!field.adaptor) {
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6(""), children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("label"), children: name === "_data" ? "External content" : label || name }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ExternalInput, { field, onChange, value })
    ] });
  }
  if (field.type === "select") {
    if (!field.options) {
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: getClassName6(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("label"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react_feather3.ChevronDown, { size: 16 }) }),
        label || name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "select",
        {
          className: getClassName6("input"),
          onChange: (e) => {
            if (e.currentTarget.value === "true" || e.currentTarget.value === "false") {
              onChange(Boolean(e.currentTarget.value));
              return;
            }
            onChange(e.currentTarget.value);
          },
          value,
          children: field.options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "option",
            {
              label: option.label,
              value: option.value
            },
            option.label + option.value
          ))
        }
      )
    ] });
  }
  if (field.type === "textarea") {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: getClassName6({ readOnly }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("label"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react_feather3.Type, { size: 16 }) }),
        label || name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "textarea",
        {
          className: getClassName6("input"),
          autoComplete: "off",
          name,
          value: typeof value === "undefined" ? "" : value,
          onChange: (e) => onChange(e.currentTarget.value),
          readOnly,
          rows: 5
        }
      )
    ] });
  }
  if (field.type === "radio") {
    if (!field.options) {
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6(), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("radioGroup"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("label"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react_feather3.CheckCircle, { size: 16 }) }),
        field.label || name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("radioGroupItems"), children: field.options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
        "label",
        {
          className: getClassName6("radio"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              "input",
              {
                type: "radio",
                className: getClassName6("radioInput"),
                value: option.value,
                name,
                onChange: (e) => {
                  if (e.currentTarget.value === "true" || e.currentTarget.value === "false") {
                    onChange(JSON.parse(e.currentTarget.value));
                    return;
                  }
                  onChange(e.currentTarget.value);
                },
                readOnly,
                defaultChecked: value === option.value
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("radioInner"), children: option.label || option.value })
          ]
        },
        option.label + option.value
      )) })
    ] }) });
  }
  if (field.type === "custom") {
    if (!field.render) {
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6(), children: field.render({
      field,
      name,
      value,
      onChange,
      readOnly
    }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: getClassName6({ readOnly }), children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("label"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: getClassName6("labelIcon"), children: [
        field.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react_feather3.Type, { size: 16 }),
        field.type === "number" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react_feather3.Hash, { size: 16 })
      ] }),
      label || name
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "input",
      {
        className: getClassName6("input"),
        autoComplete: "off",
        type: field.type,
        name,
        value: typeof value === "undefined" ? "" : value,
        onChange: (e) => {
          if (field.type === "number") {
            onChange(Number(e.currentTarget.value));
          } else {
            onChange(e.currentTarget.value);
          }
        },
        readOnly
      }
    )
  ] });
};

// components/ComponentList/index.tsx
var import_react_beautiful_dnd3 = require("react-beautiful-dnd");

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/ComponentList/styles.module.css#css-module
var styles_module_default5 = { "ComponentList": "_ComponentList_1ybn0_1", "ComponentList-item": "_ComponentList-item_1ybn0_9", "ComponentList-itemShadow": "_ComponentList-itemShadow_1ybn0_10", "ComponentList-itemIcon": "_ComponentList-itemIcon_1ybn0_28" };

// components/ComponentList/index.tsx
var import_react_feather4 = require("react-feather");
var import_jsx_runtime9 = require("react/jsx-runtime");
var getClassName7 = get_class_name_factory_default("ComponentList", styles_module_default5);
var ComponentList = ({ config }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(DroppableStrictMode_default, { droppableId: "component-list", isDropDisabled: true, children: (provided, snapshot) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "div",
    __spreadProps(__spreadValues({}, provided.droppableProps), {
      ref: provided.innerRef,
      className: getClassName7(),
      children: [
        Object.keys(config.components).map((componentKey, i) => {
          return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            import_react_beautiful_dnd3.Draggable,
            {
              draggableId: componentKey,
              index: i,
              children: (provided2, snapshot2) => {
                var _a;
                return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "div",
                    __spreadProps(__spreadValues(__spreadValues({
                      ref: provided2.innerRef
                    }, provided2.draggableProps), provided2.dragHandleProps), {
                      className: getClassName7("item"),
                      style: __spreadProps(__spreadValues({}, provided2.draggableProps.style), {
                        transform: snapshot2.isDragging ? (_a = provided2.draggableProps.style) == null ? void 0 : _a.transform : "translate(0px, 0px)"
                      }),
                      children: [
                        componentKey,
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: getClassName7("itemIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_react_feather4.Grid, { size: 18 }) })
                      ]
                    })
                  ),
                  snapshot2.isDragging && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "div",
                    {
                      className: getClassName7("itemShadow"),
                      style: { transform: "none !important" },
                      children: [
                        componentKey,
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: getClassName7("itemIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_react_feather4.Grid, { size: 18 }) })
                      ]
                    }
                  )
                ] });
              }
            },
            componentKey
          );
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { style: { display: "none" }, children: provided.placeholder })
      ]
    })
  ) });
};

// lib/use-placeholder-style.ts
var import_react10 = require("react");
var usePlaceholderStyle = () => {
  const queryAttr = "data-rbd-drag-handle-draggable-id";
  const [placeholderStyle, setPlaceholderStyle] = (0, import_react10.useState)();
  const onDragStartOrUpdate = (draggedItem) => {
    var _a;
    console.log("Drag Start", draggedItem);
    const draggableId = draggedItem.draggableId;
    const destinationIndex = (draggedItem.destination || draggedItem.source).index;
    const droppableId = (draggedItem.destination || draggedItem.source).droppableId;
    const domQuery = `[${queryAttr}='${draggableId}']`;
    const draggedDOM = document.querySelector(domQuery);
    if (!draggedDOM) {
      return;
    }
    const targetListElement = document.querySelector(
      `[data-rbd-droppable-id='${droppableId}']`
    );
    const { clientHeight } = draggedDOM;
    if (!targetListElement) {
      return;
    }
    let clientY = 0;
    const isSameDroppable = draggedItem.source.droppableId === ((_a = draggedItem.destination) == null ? void 0 : _a.droppableId);
    if (destinationIndex > 0) {
      const end = destinationIndex > draggedItem.source.index && isSameDroppable ? destinationIndex + 1 : destinationIndex;
      const children = Array.from(targetListElement.children).filter(
        (item) => item !== draggedDOM && item.getAttributeNames().indexOf("data-puck-placeholder") === -1 && item.getAttributeNames().indexOf("data-rbd-placeholder-context-id") === -1
      ).slice(0, end);
      clientY = children.reduce(
        (total, item) => total + item.clientHeight + parseInt(window.getComputedStyle(item).marginTop.replace("px", "")) + parseInt(
          window.getComputedStyle(item).marginBottom.replace("px", "")
        ),
        0
      );
    }
    setPlaceholderStyle({
      border: "20px dashed purple",
      position: "absolute",
      top: clientY,
      left: 0,
      height: clientHeight,
      width: "100%"
    });
  };
  return { onDragStartOrUpdate, placeholderStyle };
};

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/SidebarSection/styles.module.css#css-module
var styles_module_default6 = { "SidebarSection": "_SidebarSection_f1p35_1", "SidebarSection-title": "_SidebarSection-title_f1p35_12", "SidebarSection-content": "_SidebarSection-content_f1p35_19", "SidebarSection--noPadding": "_SidebarSection--noPadding_f1p35_24", "SidebarSection-breadcrumbLabel": "_SidebarSection-breadcrumbLabel_f1p35_33", "SidebarSection-breadcrumbs": "_SidebarSection-breadcrumbs_f1p35_44", "SidebarSection-breadcrumb": "_SidebarSection-breadcrumb_f1p35_33", "SidebarSection-heading": "_SidebarSection-heading_f1p35_56" };

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/Heading/styles.module.css#css-module
var styles_module_default7 = { "Heading": "_Heading_1y35v_1", "Heading--xxxxl": "_Heading--xxxxl_1y35v_12", "Heading--xxxl": "_Heading--xxxl_1y35v_18", "Heading--xxl": "_Heading--xxl_1y35v_22", "Heading--xl": "_Heading--xl_1y35v_26", "Heading--l": "_Heading--l_1y35v_30", "Heading--m": "_Heading--m_1y35v_34", "Heading--s": "_Heading--s_1y35v_38", "Heading--xs": "_Heading--xs_1y35v_42" };

// components/Heading/index.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
var getClassName8 = get_class_name_factory_default("Heading", styles_module_default7);
var Heading = ({ children, rank, size = "m" }) => {
  const Tag = rank ? `h${rank}` : "span";
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    Tag,
    {
      className: getClassName8({
        [size]: true
      }),
      children
    }
  );
};

// components/SidebarSection/index.tsx
var import_react_feather5 = require("react-feather");
var import_jsx_runtime11 = require("react/jsx-runtime");
var getClassName9 = get_class_name_factory_default("SidebarSection", styles_module_default6);
var SidebarSection = ({
  children,
  title,
  background,
  breadcrumbs = [],
  breadcrumbClick,
  noPadding
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: getClassName9({ noPadding }), style: { background }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: getClassName9("title"), children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: getClassName9("breadcrumbs"), children: [
      breadcrumbs.map((breadcrumb, i) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: getClassName9("breadcrumb"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          "div",
          {
            className: getClassName9("breadcrumbLabel"),
            onClick: () => breadcrumbClick && breadcrumbClick(breadcrumb),
            children: breadcrumb.label
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_react_feather5.ChevronRight, { size: 16 })
      ] }, i)),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: getClassName9("heading"), children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Heading, { rank: 2, size: "xs", children: title }) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: getClassName9("content"), children })
  ] });
};

// components/Puck/index.tsx
var import_react_feather7 = require("react-feather");

// lib/insert.ts
var insert = (list, index, item) => {
  const result = Array.from(list);
  result.splice(index, 0, item);
  return result;
};

// lib/remove.ts
var remove = (list, index) => {
  const result = Array.from(list);
  result.splice(index, 1);
  return result;
};

// lib/generate-id.ts
var import_crypto = require("crypto");
var generateId = (type) => `${type}-${(0, import_crypto.randomBytes)(20).toString("hex")}`;

// lib/reduce-related-zones.ts
var reduceRelatedZones = (item, data, fn) => {
  return __spreadProps(__spreadValues({}, data), {
    zones: Object.keys(data.zones || {}).reduce(
      (acc, key) => {
        const [parentId] = getZoneId(key);
        if (parentId === item.props.id) {
          const zones = data.zones;
          return fn(acc, key, zones[key]);
        }
        return __spreadProps(__spreadValues({}, acc), { [key]: data.zones[key] });
      },
      {}
    )
  });
};
var findRelatedByZoneId = (zoneId, data) => {
  const [zoneParentId] = getZoneId(zoneId);
  return (data.zones[zoneId] || []).reduce((acc, zoneItem) => {
    const related = findRelatedByItem(zoneItem, data);
    if (zoneItem.props.id === zoneParentId) {
      return __spreadProps(__spreadValues(__spreadValues({}, acc), related), { [zoneId]: zoneItem });
    }
    return __spreadValues(__spreadValues({}, acc), related);
  }, {});
};
var findRelatedByItem = (item, data) => {
  return Object.keys(data.zones || {}).reduce((acc, zoneId) => {
    const [zoneParentId] = getZoneId(zoneId);
    if (item.props.id === zoneParentId) {
      const related = findRelatedByZoneId(zoneId, data);
      return __spreadProps(__spreadValues(__spreadValues({}, acc), related), {
        [zoneId]: data.zones[zoneId]
      });
    }
    return acc;
  }, {});
};
var removeRelatedZones = (item, data) => {
  const newData = __spreadValues({}, data);
  const related = findRelatedByItem(item, data);
  Object.keys(related).forEach((key) => {
    delete newData.zones[key];
  });
  return newData;
};
var duplicateRelatedZones = (item, data, newId) => {
  return reduceRelatedZones(item, data, (acc, key, zone) => {
    const dupedZone = zone.map((zoneItem) => __spreadProps(__spreadValues({}, zoneItem), {
      props: __spreadProps(__spreadValues({}, zoneItem.props), { id: generateId(zoneItem.type) })
    }));
    const dupeOfDupes = dupedZone.reduce(
      (dupeOfDupes2, item2, index) => __spreadValues(__spreadValues({}, dupeOfDupes2), duplicateRelatedZones(zone[index], data, item2.props.id).zones),
      acc
    );
    const [_, zoneId] = getZoneId(key);
    return __spreadProps(__spreadValues({}, dupeOfDupes), {
      [key]: zone,
      [`${newId}:${zoneId}`]: dupedZone
    });
  });
};

// lib/reducer.ts
var zoneCache = {};
var createReducer = ({ config }) => (data, action) => {
  console.log("Reducer", action);
  if (action.type === "insert") {
    const emptyComponentData = {
      type: action.componentType,
      props: __spreadProps(__spreadValues({}, config.components[action.componentType].defaultProps || {}), {
        id: generateId(action.componentType)
      })
    };
    if (action.destinationZone === rootDroppableId) {
      return __spreadProps(__spreadValues({}, data), {
        content: insert(
          data.content,
          action.destinationIndex,
          emptyComponentData
        )
      });
    }
    const newData = setupZone(data, action.destinationZone);
    return __spreadProps(__spreadValues({}, data), {
      zones: __spreadProps(__spreadValues({}, newData.zones), {
        [action.destinationZone]: insert(
          newData.zones[action.destinationZone],
          action.destinationIndex,
          emptyComponentData
        )
      })
    });
  }
  if (action.type === "duplicate") {
    const item = getItem(
      { index: action.sourceIndex, zone: action.sourceZone },
      data
    );
    const newItem = __spreadProps(__spreadValues({}, item), {
      props: __spreadProps(__spreadValues({}, item.props), {
        id: generateId(item.type)
      })
    });
    const dataWithRelatedDuplicated = duplicateRelatedZones(
      item,
      data,
      newItem.props.id
    );
    if (action.sourceZone === rootDroppableId) {
      return __spreadProps(__spreadValues({}, dataWithRelatedDuplicated), {
        content: insert(data.content, action.sourceIndex + 1, newItem)
      });
    }
    return __spreadProps(__spreadValues({}, dataWithRelatedDuplicated), {
      zones: __spreadProps(__spreadValues({}, dataWithRelatedDuplicated.zones), {
        [action.sourceZone]: insert(
          dataWithRelatedDuplicated.zones[action.sourceZone],
          action.sourceIndex + 1,
          newItem
        )
      })
    });
  }
  if (action.type === "reorder") {
    if (action.destinationZone === rootDroppableId) {
      return __spreadProps(__spreadValues({}, data), {
        content: reorder(
          data.content,
          action.sourceIndex,
          action.destinationIndex
        )
      });
    }
    const newData = setupZone(data, action.destinationZone);
    return __spreadProps(__spreadValues({}, data), {
      zones: __spreadProps(__spreadValues({}, newData.zones), {
        [action.destinationZone]: reorder(
          newData.zones[action.destinationZone],
          action.sourceIndex,
          action.destinationIndex
        )
      })
    });
  }
  if (action.type === "move") {
    const newData = setupZone(
      setupZone(data, action.sourceZone),
      action.destinationZone
    );
    const item = getItem(
      { zone: action.sourceZone, index: action.sourceIndex },
      newData
    );
    if (action.sourceZone === rootDroppableId) {
      return __spreadProps(__spreadValues({}, newData), {
        content: remove(newData.content, action.sourceIndex),
        zones: __spreadProps(__spreadValues({}, newData.zones), {
          [action.destinationZone]: insert(
            newData.zones[action.destinationZone],
            action.destinationIndex,
            item
          )
        })
      });
    }
    if (action.destinationZone === rootDroppableId) {
      return __spreadProps(__spreadValues({}, newData), {
        content: insert(newData.content, action.destinationIndex, item),
        zones: __spreadProps(__spreadValues({}, newData.zones), {
          [action.sourceZone]: remove(
            newData.zones[action.sourceZone],
            action.sourceIndex
          )
        })
      });
    }
    return __spreadProps(__spreadValues({}, newData), {
      zones: __spreadProps(__spreadValues({}, newData.zones), {
        [action.sourceZone]: remove(
          newData.zones[action.sourceZone],
          action.sourceIndex
        ),
        [action.destinationZone]: insert(
          newData.zones[action.destinationZone],
          action.destinationIndex,
          item
        )
      })
    });
  }
  if (action.type === "replace") {
    if (action.destinationZone === rootDroppableId) {
      return __spreadProps(__spreadValues({}, data), {
        content: replace(data.content, action.destinationIndex, action.data)
      });
    }
    const newData = setupZone(data, action.destinationZone);
    return __spreadProps(__spreadValues({}, newData), {
      zones: __spreadProps(__spreadValues({}, newData.zones), {
        [action.destinationZone]: replace(
          newData.zones[action.destinationZone],
          action.destinationIndex,
          action.data
        )
      })
    });
  }
  if (action.type === "remove") {
    const item = getItem({ index: action.index, zone: action.zone }, data);
    const dataWithRelatedRemoved = setupZone(
      removeRelatedZones(item, data),
      action.zone
    );
    if (action.zone === rootDroppableId) {
      return __spreadProps(__spreadValues({}, dataWithRelatedRemoved), {
        content: remove(data.content, action.index)
      });
    }
    return __spreadProps(__spreadValues({}, dataWithRelatedRemoved), {
      zones: __spreadProps(__spreadValues({}, dataWithRelatedRemoved.zones), {
        [action.zone]: remove(
          dataWithRelatedRemoved.zones[action.zone],
          action.index
        )
      })
    });
  }
  if (action.type === "registerZone") {
    console.log("Register Zone", action);
    if (zoneCache[action.zone]) {
      return __spreadProps(__spreadValues({}, data), {
        zones: __spreadProps(__spreadValues({}, data.zones), {
          [action.zone]: zoneCache[action.zone]
        })
      });
    }
    return setupZone(data, action.zone);
  }
  if (action.type === "unregisterZone") {
    const _zones = __spreadValues({}, data.zones || {});
    if (_zones[action.zone]) {
      zoneCache[action.zone] = _zones[action.zone];
      delete _zones[action.zone];
    }
    return __spreadProps(__spreadValues({}, data), { zones: _zones });
  }
  if (action.type === "set") {
    return __spreadValues(__spreadValues({}, data), action.data);
  }
  return data;
};

// css-module:/Users/nguyen/study/sp/turborepo/my-turborepo/packages/core/components/LayerTree/styles.module.css#css-module
var styles_module_default8 = { "LayerTree": "_LayerTree_1dcmd_1", "LayerTree-zoneTitle": "_LayerTree-zoneTitle_1dcmd_11", "LayerTree-helper": "_LayerTree-helper_1dcmd_17", "Layer": "_Layer_1dcmd_1", "Layer-inner": "_Layer-inner_1dcmd_29", "Layer--containsZone": "_Layer--containsZone_1dcmd_35", "Layer-clickable": "_Layer-clickable_1dcmd_39", "Layer--isSelected": "_Layer--isSelected_1dcmd_48", "Layer--isHovering": "_Layer--isHovering_1dcmd_49", "Layer-chevron": "_Layer-chevron_1dcmd_65", "Layer--childIsSelected": "_Layer--childIsSelected_1dcmd_66", "Layer-zones": "_Layer-zones_1dcmd_70", "Layer-title": "_Layer-title_1dcmd_84", "Layer-icon": "_Layer-icon_1dcmd_92", "Layer-zoneIcon": "_Layer-zoneIcon_1dcmd_97" };

// lib/scroll-into-view.ts
var scrollIntoView = (el) => {
  const oldStyle = __spreadValues({}, el.style);
  el.style.scrollMargin = "256px";
  if (el) {
    el == null ? void 0 : el.scrollIntoView({ behavior: "smooth" });
    el.style.scrollMargin = oldStyle.scrollMargin || "";
  }
};

// components/LayerTree/index.tsx
var import_react_feather6 = require("react-feather");
var import_react11 = require("react");

// lib/find-zones-for-area.ts
var findZonesForArea = (data, area) => {
  const { zones = {} } = data;
  const result = Object.keys(zones).filter(
    (zoneId) => getZoneId(zoneId)[0] === area
  );
  return result.reduce((acc, key) => {
    return __spreadProps(__spreadValues({}, acc), { [key]: zones[key] });
  }, {});
};

// lib/is-child-of-zone.ts
var isChildOfZone = (item, maybeChild, ctx) => {
  var _a;
  const { data, pathData = {} } = ctx || {};
  return maybeChild && data ? !!((_a = pathData[maybeChild.props.id]) == null ? void 0 : _a.find((path) => {
    if (path.selector) {
      const pathItem = getItem(path.selector, data);
      return (pathItem == null ? void 0 : pathItem.props.id) === item.props.id;
    }
    return false;
  })) : false;
};

// components/LayerTree/index.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var getClassName10 = get_class_name_factory_default("LayerTree", styles_module_default8);
var getClassNameLayer = get_class_name_factory_default("Layer", styles_module_default8);
var LayerTree = ({
  data,
  zoneContent,
  itemSelector,
  setItemSelector,
  zone,
  label
}) => {
  const zones = data.zones || {};
  const ctx = (0, import_react11.useContext)(dropZoneContext);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    label && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: getClassName10("zoneTitle"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: getClassName10("zoneIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react_feather6.Layers, { size: "16" }) }),
      " ",
      label
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("ul", { className: getClassName10(), children: [
      zoneContent.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: getClassName10("helper"), children: "No items" }),
      zoneContent.map((item, i) => {
        const isSelected = (itemSelector == null ? void 0 : itemSelector.index) === i && (itemSelector.zone === zone || itemSelector.zone === rootDroppableId && !zone);
        const zonesForItem = findZonesForArea(data, item.props.id);
        const containsZone = Object.keys(zonesForItem).length > 0;
        const {
          setHoveringArea = () => {
          },
          setHoveringComponent = () => {
          },
          hoveringComponent
        } = ctx || {};
        const selectedItem = itemSelector && data ? getItem(itemSelector, data) : null;
        const isHovering = hoveringComponent === item.props.id;
        const childIsSelected = isChildOfZone(item, selectedItem, ctx);
        return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
          "li",
          {
            className: getClassNameLayer({
              isSelected,
              isHovering,
              containsZone,
              childIsSelected
            }),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: getClassNameLayer("inner"), children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
                "div",
                {
                  className: getClassNameLayer("clickable"),
                  onClick: () => {
                    if (isSelected) {
                      setItemSelector(null);
                      return;
                    }
                    setItemSelector({
                      index: i,
                      zone
                    });
                    const id = zoneContent[i].props.id;
                    scrollIntoView(
                      document.querySelector(
                        `[data-rbd-drag-handle-draggable-id="draggable-${id}"]`
                      )
                    );
                  },
                  onMouseOver: (e) => {
                    e.stopPropagation();
                    setHoveringArea(item.props.id);
                    setHoveringComponent(item.props.id);
                  },
                  onMouseOut: (e) => {
                    e.stopPropagation();
                    setHoveringArea(null);
                    setHoveringComponent(null);
                  },
                  children: [
                    containsZone && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                      "div",
                      {
                        className: getClassNameLayer("chevron"),
                        title: isSelected ? "Collapse" : "Expand",
                        children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react_feather6.ChevronDown, { size: "12" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: getClassNameLayer("title"), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: getClassNameLayer("icon"), children: item.type === "Text" || item.type === "Heading" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react_feather6.Type, { size: "16" }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react_feather6.Grid, { size: "16" }) }),
                      item.type
                    ] })
                  ]
                }
              ) }),
              containsZone && Object.keys(zonesForItem).map((zoneKey, idx) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: getClassNameLayer("zones"), children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                LayerTree,
                {
                  data,
                  zoneContent: zones[zoneKey],
                  setItemSelector,
                  itemSelector,
                  zone: zoneKey,
                  label: getZoneId(zoneKey)[1]
                }
              ) }, idx))
            ]
          },
          `${item.props.id}_${i}`
        );
      })
    ] })
  ] });
};

// lib/area-contains-zones.ts
var areaContainsZones = (data, area) => {
  const zones = Object.keys(findZonesForArea(data, area));
  return zones.length > 0;
};

// components/Puck/index.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var defaultPageFields = {
  title: { type: "text" }
};
var PluginRenderer = ({
  children,
  data,
  plugins,
  renderMethod
}) => {
  return plugins.filter((item) => item[renderMethod]).map((item) => item[renderMethod]).reduce(
    (accChildren, Item) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Item, { data, children: accChildren }),
    children
  );
};
function Puck({
  config,
  data: initialData = { content: [], root: { title: "" } },
  onChange,
  onPublish,
  plugins = [],
  renderHeader,
  renderHeaderActions,
  headerTitle,
  headerPath
}) {
  var _a;
  const [reducer] = (0, import_react12.useState)(() => createReducer({ config }));
  const [data, dispatch] = (0, import_react12.useReducer)(reducer, initialData);
  const [itemSelector, setItemSelector] = (0, import_react12.useState)(null);
  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const Page = (0, import_react12.useCallback)(
    (pageProps) => {
      var _a2, _b;
      return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        PluginRenderer,
        {
          plugins,
          renderMethod: "renderRoot",
          data: pageProps.data,
          children: ((_a2 = config.root) == null ? void 0 : _a2.render) ? (_b = config.root) == null ? void 0 : _b.render(__spreadProps(__spreadValues({}, pageProps), { editMode: true })) : pageProps.children
        }
      );
    },
    [config.root]
  );
  const PageFieldWrapper = (0, import_react12.useCallback)(
    (props) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      PluginRenderer,
      {
        plugins,
        renderMethod: "renderRootFields",
        data: props.data,
        children: props.children
      }
    ),
    []
  );
  const ComponentFieldWrapper = (0, import_react12.useCallback)(
    (props) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      PluginRenderer,
      {
        plugins,
        renderMethod: "renderFields",
        data: props.data,
        children: props.children
      }
    ),
    []
  );
  const FieldWrapper = itemSelector ? ComponentFieldWrapper : PageFieldWrapper;
  const rootFields = ((_a = config.root) == null ? void 0 : _a.fields) || defaultPageFields;
  const fields = (0, import_react12.useMemo)(() => {
    var _a2;
    return selectedItem ? ((_a2 = config.components[selectedItem.type]) == null ? void 0 : _a2.fields) || {} : rootFields;
  }, [selectedItem, config.components, rootFields]);
  (0, import_react12.useEffect)(() => {
    if (onChange)
      onChange(data);
  }, [data]);
  const { onDragStartOrUpdate, placeholderStyle } = usePlaceholderStyle();
  const [leftSidebarVisible, setLeftSidebarVisible] = (0, import_react12.useState)(true);
  const [draggedItem, setDraggedItem] = (0, import_react12.useState)();
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "puck", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    import_react_beautiful_dnd4.DragDropContext,
    {
      onDragUpdate: (update) => {
        setDraggedItem(__spreadValues(__spreadValues({}, draggedItem), update));
        onDragStartOrUpdate(update);
      },
      onBeforeDragStart: (start) => {
        onDragStartOrUpdate(start);
        setItemSelector(null);
      },
      onDragEnd: (droppedItem) => {
        setDraggedItem(void 0);
        if (!droppedItem.destination) {
          return;
        }
        if (droppedItem.source.droppableId === "component-list" && droppedItem.destination) {
          dispatch({
            type: "insert",
            componentType: droppedItem.draggableId,
            destinationIndex: droppedItem.destination.index,
            destinationZone: droppedItem.destination.droppableId
          });
          setItemSelector({
            index: droppedItem.destination.index,
            zone: droppedItem.destination.droppableId
          });
        } else {
          const { source, destination } = droppedItem;
          console.log("Item", droppedItem);
          if (source.droppableId === destination.droppableId) {
            dispatch({
              type: "reorder",
              sourceIndex: source.index,
              destinationIndex: destination.index,
              destinationZone: destination.droppableId
            });
          } else {
            dispatch({
              type: "move",
              sourceZone: source.droppableId,
              sourceIndex: source.index,
              destinationIndex: destination.index,
              destinationZone: destination.droppableId
            });
          }
          setItemSelector({
            index: destination.index,
            zone: destination.droppableId
          });
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        DropZoneProvider,
        {
          value: {
            data,
            itemSelector,
            setItemSelector,
            config,
            dispatch,
            draggedItem,
            placeholderStyle,
            mode: "edit",
            areaId: "root"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(dropZoneContext.Consumer, { children: (ctx) => {
            let path = (ctx == null ? void 0 : ctx.pathData) && selectedItem ? ctx == null ? void 0 : ctx.pathData[selectedItem == null ? void 0 : selectedItem.props.id] : void 0;
            if (path) {
              path = [{ label: "Page", selector: null }, ...path];
              path = path.slice(path.length - 2, path.length - 1);
            }
            return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
              "div",
              {
                style: {
                  backgroundColor: "purple",
                  display: "grid",
                  gridTemplateAreas: '"header header header" "left editor right"',
                  gridTemplateColumns: `${leftSidebarVisible ? "288px" : "0px"} auto 288px`,
                  gridTemplateRows: "min-content auto",
                  height: "100vh",
                  position: "fixed",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    "header",
                    {
                      style: {
                        gridArea: "header",
                        color: "var(--puck-color-black)",
                        background: "var(--puck-color-white)",
                        borderBottom: "1px solid var(--puck-color-grey-8)"
                      },
                      children: renderHeader ? renderHeader({
                        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                          Button,
                          {
                            onClick: () => {
                              onPublish(data);
                            },
                            icon: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_react_feather7.Globe, { size: "14px" }),
                            children: "Pub"
                          }
                        ),
                        data,
                        dispatch
                      }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                        "div",
                        {
                          style: {
                            display: "grid",
                            padding: 16,
                            gridTemplateAreas: '"left middle right"',
                            gridTemplateColumns: "288px auto 288px",
                            gridTemplateRows: "auto"
                          },
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 16
                                },
                                children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                                  IconButton,
                                  {
                                    onClick: () => setLeftSidebarVisible(!leftSidebarVisible),
                                    title: "Toggle left sidebar",
                                    children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_react_feather7.Sidebar, {})
                                  }
                                )
                              }
                            ),
                            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center"
                                },
                                children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Heading, { rank: 2, size: "xs", children: [
                                  headerTitle || data.root.title || "Page",
                                  headerPath && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("small", { style: { fontWeight: 400, marginLeft: 4 }, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("code", { children: headerPath }) })
                                ] })
                              }
                            ),
                            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                              "div",
                              {
                                style: {
                                  display: "flex",
                                  gap: 16,
                                  justifyContent: "flex-end"
                                },
                                children: [
                                  renderHeaderActions == null ? void 0 : renderHeaderActions({ data, dispatch }),
                                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                                    Button,
                                    {
                                      onClick: () => {
                                        onPublish(data);
                                      },
                                      icon: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_react_feather7.Globe, { size: "14px" }),
                                      children: "Publish"
                                    }
                                  )
                                ]
                              }
                            )
                          ]
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                    "div",
                    {
                      style: {
                        gridArea: "left",
                        background: "var(--puck-color-grey-11)",
                        borderRight: "1px solid var(--puck-color-grey-8)",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column"
                      },
                      children: [
                        "left",
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(SidebarSection, { title: "Components", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ComponentList, { config }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(SidebarSection, { title: "Outline", children: [
                          (ctx == null ? void 0 : ctx.activeZones) && (ctx == null ? void 0 : ctx.activeZones[rootDroppableId]) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                            LayerTree,
                            {
                              data,
                              label: areaContainsZones(data, "root") ? rootDroppableId : "",
                              zoneContent: data.content,
                              setItemSelector,
                              itemSelector
                            }
                          ),
                          Object.entries(findZonesForArea(data, "root")).map(
                            ([zoneKey, zone]) => {
                              return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                                LayerTree,
                                {
                                  data,
                                  label: zoneKey,
                                  zone: zoneKey,
                                  zoneContent: zone,
                                  setItemSelector,
                                  itemSelector
                                },
                                zoneKey
                              );
                            }
                          )
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                    "div",
                    {
                      style: {
                        padding: 32,
                        overflowY: "auto",
                        gridArea: "editor",
                        position: "relative"
                      },
                      onClick: () => setItemSelector(null),
                      id: "puck-frame",
                      children: [
                        "dd",
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                          "div",
                          {
                            className: "puck-root",
                            style: {
                              backgroundColor: "pink",
                              border: "1px solid var(--puck-color-grey-8)",
                              boxShadow: "0px 0px 0px 3rem var(--puck-color-grey-10)",
                              zoom: 0.75
                            },
                            children: [
                              "wa",
                              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Page, __spreadProps(__spreadValues({ data }, data.root), { children: [
                                "dropzone",
                                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(DropZone, { zone: rootDroppableId })
                              ] }))
                            ]
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                    "div",
                    {
                      style: {
                        backgroundColor: "brown",
                        borderLeft: "1px solid var(--puck-color-grey-8)",
                        overflowY: "auto",
                        gridArea: "right",
                        fontFamily: "var(--puck-font-stack)",
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--puck-color-white)"
                      },
                      children: [
                        "www",
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(FieldWrapper, { data, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                          SidebarSection,
                          {
                            noPadding: true,
                            breadcrumbs: path,
                            breadcrumbClick: (breadcrumb) => setItemSelector(breadcrumb.selector),
                            title: selectedItem ? selectedItem.type : "Pag",
                            children: Object.keys(fields).map((fieldName) => {
                              var _a2, _b, _c, _d;
                              const field = fields[fieldName];
                              const onChange2 = (value) => {
                                let currentProps;
                                let newProps;
                                if (selectedItem) {
                                  currentProps = selectedItem.props;
                                } else {
                                  currentProps = data.root;
                                }
                                if (fieldName === "_data") {
                                  if (!value) {
                                    const _a3 = currentProps._meta || {}, { locked } = _a3, _meta = __objRest(_a3, ["locked"]);
                                    newProps = __spreadProps(__spreadValues({}, currentProps), {
                                      _data: void 0,
                                      _meta
                                    });
                                  } else {
                                    const changedFields = filter(
                                      // filter out anything not supported by this component
                                      value,
                                      Object.keys(fields)
                                    );
                                    newProps = __spreadProps(__spreadValues(__spreadValues({}, currentProps), changedFields), {
                                      _data: value,
                                      // TODO perf - this is duplicative and will make payload larger
                                      _meta: {
                                        locked: Object.keys(changedFields)
                                      }
                                    });
                                  }
                                } else {
                                  newProps = __spreadProps(__spreadValues({}, currentProps), {
                                    [fieldName]: value
                                  });
                                }
                                if (itemSelector) {
                                  dispatch({
                                    type: "replace",
                                    destinationIndex: itemSelector.index,
                                    destinationZone: itemSelector.zone || rootDroppableId,
                                    data: __spreadProps(__spreadValues({}, selectedItem), { props: newProps })
                                  });
                                } else {
                                  dispatch({
                                    type: "set",
                                    data: { root: newProps }
                                  });
                                }
                              };
                              if (selectedItem && itemSelector) {
                                return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                                  InputOrGroup,
                                  {
                                    field,
                                    name: fieldName,
                                    label: field.label,
                                    readOnly: ((_b = (_a2 = getItem(
                                      itemSelector,
                                      data
                                    ).props._meta) == null ? void 0 : _a2.locked) == null ? void 0 : _b.indexOf(fieldName)) > -1,
                                    value: selectedItem.props[fieldName],
                                    onChange: onChange2
                                  },
                                  `${selectedItem.props.id}_${fieldName}`
                                );
                              } else {
                                return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                                  InputOrGroup,
                                  {
                                    field,
                                    name: fieldName,
                                    label: field.label,
                                    readOnly: ((_d = (_c = data.root._meta) == null ? void 0 : _c.locked) == null ? void 0 : _d.indexOf(fieldName)) > -1,
                                    value: data.root[fieldName],
                                    onChange: onChange2
                                  },
                                  `page_${fieldName}`
                                );
                              }
                            })
                          }
                        ) })
                      ]
                    }
                  )
                ]
              }
            );
          } })
        }
      )
    }
  ) });
}

// components/Render/index.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function Render({ config, data }) {
  if (config.root) {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DropZoneProvider, { value: { data, config, mode: "render" }, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(config.root.render, __spreadProps(__spreadValues({}, data.root), { editMode: false, id: "puck-root", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DropZone, { zone: rootDroppableId }) })) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DropZoneProvider, { value: { data, config, mode: "render" }, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DropZone, { zone: rootDroppableId }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button,
  DropZone,
  DropZoneProvider,
  FieldLabel,
  IconButton,
  Puck,
  Render,
  dropZoneContext
});
