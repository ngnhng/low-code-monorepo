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
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// ../tsup-config/react-import.js
var import_react;
var init_react_import = __esm({
  "../tsup-config/react-import.js"() {
    "use strict";
    import_react = __toESM(require("react"));
  }
});

// ../../node_modules/react-is/cjs/react-is.production.min.js
var require_react_is_production_min = __commonJS({
  "../../node_modules/react-is/cjs/react-is.production.min.js"(exports) {
    "use strict";
    init_react_import();
    var b = "function" === typeof Symbol && Symbol.for;
    var c = b ? Symbol.for("react.element") : 60103;
    var d = b ? Symbol.for("react.portal") : 60106;
    var e = b ? Symbol.for("react.fragment") : 60107;
    var f = b ? Symbol.for("react.strict_mode") : 60108;
    var g = b ? Symbol.for("react.profiler") : 60114;
    var h = b ? Symbol.for("react.provider") : 60109;
    var k = b ? Symbol.for("react.context") : 60110;
    var l = b ? Symbol.for("react.async_mode") : 60111;
    var m = b ? Symbol.for("react.concurrent_mode") : 60111;
    var n = b ? Symbol.for("react.forward_ref") : 60112;
    var p = b ? Symbol.for("react.suspense") : 60113;
    var q = b ? Symbol.for("react.suspense_list") : 60120;
    var r = b ? Symbol.for("react.memo") : 60115;
    var t = b ? Symbol.for("react.lazy") : 60116;
    var v = b ? Symbol.for("react.block") : 60121;
    var w = b ? Symbol.for("react.fundamental") : 60117;
    var x = b ? Symbol.for("react.responder") : 60118;
    var y = b ? Symbol.for("react.scope") : 60119;
    function z(a) {
      if ("object" === typeof a && null !== a) {
        var u = a.$$typeof;
        switch (u) {
          case c:
            switch (a = a.type, a) {
              case l:
              case m:
              case e:
              case g:
              case f:
              case p:
                return a;
              default:
                switch (a = a && a.$$typeof, a) {
                  case k:
                  case n:
                  case t:
                  case r:
                  case h:
                    return a;
                  default:
                    return u;
                }
            }
          case d:
            return u;
        }
      }
    }
    function A(a) {
      return z(a) === m;
    }
    exports.AsyncMode = l;
    exports.ConcurrentMode = m;
    exports.ContextConsumer = k;
    exports.ContextProvider = h;
    exports.Element = c;
    exports.ForwardRef = n;
    exports.Fragment = e;
    exports.Lazy = t;
    exports.Memo = r;
    exports.Portal = d;
    exports.Profiler = g;
    exports.StrictMode = f;
    exports.Suspense = p;
    exports.isAsyncMode = function(a) {
      return A(a) || z(a) === l;
    };
    exports.isConcurrentMode = A;
    exports.isContextConsumer = function(a) {
      return z(a) === k;
    };
    exports.isContextProvider = function(a) {
      return z(a) === h;
    };
    exports.isElement = function(a) {
      return "object" === typeof a && null !== a && a.$$typeof === c;
    };
    exports.isForwardRef = function(a) {
      return z(a) === n;
    };
    exports.isFragment = function(a) {
      return z(a) === e;
    };
    exports.isLazy = function(a) {
      return z(a) === t;
    };
    exports.isMemo = function(a) {
      return z(a) === r;
    };
    exports.isPortal = function(a) {
      return z(a) === d;
    };
    exports.isProfiler = function(a) {
      return z(a) === g;
    };
    exports.isStrictMode = function(a) {
      return z(a) === f;
    };
    exports.isSuspense = function(a) {
      return z(a) === p;
    };
    exports.isValidElementType = function(a) {
      return "string" === typeof a || "function" === typeof a || a === e || a === m || a === g || a === f || a === p || a === q || "object" === typeof a && null !== a && (a.$$typeof === t || a.$$typeof === r || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n || a.$$typeof === w || a.$$typeof === x || a.$$typeof === y || a.$$typeof === v);
    };
    exports.typeOf = z;
  }
});

// ../../node_modules/react-is/cjs/react-is.development.js
var require_react_is_development = __commonJS({
  "../../node_modules/react-is/cjs/react-is.development.js"(exports) {
    "use strict";
    init_react_import();
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        var hasSymbol = typeof Symbol === "function" && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
        var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 60107;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
        var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
        var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
        var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
        function isValidElementType(type) {
          return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
          type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
          if (typeof object === "object" && object !== null) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;
                switch (type) {
                  case REACT_ASYNC_MODE_TYPE:
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;
                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
          return void 0;
        }
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment8 = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;
        var Suspense = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false;
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
            }
          }
          return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isLazy(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment8;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});

// ../../node_modules/react-is/index.js
var require_react_is = __commonJS({
  "../../node_modules/react-is/index.js"(exports, module2) {
    "use strict";
    init_react_import();
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_is_production_min();
    } else {
      module2.exports = require_react_is_development();
    }
  }
});

// ../../node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "../../node_modules/object-assign/index.js"(exports, module2) {
    "use strict";
    init_react_import();
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// ../../node_modules/prop-types/lib/ReactPropTypesSecret.js
var require_ReactPropTypesSecret = __commonJS({
  "../../node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module2) {
    "use strict";
    init_react_import();
    var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    module2.exports = ReactPropTypesSecret;
  }
});

// ../../node_modules/prop-types/lib/has.js
var require_has = __commonJS({
  "../../node_modules/prop-types/lib/has.js"(exports, module2) {
    init_react_import();
    module2.exports = Function.call.bind(Object.prototype.hasOwnProperty);
  }
});

// ../../node_modules/prop-types/checkPropTypes.js
var require_checkPropTypes = __commonJS({
  "../../node_modules/prop-types/checkPropTypes.js"(exports, module2) {
    "use strict";
    init_react_import();
    var printWarning = function() {
    };
    if (process.env.NODE_ENV !== "production") {
      ReactPropTypesSecret = require_ReactPropTypesSecret();
      loggedTypeFailures = {};
      has = require_has();
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    var ReactPropTypesSecret;
    var loggedTypeFailures;
    var has;
    function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
      if (process.env.NODE_ENV !== "production") {
        for (var typeSpecName in typeSpecs) {
          if (has(typeSpecs, typeSpecName)) {
            var error;
            try {
              if (typeof typeSpecs[typeSpecName] !== "function") {
                var err = Error(
                  (componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                );
                err.name = "Invariant Violation";
                throw err;
              }
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
            } catch (ex) {
              error = ex;
            }
            if (error && !(error instanceof Error)) {
              printWarning(
                (componentName || "React class") + ": type specification of " + location + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
              );
            }
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
              loggedTypeFailures[error.message] = true;
              var stack = getStack ? getStack() : "";
              printWarning(
                "Failed " + location + " type: " + error.message + (stack != null ? stack : "")
              );
            }
          }
        }
      }
    }
    checkPropTypes.resetWarningCache = function() {
      if (process.env.NODE_ENV !== "production") {
        loggedTypeFailures = {};
      }
    };
    module2.exports = checkPropTypes;
  }
});

