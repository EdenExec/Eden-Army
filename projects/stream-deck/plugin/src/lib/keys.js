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

// AppleScript that asks a running app to show its window again (the same as clicking its Dock icon).
// This is what makes a menu-bar app such as Wispr Flow open its window. The name is checked by safeAppName first.
export function reopenApp(name) {
	const safe = safeAppName(name);
	if (!safe) throw new Error("Bad app name");
	return `tell application "${safe}" to reopen\ntell application "${safe}" to activate`;
}
