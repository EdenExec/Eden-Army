// The only file that talks to macOS. Everything uses execFile (no shell), so nothing a user types
// can become a command.
import { execFile } from "node:child_process";
import { KEY_CODES, pressKeyCode, controlNumber, volumeScript, parseVolume, reopenApp } from "./keys.js";

function run(cmd, args) {
	return new Promise((resolve, reject) => {
		execFile(cmd, args, { timeout: 10000 }, (err, stdout) => (err ? reject(err) : resolve(String(stdout))));
	});
}

const osa = (script) => run("osascript", ["-e", script]);

export const sys = {
	openUrl: (url) => run("open", [url]),
	openApp: (name) => run("open", ["-a", name]),
	// Open, then ask the app to show its window. Needed for menu-bar apps that are already running.
	openAppWindow: async (name) => {
		await run("open", ["-a", name]);
		await osa(reopenApp(name));
	},
	missionControl: () => run("open", ["-a", "Mission Control"]),
	arrow: (dir) => osa(pressKeyCode(KEY_CODES[dir])),
	controlArrow: (dir) => osa(pressKeyCode(KEY_CODES[dir], ["control"])),
	controlNumber: (n) => osa(controlNumber(n)),
	readVolume: async () => parseVolume(await osa(volumeScript.read)),
	setVolume: (level) => osa(volumeScript.set(level)),
	setMuted: (muted) => osa(volumeScript.setMuted(muted)),
	playGlass: () => run("afplay", ["/System/Library/Sounds/Glass.aiff"]),
};