// ../../node_modules/prop-types/factoryWithTypeCheckers.js
var require_factoryWithTypeCheckers = __commonJS({
  "../../node_modules/prop-types/factoryWithTypeCheckers.js"(exports, module2) {
    "use strict";
    init_react_import();
    var ReactIs = require_react_is();
    var assign = require_object_assign();
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    var has = require_has();
    var checkPropTypes = require_checkPropTypes();
    var printWarning = function() {
    };
    if (process.env.NODE_ENV !== "production") {
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    function emptyFunctionThatReturnsNull() {
      return null;
    }
    module2.exports = function(isValidElement, throwOnDirectAccess) {
      var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === "function") {
          return iteratorFn;
        }
      }
      var ANONYMOUS = "<<anonymous>>";
      var ReactPropTypes = {
        array: createPrimitiveTypeChecker("array"),
        bigint: createPrimitiveTypeChecker("bigint"),
        bool: createPrimitiveTypeChecker("boolean"),
        func: createPrimitiveTypeChecker("function"),
        number: createPrimitiveTypeChecker("number"),
        object: createPrimitiveTypeChecker("object"),
        string: createPrimitiveTypeChecker("string"),
        symbol: createPrimitiveTypeChecker("symbol"),
        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        elementType: createElementTypeTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker
      };
      function is(x, y) {
        if (x === y) {
          return x !== 0 || 1 / x === 1 / y;
        } else {
          return x !== x && y !== y;
        }
      }
      function PropTypeError(message, data) {
        this.message = message;
        this.data = data && typeof data === "object" ? data : {};
        this.stack = "";
      }
      PropTypeError.prototype = Error.prototype;
      function createChainableTypeChecker(validate) {
        if (process.env.NODE_ENV !== "production") {
          var manualPropTypeCallCache = {};
          var manualPropTypeWarningCount = 0;
        }
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
          componentName = componentName || ANONYMOUS;
          propFullName = propFullName || propName;
          if (secret !== ReactPropTypesSecret) {
            if (throwOnDirectAccess) {
              var err = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
              );
              err.name = "Invariant Violation";
              throw err;
            } else if (process.env.NODE_ENV !== "production" && typeof console !== "undefined") {
              var cacheKey = componentName + ":" + propName;
              if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
              manualPropTypeWarningCount < 3) {
                printWarning(
                  "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
                );
                manualPropTypeCallCache[cacheKey] = true;
                manualPropTypeWarningCount++;
              }
            }
          }
          if (props[propName] == null) {
            if (isRequired) {
              if (props[propName] === null) {
                return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
              }
              return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
            }
            return null;
          } else {
            return validate(props, propName, componentName, location, propFullName);
          }
        }
        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);
        return chainedCheckType;
      }
      function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== expectedType) {
            var preciseType = getPreciseType(propValue);
            return new PropTypeError(
              "Invalid " + location + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
              { expectedType }
            );
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunctionThatReturnsNull);
      }
      function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
          }
          var propValue = props[propName];
          if (!Array.isArray(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
          }
          for (var i = 0; i < propValue.length; i++) {
            var error = typeChecker(propValue, i, componentName, location, propFullName + "[" + i + "]", ReactPropTypesSecret);
            if (error instanceof Error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!isValidElement(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!ReactIs.isValidElementType(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
          if (!(props[propName] instanceof expectedClass)) {
            var expectedClassName = expectedClass.name || ANONYMOUS;
            var actualClassName = getClassName11(props[propName]);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
          if (process.env.NODE_ENV !== "production") {
            if (arguments.length > 1) {
              printWarning(
                "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
              );
            } else {
              printWarning("Invalid argument supplied to oneOf, expected an array.");
            }
          }
          return emptyFunctionThatReturnsNull;
        }
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          for (var i = 0; i < expectedValues.length; i++) {
            if (is(propValue, expectedValues[i])) {
              return null;
            }
          }
          var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
            var type = getPreciseType(value);
            if (type === "symbol") {
              return String(value);
            }
            return value;
          });
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
          }
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
          }
          for (var key in propValue) {
            if (has(propValue, key)) {
              var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error instanceof Error) {
                return error;
              }
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
          process.env.NODE_ENV !== "production" ? printWarning("Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
          return emptyFunctionThatReturnsNull;
        }
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];
          if (typeof checker !== "function") {
            printWarning(
              "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i + "."
            );
            return emptyFunctionThatReturnsNull;
          }
        }
        function validate(props, propName, componentName, location, propFullName) {
          var expectedTypes = [];
          for (var i2 = 0; i2 < arrayOfTypeCheckers.length; i2++) {
            var checker2 = arrayOfTypeCheckers[i2];
            var checkerResult = checker2(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
            if (checkerResult == null) {
              return null;
            }
            if (checkerResult.data && has(checkerResult.data, "expectedType")) {
              expectedTypes.push(checkerResult.data.expectedType);
            }
          }
          var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          if (!isNode(props[propName])) {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function invalidValidatorError(componentName, location, propFullName, key, type) {
        return new PropTypeError(
          (componentName || "React class") + ": " + location + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
        );
      }
      function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          for (var key in shapeTypes) {
            var checker = shapeTypes[key];
            if (typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          var allKeys = assign({}, props[propName], shapeTypes);
          for (var key in allKeys) {
            var checker = shapeTypes[key];
            if (has(shapeTypes, key) && typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            if (!checker) {
              return new PropTypeError(
                "Invalid " + location + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
              );
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function isNode(propValue) {
        switch (typeof propValue) {
          case "number":
          case "string":
          case "undefined":
            return true;
          case "boolean":
            return !propValue;
          case "object":
            if (Array.isArray(propValue)) {
              return propValue.every(isNode);
            }
            if (propValue === null || isValidElement(propValue)) {
              return true;
            }
            var iteratorFn = getIteratorFn(propValue);
            if (iteratorFn) {
              var iterator = iteratorFn.call(propValue);
              var step;
              if (iteratorFn !== propValue.entries) {
                while (!(step = iterator.next()).done) {
                  if (!isNode(step.value)) {
                    return false;
                  }
                }
              } else {
                while (!(step = iterator.next()).done) {
                  var entry = step.value;
                  if (entry) {
                    if (!isNode(entry[1])) {
                      return false;
                    }
                  }
                }
              }
            } else {
              return false;
            }
            return true;
          default:
            return false;
        }
      }
      function isSymbol(propType, propValue) {
        if (propType === "symbol") {
          return true;
        }
        if (!propValue) {
          return false;
        }
        if (propValue["@@toStringTag"] === "Symbol") {
          return true;
        }
        if (typeof Symbol === "function" && propValue instanceof Symbol) {
          return true;
        }
        return false;
      }
      function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) {
          return "array";
        }
        if (propValue instanceof RegExp) {
          return "object";
        }
        if (isSymbol(propType, propValue)) {
          return "symbol";
        }
        return propType;
      }
      function getPreciseType(propValue) {
        if (typeof propValue === "undefined" || propValue === null) {
          return "" + propValue;
        }
        var propType = getPropType(propValue);
        if (propType === "object") {
          if (propValue instanceof Date) {
            return "date";
          } else if (propValue instanceof RegExp) {
            return "regexp";
          }
        }
        return propType;
      }
      function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch (type) {
          case "array":
          case "object":
            return "an " + type;
          case "boolean":
          case "date":
          case "regexp":
            return "a " + type;
          default:
            return type;
        }
      }
      function getClassName11(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
          return ANONYMOUS;
        }
        return propValue.constructor.name;
      }
      ReactPropTypes.checkPropTypes = checkPropTypes;
      ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});

// ../../node_modules/prop-types/factoryWithThrowingShims.js
var require_factoryWithThrowingShims = __commonJS({
  "../../node_modules/prop-types/factoryWithThrowingShims.js"(exports, module2) {
    "use strict";
    init_react_import();
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    function emptyFunction() {
    }
    function emptyFunctionWithReset() {
    }
    emptyFunctionWithReset.resetWarningCache = emptyFunction;
    module2.exports = function() {
      function shim(props, propName, componentName, location, propFullName, secret) {
        if (secret === ReactPropTypesSecret) {
          return;
        }
        var err = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        err.name = "Invariant Violation";
        throw err;
      }
      ;
      shim.isRequired = shim;
      function getShim() {
        return shim;
      }
      ;
      var ReactPropTypes = {
        array: shim,
        bigint: shim,
        bool: shim,
        func: shim,
        number: shim,
        object: shim,
        string: shim,
        symbol: shim,
        any: shim,
        arrayOf: getShim,
        element: shim,
        elementType: shim,
        instanceOf: getShim,
        node: shim,
        objectOf: getShim,
        oneOf: getShim,
        oneOfType: getShim,
        shape: getShim,
        exact: getShim,
        checkPropTypes: emptyFunctionWithReset,
        resetWarningCache: emptyFunction
      };
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});

// ../../node_modules/prop-types/index.js
var require_prop_types = __commonJS({
  "../../node_modules/prop-types/index.js"(exports, module2) {
    init_react_import();
    if (process.env.NODE_ENV !== "production") {
      ReactIs = require_react_is();
      throwOnDirectAccess = true;
      module2.exports = require_factoryWithTypeCheckers()(ReactIs.isElement, throwOnDirectAccess);
    } else {
      module2.exports = require_factoryWithThrowingShims()();
    }
    var ReactIs;
    var throwOnDirectAccess;
  }
});

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
init_react_import();

// types/Config.tsx
init_react_import();

// components/Button/index.ts
init_react_import();

// components/Button/Button.tsx
init_react_import();
var import_react2 = require("react");

// css-module:E:\Projects\low-code-puck\packages\core\components\Button\Button.module.css#css-module
init_react_import();
var Button_module_default = { "Button": "_Button_h7b1j_1", "Button--medium": "_Button--medium_h7b1j_39", "Button--large": "_Button--large_h7b1j_53", "Button-icon": "_Button-icon_h7b1j_67", "Button--primary": "_Button--primary_h7b1j_83", "Button--secondary": "_Button--secondary_h7b1j_101", "Button--flush": "_Button--flush_h7b1j_123", "Button--disabled": "_Button--disabled_h7b1j_131", "Button--fullWidth": "_Button--fullWidth_h7b1j_151" };

// lib/get-class-name-factory.ts
init_react_import();
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
init_react_import();
var import_react18 = require("react");

// components/DraggableComponent/index.tsx
init_react_import();
var import_react15 = require("react");
var import_react_beautiful_dnd = require("react-beautiful-dnd");

// css-module:E:\Projects\low-code-puck\packages\core\components\DraggableComponent\styles.module.css#css-module
init_react_import();
var styles_module_default = { "DraggableComponent": "_DraggableComponent_1g4tn_1", "DraggableComponent--isDragging": "_DraggableComponent--isDragging_1g4tn_11", "DraggableComponent-contents": "_DraggableComponent-contents_1g4tn_23", "DraggableComponent-overlay": "_DraggableComponent-overlay_1g4tn_47", "DraggableComponent--isLocked": "_DraggableComponent--isLocked_1g4tn_77", "DraggableComponent--forceHover": "_DraggableComponent--forceHover_1g4tn_89", "DraggableComponent--indicativeHover": "_DraggableComponent--indicativeHover_1g4tn_99", "DraggableComponent--isSelected": "_DraggableComponent--isSelected_1g4tn_113", "DraggableComponent-actions": "_DraggableComponent-actions_1g4tn_139", "DraggableComponent-actionsLabel": "_DraggableComponent-actionsLabel_1g4tn_185", "DraggableComponent-action": "_DraggableComponent-action_1g4tn_139" };

// ../../node_modules/react-feather/dist/index.js
init_react_import();

// ../../node_modules/react-feather/dist/icons/check-circle.js
init_react_import();
var import_react3 = __toESM(require("react"));
var import_prop_types = __toESM(require_prop_types());
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutProperties(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var CheckCircle = (0, import_react3.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react3.default.createElement("svg", _extends({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react3.default.createElement("path", {
    d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
  }), /* @__PURE__ */ import_react3.default.createElement("polyline", {
    points: "22 4 12 14.01 9 11.01"
  }));
});
CheckCircle.propTypes = {
  color: import_prop_types.default.string,
  size: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.number])
};
CheckCircle.displayName = "CheckCircle";
var check_circle_default = CheckCircle;

// ../../node_modules/react-feather/dist/icons/chevron-down.js
init_react_import();
var import_react4 = __toESM(require("react"));
var import_prop_types2 = __toESM(require_prop_types());
function _extends2() {
  _extends2 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends2.apply(this, arguments);
}
function _objectWithoutProperties2(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose2(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose2(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var ChevronDown = (0, import_react4.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties2(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react4.default.createElement("svg", _extends2({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react4.default.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }));
});
ChevronDown.propTypes = {
  color: import_prop_types2.default.string,
  size: import_prop_types2.default.oneOfType([import_prop_types2.default.string, import_prop_types2.default.number])
};
ChevronDown.displayName = "ChevronDown";
var chevron_down_default = ChevronDown;

// ../../node_modules/react-feather/dist/icons/chevron-right.js
init_react_import();
var import_react5 = __toESM(require("react"));
var import_prop_types3 = __toESM(require_prop_types());
function _extends3() {
  _extends3 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends3.apply(this, arguments);
}
function _objectWithoutProperties3(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose3(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose3(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var ChevronRight = (0, import_react5.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties3(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react5.default.createElement("svg", _extends3({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react5.default.createElement("polyline", {
    points: "9 18 15 12 9 6"
  }));
});
ChevronRight.propTypes = {
  color: import_prop_types3.default.string,
  size: import_prop_types3.default.oneOfType([import_prop_types3.default.string, import_prop_types3.default.number])
};
ChevronRight.displayName = "ChevronRight";
var chevron_right_default = ChevronRight;

// ../../node_modules/react-feather/dist/icons/copy.js
init_react_import();
var import_react6 = __toESM(require("react"));
var import_prop_types4 = __toESM(require_prop_types());
function _extends4() {
  _extends4 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends4.apply(this, arguments);
}
function _objectWithoutProperties4(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose4(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose4(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var Copy = (0, import_react6.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties4(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react6.default.createElement("svg", _extends4({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react6.default.createElement("rect", {
    x: "9",
    y: "9",
    width: "13",
    height: "13",
    rx: "2",
    ry: "2"
  }), /* @__PURE__ */ import_react6.default.createElement("path", {
    d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
  }));
});
Copy.propTypes = {
  color: import_prop_types4.default.string,
  size: import_prop_types4.default.oneOfType([import_prop_types4.default.string, import_prop_types4.default.number])
};
Copy.displayName = "Copy";
var copy_default = Copy;

// ../../node_modules/react-feather/dist/icons/grid.js
init_react_import();
var import_react7 = __toESM(require("react"));
var import_prop_types5 = __toESM(require_prop_types());
function _extends5() {
  _extends5 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends5.apply(this, arguments);
}
function _objectWithoutProperties5(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose5(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose5(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var Grid = (0, import_react7.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties5(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react7.default.createElement("svg", _extends5({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react7.default.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "7"
  }), /* @__PURE__ */ import_react7.default.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "7"
  }), /* @__PURE__ */ import_react7.default.createElement("rect", {
    x: "14",
    y: "14",
    width: "7",
    height: "7"
  }), /* @__PURE__ */ import_react7.default.createElement("rect", {
    x: "3",
    y: "14",
    width: "7",
    height: "7"
  }));
});
Grid.propTypes = {
  color: import_prop_types5.default.string,
  size: import_prop_types5.default.oneOfType([import_prop_types5.default.string, import_prop_types5.default.number])
};
Grid.displayName = "Grid";
var grid_default = Grid;

// ../../node_modules/react-feather/dist/icons/hash.js
init_react_import();
var import_react8 = __toESM(require("react"));
var import_prop_types6 = __toESM(require_prop_types());
function _extends6() {
  _extends6 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends6.apply(this, arguments);
}
function _objectWithoutProperties6(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose6(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose6(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var Hash = (0, import_react8.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties6(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react8.default.createElement("svg", _extends6({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react8.default.createElement("line", {
    x1: "4",
    y1: "9",
    x2: "20",
    y2: "9"
  }), /* @__PURE__ */ import_react8.default.createElement("line", {
    x1: "4",
    y1: "15",
    x2: "20",
    y2: "15"
  }), /* @__PURE__ */ import_react8.default.createElement("line", {
    x1: "10",
    y1: "3",
    x2: "8",
    y2: "21"
  }), /* @__PURE__ */ import_react8.default.createElement("line", {
    x1: "16",
    y1: "3",
    x2: "14",
    y2: "21"
  }));
});
Hash.propTypes = {
  color: import_prop_types6.default.string,
  size: import_prop_types6.default.oneOfType([import_prop_types6.default.string, import_prop_types6.default.number])
};
Hash.displayName = "Hash";
var hash_default = Hash;

// ../../node_modules/react-feather/dist/icons/layers.js
init_react_import();
var import_react9 = __toESM(require("react"));
var import_prop_types7 = __toESM(require_prop_types());
function _extends7() {
  _extends7 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends7.apply(this, arguments);
}
function _objectWithoutProperties7(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose7(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose7(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var Layers = (0, import_react9.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties7(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react9.default.createElement("svg", _extends7({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react9.default.createElement("polygon", {
    points: "12 2 2 7 12 12 22 7 12 2"
  }), /* @__PURE__ */ import_react9.default.createElement("polyline", {
    points: "2 17 12 22 22 17"
  }), /* @__PURE__ */ import_react9.default.createElement("polyline", {
    points: "2 12 12 17 22 12"
  }));
});
Layers.propTypes = {
  color: import_prop_types7.default.string,
  size: import_prop_types7.default.oneOfType([import_prop_types7.default.string, import_prop_types7.default.number])
};
Layers.displayName = "Layers";
var layers_default = Layers;

// ../../node_modules/react-feather/dist/icons/link.js
init_react_import();
var import_react10 = __toESM(require("react"));
var import_prop_types8 = __toESM(require_prop_types());
function _extends8() {
  _extends8 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends8.apply(this, arguments);
}
function _objectWithoutProperties8(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose8(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose8(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var Link = (0, import_react10.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties8(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react10.default.createElement("svg", _extends8({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react10.default.createElement("path", {
    d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
  }), /* @__PURE__ */ import_react10.default.createElement("path", {
    d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
  }));
});
Link.propTypes = {
  color: import_prop_types8.default.string,
  size: import_prop_types8.default.oneOfType([import_prop_types8.default.string, import_prop_types8.default.number])
};
Link.displayName = "Link";
var link_default = Link;

// ../../node_modules/react-feather/dist/icons/list.js
init_react_import();
var import_react11 = __toESM(require("react"));
var import_prop_types9 = __toESM(require_prop_types());
function _extends9() {
  _extends9 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends9.apply(this, arguments);
}
function _objectWithoutProperties9(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose9(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose9(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var List = (0, import_react11.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties9(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react11.default.createElement("svg", _extends9({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react11.default.createElement("line", {
    x1: "8",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /* @__PURE__ */ import_react11.default.createElement("line", {
    x1: "8",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /* @__PURE__ */ import_react11.default.createElement("line", {
    x1: "8",
    y1: "18",
    x2: "21",
    y2: "18"
  }), /* @__PURE__ */ import_react11.default.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "3.01",
    y2: "6"
  }), /* @__PURE__ */ import_react11.default.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "3.01",
    y2: "12"
  }), /* @__PURE__ */ import_react11.default.createElement("line", {
    x1: "3",
    y1: "18",
    x2: "3.01",
    y2: "18"
  }));
});
List.propTypes = {
  color: import_prop_types9.default.string,
  size: import_prop_types9.default.oneOfType([import_prop_types9.default.string, import_prop_types9.default.number])
};
List.displayName = "List";
var list_default = List;

// ../../node_modules/react-feather/dist/icons/trash.js
init_react_import();
var import_react12 = __toESM(require("react"));
var import_prop_types10 = __toESM(require_prop_types());
function _extends10() {
  _extends10 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends10.apply(this, arguments);
}
function _objectWithoutProperties10(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose10(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose10(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var Trash = (0, import_react12.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties10(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react12.default.createElement("svg", _extends10({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react12.default.createElement("polyline", {
    points: "3 6 5 6 21 6"
  }), /* @__PURE__ */ import_react12.default.createElement("path", {
    d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
  }));
});
Trash.propTypes = {
  color: import_prop_types10.default.string,
  size: import_prop_types10.default.oneOfType([import_prop_types10.default.string, import_prop_types10.default.number])
};
Trash.displayName = "Trash";
var trash_default = Trash;

// ../../node_modules/react-feather/dist/icons/type.js
init_react_import();
var import_react13 = __toESM(require("react"));
var import_prop_types11 = __toESM(require_prop_types());
function _extends11() {
  _extends11 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends11.apply(this, arguments);
}
function _objectWithoutProperties11(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose11(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose11(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
var Type = (0, import_react13.forwardRef)(function(_ref, ref) {
  var _ref$color = _ref.color, color = _ref$color === void 0 ? "currentColor" : _ref$color, _ref$size = _ref.size, size = _ref$size === void 0 ? 24 : _ref$size, rest = _objectWithoutProperties11(_ref, ["color", "size"]);
  return /* @__PURE__ */ import_react13.default.createElement("svg", _extends11({
    ref,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), /* @__PURE__ */ import_react13.default.createElement("polyline", {
    points: "4 7 4 4 20 4 20 7"
  }), /* @__PURE__ */ import_react13.default.createElement("line", {
    x1: "9",
    y1: "20",
    x2: "15",
    y2: "20"
  }), /* @__PURE__ */ import_react13.default.createElement("line", {
    x1: "12",
    y1: "4",
    x2: "12",
    y2: "20"
  }));
});
Type.propTypes = {
  color: import_prop_types11.default.string,
  size: import_prop_types11.default.oneOfType([import_prop_types11.default.string, import_prop_types11.default.number])
};
Type.displayName = "Type";
var type_default = Type;

// lib/use-modifier-held.ts
init_react_import();
var import_react14 = require("react");
var useModifierHeld = (modifier) => {
  const [modifierHeld, setModifierHeld] = (0, import_react14.useState)(false);
  (0, import_react14.useEffect)(() => {
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
  (0, import_react15.useEffect)(onMount, []);
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
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: getClassName2("action"), onClick: onDuplicate, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(copy_default, { size: 16 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: getClassName2("action"), onClick: onDelete, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(trash_default, { size: 16 }) })
            ] }) })
          ]
        })
      )
    },
    id
  );
};

// components/DroppableStrictMode/index.tsx
init_react_import();
var import_react16 = require("react");
var import_react_beautiful_dnd2 = require("react-beautiful-dnd");
var import_jsx_runtime3 = require("react/jsx-runtime");
var DroppableStrictMode = (_a) => {
  var _b = _a, { children } = _b, props = __objRest(_b, ["children"]);
  const [enabled, setEnabled] = (0, import_react16.useState)(false);
  (0, import_react16.useEffect)(() => {
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

// lib/get-item.ts
init_react_import();

// lib/root-droppable-id.ts
init_react_import();
var rootDroppableId = "default-zone";

// lib/setup-zone.ts
init_react_import();
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

// lib/index.ts
init_react_import();

// lib/filter.ts
init_react_import();
var filter = (obj, validKeys) => {
  return validKeys.reduce((acc, item) => {
    if (typeof obj[item] !== "undefined") {
      return __spreadProps(__spreadValues({}, acc), { [item]: obj[item] });
    }
    return acc;
  }, {});
};

// lib/reorder.ts
init_react_import();
var reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// lib/replace.ts
init_react_import();
var replace = (list, index, newItem) => {
  const result = Array.from(list);
  result.splice(index, 1);
  result.splice(index, 0, newItem);
  return result;
};

// css-module:E:\Projects\low-code-puck\packages\core\components\DropZone\styles.module.css#css-module
init_react_import();
var styles_module_default2 = { "DropZone": "_DropZone_1686o_1", "DropZone-content": "_DropZone-content_1686o_21", "DropZone--userIsDragging": "_DropZone--userIsDragging_1686o_31", "DropZone--draggingOverArea": "_DropZone--draggingOverArea_1686o_39", "DropZone--draggingNewComponent": "_DropZone--draggingNewComponent_1686o_41", "DropZone--isAreaSelected": "_DropZone--isAreaSelected_1686o_53", "DropZone--hoveringOverArea": "_DropZone--hoveringOverArea_1686o_55", "DropZone--isDisabled": "_DropZone--isDisabled_1686o_57", "DropZone--isRootZone": "_DropZone--isRootZone_1686o_59", "DropZone--hasChildren": "_DropZone--hasChildren_1686o_71", "DropZone--isDestination": "_DropZone--isDestination_1686o_81", "DropZone-item": "_DropZone-item_1686o_97", "DropZone-hitbox": "_DropZone-hitbox_1686o_113" };

// components/DropZone/context.tsx
init_react_import();
var import_react17 = require("react");
var import_use_debounce = require("use-debounce");

// lib/get-zone-id.ts
init_react_import();
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
var dropZoneContext = (0, import_react17.createContext)(null);
var DropZoneProvider = ({
  children,
  value
}) => {
  const [hoveringArea, setHoveringArea] = (0, import_react17.useState)(null);
  const [hoveringZone, setHoveringZone] = (0, import_react17.useState)(
    rootDroppableId
  );
  const [hoveringComponent, setHoveringComponent] = (0, import_react17.useState)();
  const [hoveringAreaDb] = (0, import_use_debounce.useDebounce)(hoveringArea, 75, { leading: false });
  const [areasWithZones, setAreasWithZones] = (0, import_react17.useState)(
    {}
  );
  const [activeZones, setActiveZones] = (0, import_react17.useState)({});
  const { dispatch = null } = value ? value : {};
  const registerZoneArea = (0, import_react17.useCallback)(
    (area) => {
      setAreasWithZones((latest) => __spreadProps(__spreadValues({}, latest), { [area]: true }));
    },
    [setAreasWithZones]
  );
  const registerZone = (0, import_react17.useCallback)(
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
  const unregisterZone = (0, import_react17.useCallback)(
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
  const [pathData, setPathData] = (0, import_react17.useState)();
  const registerPath = (0, import_react17.useCallback)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_jsx_runtime4.Fragment, { children: value && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    dropZoneContext.Provider,
    {
      value: __spreadValues({
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
      }, value),
      children
    }
  ) });
};

// components/DropZone/index.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var getClassName3 = get_class_name_factory_default("DropZone", styles_module_default2);
function DropZoneEdit({ zone, style }) {
  var _a, _b;
  const ctx = (0, import_react18.useContext)(dropZoneContext);
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
  let content = data.content || [];
  let zoneCompound = rootDroppableId;
  (0, import_react18.useEffect)(() => {
    if (areaId && registerZoneArea) {
      registerZoneArea(areaId);
    }
  }, [areaId]);
  (0, import_react18.useEffect)(() => {
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
  const { hoveringArea = "root", setHoveringArea, hoveringZone, setHoveringZone, setHoveringComponent } = ctx;
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
      style: {
        zoom: 1 / ((_b = ctx.zoomLevel) != null ? _b : 0.75)
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DroppableStrictMode_default, { droppableId: zoneCompound, direction: "vertical", isDropDisabled: !isEnabled, children: (provided, snapshot) => {
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
                var _a2, _b2;
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
                          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { zoom: (_b2 = ctx.zoomLevel) != null ? _b2 : 0.75 }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Render2, __spreadValues({}, defaultedProps)) })
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
      } })
    }
  );
}
function DropZoneRender({ zone }) {
  const ctx = (0, import_react18.useContext)(dropZoneContext);
  const { data, areaId = "root", config } = ctx || {};
  let zoneCompound = rootDroppableId;
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
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DropZoneProvider, { value: { data, config, areaId: item.props.id }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Component.render, __spreadValues({}, item.props)) }, item.props.id);
    }
    return null;
  }) });
}
function DropZone(props) {
  const ctx = (0, import_react18.useContext)(dropZoneContext);
  if ((ctx == null ? void 0 : ctx.mode) === "edit") {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DropZoneEdit, __spreadValues({}, props));
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DropZoneRender, __spreadValues({}, props));
}

// components/IconButton/index.ts
init_react_import();

// components/IconButton/IconButton.tsx
init_react_import();
var import_react19 = require("react");

// css-module:E:\Projects\low-code-puck\packages\core\components\IconButton\IconButton.module.css#css-module
init_react_import();
var IconButton_module_default = { "IconButton": "_IconButton_1uxuq_1" };

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
  const [loading, setLoading] = (0, import_react19.useState)(false);
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
init_react_import();
var import_react23 = require("react");
var import_react_beautiful_dnd4 = require("react-beautiful-dnd");

// components/InputOrGroup/index.tsx
init_react_import();

// components/ExternalInput/index.tsx
init_react_import();
var import_react20 = require("react");

// css-module:E:\Projects\low-code-puck\packages\core\components\ExternalInput\styles.module.css#css-module
init_react_import();
var styles_module_default3 = { "ExternalInput": "_ExternalInput_7defh_1", "ExternalInput-actions": "_ExternalInput-actions_7defh_9", "ExternalInput-button": "_ExternalInput-button_7defh_17", "ExternalInput-detachButton": "_ExternalInput-detachButton_7defh_55", "ExternalInput--hasData": "_ExternalInput--hasData_7defh_69", "ExternalInput-modal": "_ExternalInput-modal_7defh_109", "ExternalInput--modalVisible": "_ExternalInput--modalVisible_7defh_137", "ExternalInput-modalInner": "_ExternalInput-modalInner_7defh_145", "ExternalInput-modalHeading": "_ExternalInput-modalHeading_7defh_167", "ExternalInput-modalTableWrapper": "_ExternalInput-modalTableWrapper_7defh_177" };

// components/ExternalInput/index.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var getClassName5 = get_class_name_factory_default("ExternalInput", styles_module_default3);
var ExternalInput = ({
  field,
  onChange,
  value = null
}) => {
  const [data, setData] = (0, import_react20.useState)([]);
  const [isOpen, setOpen] = (0, import_react20.useState)(false);
  const [selectedData, setSelectedData] = (0, import_react20.useState)(value);
  (0, import_react20.useEffect)(() => {
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
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(link_default, { size: "16" }),
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

// css-module:E:\Projects\low-code-puck\packages\core\components\InputOrGroup\styles.module.css#css-module
init_react_import();
var styles_module_default4 = { "Input": "_Input_1dddz_1", "Input-label": "_Input-label_1dddz_53", "Input-labelIcon": "_Input-labelIcon_1dddz_67", "Input-input": "_Input-input_1dddz_77", "Input--readOnly": "_Input--readOnly_1dddz_119", "Input-arrayItem": "_Input-arrayItem_1dddz_137", "Input-fieldset": "_Input-fieldset_1dddz_189", "Input-arrayItemAction": "_Input-arrayItemAction_1dddz_231", "Input-addButton": "_Input-addButton_1dddz_269", "Input-array": "_Input-array_1dddz_137", "Input-radioGroupItems": "_Input-radioGroupItems_1dddz_311", "Input-radio": "_Input-radio_1dddz_311", "Input-radioInner": "_Input-radioInner_1dddz_345", "Input-radioInput": "_Input-radioInput_1dddz_369" };

// components/InputOrGroup/index.tsx
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
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(list_default, { size: 16 }) }),
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
                    children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(trash_default, { size: 21 })
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
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(chevron_down_default, { size: 16 }) }),
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
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(type_default, { size: 16 }) }),
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
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: getClassName6("labelIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(check_circle_default, { size: 16 }) }),
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
        field.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(type_default, { size: 16 }),
        field.type === "number" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(hash_default, { size: 16 })
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
init_react_import();
var import_react_beautiful_dnd3 = require("react-beautiful-dnd");

// css-module:E:\Projects\low-code-puck\packages\core\components\ComponentList\styles.module.css#css-module
init_react_import();
var styles_module_default5 = { "ComponentList": "_ComponentList_1gval_1", "ComponentList-item": "_ComponentList-item_1gval_17", "ComponentList-itemShadow": "_ComponentList-itemShadow_1gval_19", "ComponentList-itemIcon": "_ComponentList-itemIcon_1gval_55" };

// components/ComponentList/index.tsx
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
          const componentConfig = config[componentKey];
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
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: getClassName7("itemIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(grid_default, { size: 18 }) })
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
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: getClassName7("itemIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(grid_default, { size: 18 }) })
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
init_react_import();
var import_react21 = require("react");
var usePlaceholderStyle = () => {
  const queryAttr = "data-rbd-drag-handle-draggable-id";
  const [placeholderStyle, setPlaceholderStyle] = (0, import_react21.useState)();
  const onDragStartOrUpdate = (draggedItem) => {
    var _a;
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
      position: "absolute",
      top: clientY,
      left: 0,
      height: clientHeight,
      width: "100%"
    });
  };
  return { onDragStartOrUpdate, placeholderStyle };
};

// components/SidebarSection/index.tsx
init_react_import();

// css-module:E:\Projects\low-code-puck\packages\core\components\SidebarSection\styles.module.css#css-module
init_react_import();
var styles_module_default6 = { "SidebarSection": "_SidebarSection_10pfw_1", "SidebarSection-title": "_SidebarSection-title_10pfw_29", "SidebarSection-content": "_SidebarSection-content_10pfw_43", "SidebarSection--noPadding": "_SidebarSection--noPadding_10pfw_53", "SidebarSection-breadcrumbLabel": "_SidebarSection-breadcrumbLabel_10pfw_71", "SidebarSection-breadcrumbs": "_SidebarSection-breadcrumbs_10pfw_95", "SidebarSection-breadcrumb": "_SidebarSection-breadcrumb_10pfw_71", "SidebarSection-heading": "_SidebarSection-heading_10pfw_119" };

// components/Heading/index.tsx
init_react_import();

// css-module:E:\Projects\low-code-puck\packages\core\components\Heading\styles.module.css#css-module
init_react_import();
var styles_module_default7 = { "Heading": "_Heading_1ducz_1", "Heading--xxxxl": "_Heading--xxxxl_1ducz_25", "Heading--xxxl": "_Heading--xxxl_1ducz_37", "Heading--xxl": "_Heading--xxl_1ducz_45", "Heading--xl": "_Heading--xl_1ducz_53", "Heading--l": "_Heading--l_1ducz_61", "Heading--m": "_Heading--m_1ducz_69", "Heading--s": "_Heading--s_1ducz_77", "Heading--xs": "_Heading--xs_1ducz_85" };

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
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(chevron_right_default, { size: 16 })
      ] }, i)),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: getClassName9("heading"), children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Heading, { rank: 2, size: "m", children: title }) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: getClassName9("content"), children })
  ] });
};

// lib/reducer.ts
init_react_import();

// lib/insert.ts
init_react_import();
var insert = (list, index, item) => {
  const result = Array.from(list);
  result.splice(index, 0, item);
  return result;
};

// lib/remove.ts
init_react_import();
var remove = (list, index) => {
  const result = Array.from(list);
  result.splice(index, 1);
  return result;
};

// lib/reduce-related-zones.ts
init_react_import();

// lib/generate-id.ts
init_react_import();
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
var addToZoneCache = (key, data) => {
  zoneCache[key] = data;
};
var createReducer = ({ config }) => (data, action) => {
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

// components/LayerTree/index.tsx
init_react_import();

// css-module:E:\Projects\low-code-puck\packages\core\components\LayerTree\styles.module.css#css-module
init_react_import();
var styles_module_default8 = { "LayerTree": "_LayerTree_1157r_1", "LayerTree-zoneTitle": "_LayerTree-zoneTitle_1157r_21", "LayerTree-helper": "_LayerTree-helper_1157r_33", "Layer": "_Layer_1157r_1", "Layer-inner": "_Layer-inner_1157r_57", "Layer--containsZone": "_Layer--containsZone_1157r_69", "Layer-clickable": "_Layer-clickable_1157r_77", "Layer--isSelected": "_Layer--isSelected_1157r_95", "Layer--isHovering": "_Layer--isHovering_1157r_97", "Layer-chevron": "_Layer-chevron_1157r_129", "Layer--childIsSelected": "_Layer--childIsSelected_1157r_131", "Layer-zones": "_Layer-zones_1157r_139", "Layer-title": "_Layer-title_1157r_167", "Layer-icon": "_Layer-icon_1157r_183", "Layer-zoneIcon": "_Layer-zoneIcon_1157r_193" };

// lib/scroll-into-view.ts
init_react_import();
var scrollIntoView = (el) => {
  const oldStyle = __spreadValues({}, el.style);
  el.style.scrollMargin = "256px";
  if (el) {
    el == null ? void 0 : el.scrollIntoView({ behavior: "smooth" });
    el.style.scrollMargin = oldStyle.scrollMargin || "";
  }
};

// components/LayerTree/index.tsx
var import_react22 = require("react");

// lib/find-zones-for-area.ts
init_react_import();
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
init_react_import();
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
  const ctx = (0, import_react22.useContext)(dropZoneContext);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    label && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: getClassName10("zoneTitle"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: getClassName10("zoneIcon"), children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(layers_default, { size: "16" }) }),
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
                        children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(chevron_down_default, { size: "12" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: getClassNameLayer("title"), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: getClassNameLayer("icon"), children: item.type === "Text" || item.type === "Heading" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(type_default, { size: "16" }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(grid_default, { size: "16" }) }),
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
init_react_import();
var areaContainsZones = (data, area) => {
  const zones = Object.keys(findZonesForArea(data, area));
  return zones.length > 0;
};

// lib/flush-zones.ts
init_react_import();
var flushZones = (data) => {
  const containsZones = typeof data.zones !== "undefined";
  if (containsZones) {
    Object.keys(data.zones || {}).forEach((zone) => {
      addToZoneCache(zone, data.zones[zone]);
    });
    return __spreadProps(__spreadValues({}, data), {
      zones: {}
    });
  }
  return data;
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
  headerPath,
  containerStyle
}) {
  var _a, _b;
  const puckEle = (0, import_react23.useRef)(null);
  const [reducer] = (0, import_react23.useState)(() => createReducer({ config }));
  const [data, dispatch] = (0, import_react23.useReducer)(
    reducer,
    flushZones(initialData)
  );
  const [itemSelector, setItemSelector] = (0, import_react23.useState)(null);
  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const Page = (0, import_react23.useCallback)(
    (pageProps) => {
      var _a2, _b2;
      return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        PluginRenderer,
        {
          plugins,
          renderMethod: "renderRoot",
          data: pageProps.data,
          children: ((_a2 = config.root) == null ? void 0 : _a2.render) ? (_b2 = config.root) == null ? void 0 : _b2.render(__spreadProps(__spreadValues({}, pageProps), { editMode: true })) : pageProps.children
        }
      );
    },
    [config.root]
  );
  const PageFieldWrapper = (0, import_react23.useCallback)(
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
  const ComponentFieldWrapper = (0, import_react23.useCallback)(
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
  let fields = selectedItem ? ((_b = config.components[selectedItem.type]) == null ? void 0 : _b.fields) || {} : rootFields;
  (0, import_react23.useEffect)(() => {
    if (onChange)
      onChange(data);
  }, [data]);
  const { onDragStartOrUpdate, placeholderStyle } = usePlaceholderStyle();
  const [leftSidebarVisible, setLeftSidebarVisible] = (0, import_react23.useState)(true);
  const [draggedItem, setDraggedItem] = (0, import_react23.useState)();
  const [zoomLevel, setZoomLevel] = (0, import_react23.useState)(0.75);
  (0, import_react23.useEffect)(() => {
    if (puckEle.current) {
      const computedWidth = getComputedStyle(puckEle.current).width;
      setZoomLevel(
        (parseInt(computedWidth) - 288 * 2) / window.innerWidth
      );
    }
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "puck", ref: puckEle, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
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
            areaId: "root",
            zoomLevel
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(dropZoneContext.Consumer, { children: (ctx) => {
            let path = (ctx == null ? void 0 : ctx.pathData) && selectedItem ? ctx == null ? void 0 : ctx.pathData[selectedItem == null ? void 0 : selectedItem.props.id] : void 0;
            if (path) {
              path = [
                { label: "Page", selector: null },
                ...path
              ];
              path = path.slice(
                path.length - 2,
                path.length - 1
              );
            }
            return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
              "div",
              {
                style: __spreadValues({
                  display: "grid",
                  gridTemplateAreas: '"header header header" "left editor right"',
                  gridTemplateColumns: `${leftSidebarVisible ? "288px" : "0px"} auto 288px`,
                  gridTemplateRows: "min-content auto",
                  width: "100%",
                  height: "100%",
                  position: "absolute"
                }, containerStyle),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                    "div",
                    {
                      style: {
                        gridArea: "left",
                        background: "#ffffff",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column"
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(SidebarSection, { title: "Components", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ComponentList, { config }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(SidebarSection, { title: "Outline", children: [
                          (ctx == null ? void 0 : ctx.activeZones) && (ctx == null ? void 0 : ctx.activeZones[rootDroppableId]) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                            LayerTree,
                            {
                              data,
                              label: areaContainsZones(
                                data,
                                "root"
                              ) ? rootDroppableId : "",
                              zoneContent: data.content,
                              setItemSelector,
                              itemSelector
                            }
                          ),
                          Object.entries(
                            findZonesForArea(data, "root")
                          ).map(([zoneKey, zone]) => {
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
                          })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    "div",
                    {
                      style: {
                        padding: 32,
                        overflowY: "auto",
                        gridArea: "editor",
                        position: "relative",
                        background: "var(--puck-color-neutral-1)"
                      },
                      onClick: () => setItemSelector(null),
                      id: "puck-frame",
                      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                        "div",
                        {
                          className: "puck-root",
                          style: {
                            boxShadow: "0px 0px 0px 3rem var(--puck-color-neutral-1)",
                            background: "white",
                            zoom: zoomLevel
                          },
                          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Page, __spreadProps(__spreadValues({ data }, data.root), { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                            DropZone,
                            {
                              zone: rootDroppableId
                            }
                          ) }))
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                    "div",
                    {
                      style: {
                        overflowY: "auto",
                        gridArea: "right",
                        fontFamily: "var(--puck-font-stack)",
                        display: "flex",
                        flexDirection: "column",
                        background: "#ffffff"
                      },
                      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(FieldWrapper, { data, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                        SidebarSection,
                        {
                          noPadding: true,
                          breadcrumbs: path,
                          breadcrumbClick: (breadcrumb) => setItemSelector(
                            breadcrumb.selector
                          ),
                          title: selectedItem ? selectedItem.type : "Page",
                          children: Object.keys(fields).map(
                            (fieldName) => {
                              var _a2, _b2, _c, _d;
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
                                    const _a3 = currentProps._meta || {}, {
                                      locked
                                    } = _a3, _meta = __objRest(_a3, [
                                      "locked"
                                    ]);
                                    newProps = __spreadProps(__spreadValues({}, currentProps), {
                                      _data: void 0,
                                      _meta
                                    });
                                  } else {
                                    const changedFields = filter(
                                      // filter out anything not supported by this component
                                      value,
                                      Object.keys(
                                        fields
                                      )
                                    );
                                    newProps = __spreadProps(__spreadValues(__spreadValues({}, currentProps), changedFields), {
                                      _data: value,
                                      // TODO perf - this is duplicative and will make payload larger
                                      _meta: {
                                        locked: Object.keys(
                                          changedFields
                                        )
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
                                    data: __spreadProps(__spreadValues({}, selectedItem), {
                                      props: newProps
                                    })
                                  });
                                } else {
                                  dispatch({
                                    type: "set",
                                    data: {
                                      root: newProps
                                    }
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
                                    readOnly: ((_b2 = (_a2 = getItem(
                                      itemSelector,
                                      data
                                    ).props._meta) == null ? void 0 : _a2.locked) == null ? void 0 : _b2.indexOf(
                                      fieldName
                                    )) > -1,
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
                                    readOnly: ((_d = (_c = data.root._meta) == null ? void 0 : _c.locked) == null ? void 0 : _d.indexOf(
                                      fieldName
                                    )) > -1,
                                    value: data.root[fieldName],
                                    onChange: onChange2
                                  },
                                  `page_${fieldName}`
                                );
                              }
                            }
                          )
                        }
                      ) })
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
init_react_import();
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
/*! Bundled license information:

react-is/cjs/react-is.production.min.js:
  (** @license React v16.13.1
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
*/
