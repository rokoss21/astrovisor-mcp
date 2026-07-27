#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(scriptDir, "astrovisor-skill.mjs");
const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "astrovisor-skill-self-test-"),
);
const skillHome = path.join(temporaryRoot, "private-config");
const projectDir = path.join(temporaryRoot, "project");
fs.mkdirSync(projectDir, { recursive: true });

const baseEnv = {
  ...process.env,
  ASTROVISOR_SKILL_HOME: skillHome,
};
delete baseEnv.ASTROVISOR_API_KEY;
delete baseEnv.ASTROVISOR_SKILL_ENV;
delete baseEnv.ASTROVISOR_PROFILE_DIR;

function run(args, { input, expectedStatus = 0 } = {}) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: temporaryRoot,
    env: baseEnv,
    input,
    encoding: "utf8",
  });
  if (result.status !== expectedStatus) {
    throw new Error(
      [
        `Command failed: ${args.join(" ")}`,
        `status=${result.status}, expected=${expectedStatus}`,
        `stdout=${result.stdout}`,
        `stderr=${result.stderr}`,
      ].join("\n"),
    );
  }
  return result;
}

try {
  run(["config", "init"]);
  run(["config", "set-key", "--stdin"], {
    input: "pk-self-test-1234567890\n",
  });

  const status = JSON.parse(
    run(["config", "status", "--json"]).stdout,
  );
  assert.equal(status.configured, true);
  assert.equal(status.api_key, "pk-***7890");
  assert.doesNotMatch(JSON.stringify(status), /pk-self-test/);
  assert.equal(status.profile_update_policy, "ask");

  run([
    "profile",
    "create",
    "me",
    "--default",
    "--set",
    "display_name=Test Person",
    "--set",
    "aliases=[\"tester\",\"self\"]",
    "--set",
    "birth_date=1990-05-15",
    "--set",
    "birth_time=14:30",
    "--set",
    "birth_time_accuracy=exact",
    "--set",
    "birth_place=Moscow, Russia",
    "--set",
    "birth_city=Moscow",
    "--set",
    "birth_country=Russia",
    "--set",
    "birth_latitude=55.7558",
    "--set",
    "birth_longitude=37.6176",
    "--set",
    "birth_timezone=Europe/Moscow",
    "--set",
    "consent_to_store=true",
    "--set",
    "allow_relationship_comparison=true",
  ]);

  const validation = JSON.parse(
    run(["profile", "validate", "me", "--json"]).stdout,
  );
  assert.equal(validation.valid, true);
  assert.equal(validation.readiness.exact_birth, true);
  assert.deepEqual(validation.missing.exact_birth, []);

  const core = JSON.parse(
    run(["profile", "render", "me", "--format", "core"]).stdout,
  );
  assert.deepEqual(core, {
    name: "Test Person",
    datetime: "1990-05-15T14:30:00",
    latitude: 55.7558,
    longitude: 37.6176,
    location: "Moscow, Russia",
    timezone: "Europe/Moscow",
  });

  const birth = JSON.parse(
    run(["profile", "render", "me", "--format", "birth"]).stdout,
  );
  assert.equal(birth.birth_datetime, "1990-05-15T14:30:00");
  assert.equal(birth.birth_timezone, "Europe/Moscow");

  run([
    "profile",
    "create",
    "partner",
    "--set",
    "display_name=Partner Person",
    "--set",
    "birth_date=1992-08-03",
    "--set",
    "birth_time=09:10",
    "--set",
    "birth_time_accuracy=exact",
    "--set",
    "birth_place=Minsk, Belarus",
    "--set",
    "birth_latitude=53.9006",
    "--set",
    "birth_longitude=27.559",
    "--set",
    "birth_timezone=Europe/Minsk",
    "--set",
    "consent_to_store=true",
    "--set",
    "allow_relationship_comparison=true",
  ]);
  const partner = JSON.parse(
    run(["profile", "render", "partner", "--format", "core"]).stdout,
  );
  const relationshipBody = { partner1: core, partner2: partner };
  assert.equal(relationshipBody.partner1.timezone, "Europe/Moscow");
  assert.equal(relationshipBody.partner2.timezone, "Europe/Minsk");
  assert.notEqual(
    relationshipBody.partner1.latitude,
    relationshipBody.partner2.latitude,
  );

  const resolved = JSON.parse(
    run(["profile", "resolve", "tester", "--json"]).stdout,
  );
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].id, "me");

  run([
    "profile",
    "set",
    "me",
    "--set",
    "focus_areas=[\"career\",\"relationships\"]",
    "--set",
    "interpretation_language=ru",
  ]);
  const shown = JSON.parse(
    run(["profile", "show", "me", "--json"]).stdout,
  );
  assert.deepEqual(shown.profile.focus_areas, [
    "career",
    "relationships",
  ]);
  assert.match(shown.narrative, /Explicit CLI update/);

  run(["profile", "create", "unknown-time", "--set", "display_name=Unknown"]);
  run(
    ["profile", "render", "unknown-time", "--format", "core"],
    { expectedStatus: 1 },
  );

  run([
    "install",
    "--target",
    "both",
    "--scope",
    "project",
    "--project-dir",
    projectDir,
  ]);
  assert.ok(
    fs.existsSync(
      path.join(
        projectDir,
        ".agents",
        "skills",
        "astrovisor",
        "SKILL.md",
      ),
    ),
  );
  assert.ok(
    fs.existsSync(
      path.join(
        projectDir,
        ".claude",
        "skills",
        "astrovisor",
        "SKILL.md",
      ),
    ),
  );

  const clientConfig = run(["client-config", "all"]).stdout;
  assert.match(clientConfig, /mcp_servers\.astrovisor/);
  assert.match(clientConfig, /claude mcp add/);
  assert.match(clientConfig, /claude_desktop_config/);
  assert.doesNotMatch(clientConfig, /pk-/);

  if (process.platform !== "win32") {
    const envMode =
      fs.statSync(path.join(skillHome, "skill.env")).mode & 0o777;
    const profileMode =
      fs.statSync(path.join(skillHome, "profiles", "me.md")).mode & 0o777;
    assert.equal(envMode, 0o600);
    assert.equal(profileMode, 0o600);
  }

  console.log(
    JSON.stringify(
      {
        passed: true,
        tests: [
          "private config and masked key",
          "maximum-fields Markdown profile",
          "validation and readiness",
          "core and birth request rendering",
          "isolated multi-person request rendering",
          "alias resolution and progressive update",
          "unknown-time safety",
          "Codex and Claude installation",
          "secret-free client configuration",
          "private POSIX file modes",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
