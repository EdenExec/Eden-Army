// Build the small AppleScript snippets used to send keystrokes. Pure functions (easy to test).
// The plugin runs them with `osascript -e <script>` (no shell involved).

export const KEY_CODES = { left: 123, right: 124, down: 125, up: 126, escape: 53 };

export function pressKeyCode(code, modifiers = []) {
	const using = modifiers.length ? ` using {${modifiers.map((m) => `${m} down`).join(", ")}}` : "";
	return `tell application "System Events" to key code ${code}${using}`;
}

// Control + number (the Mission Control "Switch to Desktop N" shortcut).
export function controlNumber(n) {
	const digit = Math.round(Number(n));
	if (!(digit >= 1 && digit <= 9)) throw new Error("Desktop number must be 1 to 9");
	return `tell application "System Events" to keystroke "${digit}" using {control down}`;
}

export const volumeScript = {
	read: 'set s to get volume settings\nreturn (output volume of s as string) & "," & (output muted of s as string)',
	set: (level) => `set volume output volume ${Math.max(0, Math.min(100, Math.round(level)))}`,
	setMuted: (muted) => `set volume output muted ${muted ? "true" : "false"}`,
};

// Parse the answer of volumeScript.read, e.g. "52,false".
export function parseVolume(text) {
	const [lvl, muted] = String(text).trim().split(",");
	const level = Number(lvl);
	return { level: Number.isFinite(level) ? level : 0, muted: muted === "true" };
}

// Only plain web links may be opened from a key.
export function safeWebUrl(input) {
	if (typeof input !== "string") return null;
	let s = input.trim().replace(/^webcal:\/\//i, "https://");
	if (!s) return null;
	if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`;
	try {
		const u = new URL(s);
		return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
	} catch {
		return null;
	}
}

// App names go straight to `open -a <name>` as one argument; reject anything odd.
// Hyphens and the typographic dashes (en dash, em dash, minus) are fine: Chrome web apps are often
// named like "Eden Day Board – Claude artifact".
export function safeAppName(input) {
	if (typeof input !== "string") return null;
	const s = input.trim();
	return s && s.length <= 80 && /^[\w .&+'()\-\u2010-\u2015\u2212]+$/u.test(s) ? s : null;
}

// ---- bring an app's real window up (menu-bar apps such as Wispr Flow) ----
// Plan: `open -a <app>`; count the app's windows; if there is one, activate the app; if there is none,
// click the menu item named in the "Menu item to click" setting from the app's menu bar status item.

// Menu item titles follow the same plain-text rule as app names (no quotes, no backslashes).
// An empty title means "skip the menu click" and is returned as "".
export function safeMenuTitle(input) {
	if (input === undefined || input === null || String(input).trim() === "") return "";
	return safeAppName(String(input));
}

// The default title for the setting: "Open Wispr Flow" for Wispr Flow, empty for any other app.
export function defaultMenuTitle(appName) {
	return String(appName ?? "").trim().toLowerCase() === "wispr flow" ? "Open Wispr Flow" : "";
}

function checked(name, what) {
	const safe = safeAppName(name);
	if (!safe) throw new Error(`Bad ${what}`);
	return safe;
}

// Returns the number of windows of the app's process, or the word "noprocess".
export function windowCountScript(app) {
	const a = checked(app, "app name");
	return [
		'tell application "System Events"',
		`\tif not (exists process "${a}") then return "noprocess"`,
		`\treturn (count of windows of process "${a}") as string`,
		"end tell",
	].join("\n");
}

export function activateScript(app) {
	return `tell application "${checked(app, "app name")}" to activate`;
}

// Opens the app's status item menus (menu bar 2 first, then menu bar 1) and clicks the item with this exact title.
// Loops over items instead of assuming index 1. Returns "ok", "error:no-menu-item" or "error:<message>".
export function menuClickScript(app, title) {
	const a = checked(app, "app name");
	const t = checked(title, "menu item title");
	return [
		'tell application "System Events"',
		`\tif not (exists process "${a}") then return "error:no-process"`,
		`\tset p to process "${a}"`,
		"\ttry",
		"\t\trepeat with barIdx in {2, 1}",
		"\t\t\ttry",
		"\t\t\t\tset theBar to menu bar (contents of barIdx) of p",
		"\t\t\t\trepeat with theItem in (menu bar items of theBar)",
		"\t\t\t\t\ttry",
		"\t\t\t\t\t\tclick theItem",
		"\t\t\t\t\t\tdelay 0.3",
		"\t\t\t\t\t\tset theMenu to menu 1 of theItem",
		"\t\t\t\t\t\trepeat with mi in (menu items of theMenu)",
		"\t\t\t\t\t\t\ttry",
		`\t\t\t\t\t\t\t\tif (name of mi) is "${t}" then`,
		"\t\t\t\t\t\t\t\t\tclick mi",
		'\t\t\t\t\t\t\t\t\treturn "ok"',
		"\t\t\t\t\t\t\t\tend if",
		"\t\t\t\t\t\t\tend try",
		"\t\t\t\t\t\tend repeat",
		"\t\t\t\t\t\tkey code 53",
		"\t\t\t\t\t\tdelay 0.1",
		"\t\t\t\t\tend try",
		"\t\t\t\tend repeat",
		"\t\t\tend try",
		"\t\tend repeat",
		'\t\treturn "error:no-menu-item"',
		"\ton error errMsg",
		'\t\treturn "error:" & errMsg',
		"\tend try",
		"end tell",
	].join("\n");
}

// Decision after `open -a`: windowCount is a number, or "noprocess" / NaN when unknown.
//  - a window exists: bring it to front and stop
//  - none, and a menu title is set: click it from the menu bar
//  - none and no title: nothing more to do
export function decideOpen(windowCount, menuTitle) {
	const n = Number(windowCount);
	if (Number.isFinite(n) && n > 0) return { action: "activate" };
	if (menuTitle) return { action: "menu" };
	return { action: "none" };
}

// Turn an osascript failure into a short reason for the key's alert.
export function explainOsaError(text) {
	const t = String(text ?? "");
	if (/-25211|-1719|assistive|not allowed|-1743|not authori/i.test(t)) return "Accessibility not allowed";
	return "AppleScript failed";
}

// Turn the menu click script's answer into { ok, reason }.
export function interpretMenuResult(out) {
	const t = String(out ?? "").trim();
	if (t === "ok") return { ok: true };
	if (t === "error:no-process") return { ok: false, reason: "App is not running" };
	if (t === "error:no-menu-item") return { ok: false, reason: "No window and no menu item found" };
	return { ok: false, reason: explainOsaError(t) };
}
