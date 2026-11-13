import { test } from "node:test";
import assert from "node:assert/strict";
import { windowCountScript, activateScript, menuClickScript, safeMenuTitle, defaultMenuTitle, decideOpen, explainOsaError, interpretMenuResult } from "../src/lib/keys.js";

test("script builder: window count and activate scripts contain the app name", () => {
	assert.match(windowCountScript("Wispr Flow"), /exists process "Wispr Flow"/);
	assert.match(windowCountScript("Wispr Flow"), /count of windows of process "Wispr Flow"/);
	assert.equal(activateScript("Wispr Flow"), 'tell application "Wispr Flow" to activate');
});

test("script builder: menu click script has the app and title, loops, both menu bars, delay and try", () => {
	const s = menuClickScript("Wispr Flow", "Open Wispr Flow");
	assert.match(s, /process "Wispr Flow"/);
	assert.match(s, /\(name of mi\) is "Open Wispr Flow"/);
	assert.match(s, /repeat with barIdx in \{2, 1\}/);
	assert.match(s, /repeat with theItem in \(menu bar items of theBar\)/);
	assert.match(s, /repeat with mi in \(menu items of theMenu\)/);
	assert.match(s, /delay 0\.3/);
	assert.match(s, /try[\s\S]*end try/);
	assert.match(s, /return "ok"/);
	assert.ok(!/menu bar item 1/.test(s));
});

test("script builder: rejects quotes, backslashes and empty input instead of escaping", () => {
	for (const bad of ['x" & (do shell script "id") & "', "a\\b", "", "$(id)", "x;y"]) {
		assert.throws(() => windowCountScript(bad), /Bad app name/);
		assert.throws(() => activateScript(bad), /Bad app name/);
		assert.throws(() => menuClickScript(bad, "Open"), /Bad app name/);
		assert.throws(() => menuClickScript("Wispr Flow", bad), /Bad menu item title/);
		if (bad !== "") assert.equal(safeMenuTitle(bad), null);
	}
});

test("menu title setting: blank means skip, default for Wispr Flow only", () => {
	assert.equal(safeMenuTitle(""), "");
	assert.equal(safeMenuTitle(undefined), "");
	assert.equal(safeMenuTitle("  Open Wispr Flow "), "Open Wispr Flow");
	assert.equal(defaultMenuTitle("Wispr Flow"), "Open Wispr Flow");
	assert.equal(defaultMenuTitle(" wispr flow "), "Open Wispr Flow");
	assert.equal(defaultMenuTitle("Calendar"), "");
});

test("decision: window present activates, absent clicks the menu, absent without title does nothing", () => {
	assert.deepEqual(decideOpen("2", "Open Wispr Flow"), { action: "activate" });
	assert.deepEqual(decideOpen(1, ""), { action: "activate" });
	assert.deepEqual(decideOpen("0", "Open Wispr Flow"), { action: "menu" });
	assert.deepEqual(decideOpen("noprocess", "Open Wispr Flow"), { action: "menu" });
	assert.deepEqual(decideOpen("0", ""), { action: "none" });
});

test("results: short reasons for the alert", () => {
	assert.deepEqual(interpretMenuResult("ok\n"), { ok: true });
	assert.equal(interpretMenuResult("error:no-menu-item").reason, "No window and no menu item found");
	assert.equal(interpretMenuResult("error:no-process").reason, "App is not running");
	assert.equal(interpretMenuResult("error:osascript is not allowed assistive access. (-25211)").reason, "Accessibility not allowed");
	assert.equal(explainOsaError("execution error: osascript is not allowed assistive access. (-25211)"), "Accessibility not allowed");
	assert.equal(explainOsaError("something else"), "AppleScript failed");
});
