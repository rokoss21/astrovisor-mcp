import assert from "node:assert/strict";
import {
  buildOperationLlmHints,
  normalizeRequestBodyForOperation,
} from "./build/interop.js";

const natalOperation = {
  operationId: "calculate_natal",
  method: "post",
  path: "/api/natal/chart",
  toolName: "astrovisor_calculate_natal",
  requestBodySchema: {
    type: "object",
    additionalProperties: false,
    required: ["name", "datetime", "latitude", "longitude", "location", "timezone"],
    properties: {
      name: { type: "string" },
      datetime: { type: "string", format: "date-time" },
      latitude: { type: "number" },
      longitude: { type: "number" },
      location: { type: "string" },
      timezone: { type: "string" },
    },
  },
};

const hints = buildOperationLlmHints(natalOperation);
assert.equal(hints.profile, "core");
assert.equal(hints.exampleBody.datetime, "2000-01-01T12:00:00");
assert.equal(hints.exampleBody.timezone, "America/New_York");

const normalized = normalizeRequestBodyForOperation(natalOperation, {
  name: "Test",
  birth_datetime: "1990-05-15T14:30:00",
  birth_latitude: 55.7558,
  birth_longitude: 37.6176,
  birth_location: "Moscow",
  birth_timezone: "Europe/Moscow",
  ignored: "remove me",
});
assert.equal(normalized.normalized, true);
assert.deepEqual(normalized.body, {
  name: "Test",
  datetime: "1990-05-15T14:30:00",
  latitude: 55.7558,
  longitude: 37.6176,
  location: "Moscow",
  timezone: "Europe/Moscow",
});

const calendarOperation = {
  operationId: "calendar_window",
  method: "post",
  path: "/api/calendar/window",
  toolName: "astrovisor_calendar_window",
  requestBodySchema: {
    type: "object",
    required: ["start_date", "start_time"],
    properties: {
      start_date: { type: "string", format: "date" },
      start_time: { type: "string", format: "time" },
    },
  },
};
const calendarHints = buildOperationLlmHints(calendarOperation);
assert.equal(calendarHints.exampleBody.start_date, "2000-01-01");
assert.equal(calendarHints.exampleBody.start_time, "12:00:00");

console.log("interop unit checks: ok");
