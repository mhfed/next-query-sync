// src/parsers.ts
function makeParser(parseFn, serializeFn) {
  const withDefaultFn = (defaultValue) => ({
    parse: (v) => {
      var _a;
      return (_a = parseFn(v)) != null ? _a : defaultValue;
    },
    serialize: serializeFn,
    withDefault: withDefaultFn,
    defaultValue
  });
  return { parse: parseFn, serialize: serializeFn, withDefault: withDefaultFn };
}
var parseAsString = makeParser(
  (v) => v,
  (v) => v
);
var parseAsInteger = makeParser(
  (v) => {
    if (v === null || v === "") return null;
    const parsed = parseInt(v, 10);
    return Number.isNaN(parsed) ? null : parsed;
  },
  (v) => Math.round(v).toString()
);
var parseAsFloat = makeParser(
  (v) => {
    if (v === null || v === "") return null;
    const parsed = parseFloat(v);
    return Number.isNaN(parsed) ? null : parsed;
  },
  (v) => v.toString()
);
var parseAsBoolean = makeParser(
  (v) => {
    if (v === null) return null;
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  },
  (v) => v.toString()
);
var parseAsIsoDateTime = makeParser(
  (v) => {
    if (v === null || v === "") return null;
    const date = new Date(v);
    return Number.isNaN(date.getTime()) ? null : date;
  },
  (v) => v.toISOString()
);
function parseAsArrayOf(itemParser, separator = ",") {
  return makeParser(
    (v) => {
      if (v === null || v === "") return null;
      const items = v.split(separator);
      const result = [];
      for (const item of items) {
        const parsed = itemParser.parse(item.trim());
        if (parsed !== null) result.push(parsed);
      }
      return result.length > 0 ? result : null;
    },
    (v) => v.map((item) => itemParser.serialize(item)).join(separator)
  );
}
function withDefault(parser, defaultValue) {
  return parser.withDefault(defaultValue);
}

// src/useQuery.ts
import {
  useCallback,
  useSyncExternalStore,
  startTransition as reactStartTransition,
  useState,
  useEffect,
  useRef
} from "react";

// src/emitter.ts
var subscribe = (callback) => {
  if (typeof window === "undefined") return () => {
  };
  window.addEventListener("next-query-sync_update", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("next-query-sync_update", callback);
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
      window.dispatchEvent(new Event("next-query-sync_update"));
    });
  }
};

// src/useQuery.ts
function isZodDefaultLike(v) {
  return typeof v === "object" && v !== null && "safeParse" in v && "_def" in v && typeof v._def === "object" && "defaultValue" in v._def;
}
function isZodLike(v) {
  return typeof v === "object" && v !== null && "safeParse" in v;
}
function zodToParser(schema) {
  const parseFn = (v) => {
    if (v === null || v === "") return null;
    let raw;
    try {
      raw = JSON.parse(v);
    } catch (e) {
      return null;
    }
    const result = schema.safeParse(raw);
    return result.success ? result.data : null;
  };
  const serializeFn = (value) => JSON.stringify(value);
  const withDefaultFn = (defaultValue) => ({
    parse: (v) => {
      var _a;
      return (_a = parseFn(v)) != null ? _a : defaultValue;
    },
    serialize: serializeFn,
    withDefault: withDefaultFn,
    defaultValue
  });
  return { parse: parseFn, serialize: serializeFn, withDefault: withDefaultFn };
}
function inferParser(defaultValue) {
  let parseFn;
  let serializeFn;
  if (typeof defaultValue === "number") {
    parseFn = (v) => {
      if (v === null || v === "") return defaultValue;
      const parsed = Number(v);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    };
    serializeFn = (v) => String(v);
  } else if (typeof defaultValue === "boolean") {
    parseFn = (v) => {
      if (v === null) return defaultValue;
      return v === "true";
    };
    serializeFn = (v) => String(v);
  } else {
    parseFn = (v) => v === null ? defaultValue : v;
    serializeFn = (v) => String(v);
  }
  const withDefaultFn = (dv) => inferParser(dv);
  return { parse: parseFn, serialize: serializeFn, withDefault: withDefaultFn, defaultValue };
}
function useQueryState(key, parserOrDefault, options = {}) {
  const { history = "replace", debounce: debounceMs, startTransition: useTransition } = options;
  let parser;
  let primitiveDefault;
  if (typeof parserOrDefault !== "object") {
    primitiveDefault = parserOrDefault;
    parser = inferParser(primitiveDefault);
  } else if (isZodDefaultLike(parserOrDefault)) {
    const rawDefault = parserOrDefault._def.defaultValue;
    const defaultValue = typeof rawDefault === "function" ? rawDefault() : rawDefault;
    parser = zodToParser(parserOrDefault).withDefault(defaultValue);
  } else if (isZodLike(parserOrDefault)) {
    parser = zodToParser(parserOrDefault);
  } else {
    parser = parserOrDefault;
  }
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }, [key]);
  const getServerSnapshot = () => null;
  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const urlValue = parser.parse(rawValue);
  const [pending, setPending] = useState(null);
  useEffect(() => {
    if (pending !== null) setPending(null);
  }, [rawValue]);
  const timerRef = useRef(null);
  const value = pending !== null ? pending.value : urlValue;
  const setValue = useCallback(
    (updater) => {
      const next = typeof updater === "function" ? updater(value) : updater;
      let serialized;
      if (primitiveDefault !== void 0 && next === primitiveDefault) {
        serialized = null;
      } else {
        serialized = next === null ? null : parser.serialize(next);
      }
      const doUpdate = () => {
        if (useTransition) {
          reactStartTransition(() => scheduleUrlUpdate(key, serialized, { history }));
        } else {
          scheduleUrlUpdate(key, serialized, { history });
        }
      };
      if (debounceMs && debounceMs > 0) {
        if (next !== null) setPending({ value: next });
        if (timerRef.current !== null) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(doUpdate, debounceMs);
      } else {
        doUpdate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, value, history, debounceMs, useTransition]
  );
  return [value, setValue];
}

// src/useQueryStates.ts
import { useCallback as useCallback2, useSyncExternalStore as useSyncExternalStore2 } from "react";
function useQueryStates(schema, options = {}) {
  const { history = "replace" } = options;
  const schemaKeys = Object.keys(schema);
  const getSnapshot = useCallback2(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return schemaKeys.map((k) => {
      var _a;
      return `${k}=${(_a = sp.get(k)) != null ? _a : ""}`;
    }).join("&");
  }, [schemaKeys.join(",")]);
  const getServerSnapshot = () => "";
  useSyncExternalStore2(subscribe, getSnapshot, getServerSnapshot);
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
  const setValues = useCallback2(
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
export {
  makeParser,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  useQueryState,
  useQueryStates,
  withDefault
};
