"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  parseAsArrayOf: () => parseAsArrayOf,
  parseAsBoolean: () => parseAsBoolean,
  parseAsFloat: () => parseAsFloat,
  parseAsInteger: () => parseAsInteger,
  parseAsString: () => parseAsString,
  useQueryState: () => useQueryState,
  useQueryStates: () => useQueryStates,
  withDefault: () => withDefault
});
module.exports = __toCommonJS(index_exports);

// src/parsers.ts
var parseAsString = {
  parse: (v) => v,
  serialize: (v) => v
};
var parseAsInteger = {
  parse: (v) => {
    if (v === null || v === "") return null;
    const parsed = parseInt(v, 10);
    return Number.isNaN(parsed) ? null : parsed;
  },
  serialize: (v) => Math.round(v).toString()
};
var parseAsFloat = {
  parse: (v) => {
    if (v === null || v === "") return null;
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? null : parsed;
  },
  serialize: (v) => v.toString()
};
var parseAsBoolean = {
  parse: (v) => {
    if (v === null) return null;
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  },
  serialize: (v) => v.toString()
};
function parseAsArrayOf(itemParser, separator = ",") {
  return {
    parse: (v) => {
      if (v === null || v === "") return null;
      const items = v.split(separator);
      const result = [];
      for (const item of items) {
        const parsed = itemParser.parse(item.trim());
        if (parsed !== null) result.push(parsed);
      }
      return result.length > 0 ? result : null;
    },
    serialize: (v) => v.map((item) => itemParser.serialize(item)).join(separator)
  };
}
function withDefault(parser, defaultValue) {
  return __spreadProps(__spreadValues({}, parser), {
    parse: (v) => {
      var _a;
      return (_a = parser.parse(v)) != null ? _a : defaultValue;
    },
    defaultValue
  });
}

// src/useQuery.ts
var import_react = require("react");

// src/emitter.ts
var subscribe = (callback) => {
  if (typeof window === "undefined") return () => {
  };
  window.addEventListener("nuqschim_update", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("nuqschim_update", callback);
    window.removeEventListener("popstate", callback);
  };
};

// src/batcher.ts
var isScheduled = false;
var batchedParams = null;
var batchedHistory = "replace";
var scheduleUrlUpdate = (key, value, options = { history: "replace" }) => {
  if (typeof window === "undefined") return;
  if (!batchedParams) {
    batchedParams = new URLSearchParams(window.location.search);
  }
  if (value === null) {
    batchedParams.delete(key);
  } else {
    batchedParams.set(key, value);
  }
  if (options.history === "push") {
    batchedHistory = "push";
  }
  if (!isScheduled) {
    isScheduled = true;
    queueMicrotask(() => {
      if (!batchedParams) return;
      const search = batchedParams.toString();
      const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
      if (batchedHistory === "push") {
        window.history.pushState(null, "", newUrl);
      } else {
        window.history.replaceState(null, "", newUrl);
      }
      isScheduled = false;
      batchedParams = null;
      batchedHistory = "replace";
      window.dispatchEvent(new Event("nuqschim_update"));
    });
  }
};

// src/useQuery.ts
function useQueryState(key, parser, options = {}) {
  const { history = "replace" } = options;
  const getSnapshot = (0, import_react.useCallback)(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }, [key]);
  const getServerSnapshot = () => null;
  const rawValue = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
  const value = parser.parse(rawValue);
  const setValue = (0, import_react.useCallback)(
    (updater) => {
      const next = typeof updater === "function" ? updater(value) : updater;
      const serialized = next === null ? null : parser.serialize(next);
      scheduleUrlUpdate(key, serialized, { history });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, value, history]
  );
  return [value, setValue];
}

// src/useQueryStates.ts
var import_react2 = require("react");
function useQueryStates(schema, options = {}) {
  const { history = "replace" } = options;
  const schemaKeys = Object.keys(schema);
  const getSnapshot = (0, import_react2.useCallback)(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return schemaKeys.map((k) => {
      var _a;
      return `${k}=${(_a = sp.get(k)) != null ? _a : ""}`;
    }).join("&");
  }, [schemaKeys.join(",")]);
  const getServerSnapshot = () => "";
  (0, import_react2.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
  const values = {};
  if (typeof window !== "undefined") {
    const sp = new URLSearchParams(window.location.search);
    for (const key of schemaKeys) {
      const parser = schema[key];
      values[key] = parser.parse(sp.get(key));
    }
  } else {
    for (const key of schemaKeys) {
      values[key] = null;
    }
  }
  const setValues = (0, import_react2.useCallback)(
    (updater) => {
      for (const key of Object.keys(updater)) {
        const parser = schema[key];
        const rawUpdater = updater[key];
        const currentValue = values[key];
        const next = typeof rawUpdater === "function" ? rawUpdater(currentValue) : rawUpdater;
        const serialized = next == null ? null : parser.serialize(next);
        scheduleUrlUpdate(key, serialized, { history });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, JSON.stringify(values)]
  );
  return [values, setValues];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
  withDefault
});
