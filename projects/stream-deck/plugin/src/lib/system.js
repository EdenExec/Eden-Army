// The only file that talks to macOS. Everything uses execFile (no shell), so nothing a user types
// can become a command.
import { execFile } from "node:child_process";
import { homedir } from "node:os";
import { existsSync } from "node:fs";
import { KEY_CODES, pressKeyCode, controlNumber, volumeScript, parseVolume, windowCountScript, activateScript, menuClickScript, appPathCandidates, decideOpen, explainOsaError, interpretMenuResult } from "./keys.js";

function run(cmd, args) {
	return new Promise((resolve, reject) => {
		execFile(cmd, args, { timeout: 10000 }, (err, stdout) => (err ? reject(err) : resolve(String(stdout))));
	});
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const osa = (script) => run("osascript", ["-e", script]);

export const sys = {
	openUrl: (url) => run("open", [url]),
	// By name first; if the system cannot find it (some web apps), try /Applications and ~/Applications by path.
	openApp: async (name) => {
		try {
			return await run("open", ["-a", name]);
		} catch (err) {
			const path = appPathCandidates(name, homedir()).find((p) => existsSync(p));
			if (!path) throw err;
			return run("open", [path]);
		}
	},
	// The name of the frontmost app, with no permission needed (lsappinfo). Empty if unknown.
	frontApp: async () => {
		const asn = (await run("lsappinfo", ["front"])).trim();
		if (!asn) return "";
		const out = await run("lsappinfo", ["info", "-only", "name", asn]);
		return /"LSDisplayName"="([^"]*)"/.exec(out)?.[1] ?? "";
	},
	// Open the app, then make sure its real window is up. Returns { ok, reason? }.
	openAppWindow: async (name, menuTitle = "") => {
		await sys.openApp(name);
		try {
			await sleep(300);
			let count = "noprocess";
			// right after a launch the process can take a moment to appear
			for (let i = 0; i < 6 && count === "noprocess"; i++) {
				count = (await osa(windowCountScript(name))).trim();
				if (count === "noprocess") await sleep(500);
			}
			const step = decideOpen(count, menuTitle);
			if (step.action === "activate") {
				await osa(activateScript(name));
				return { ok: true };
			}
			if (step.action === "menu") return interpretMenuResult(await osa(menuClickScript(name, menuTitle)));
			return { ok: true };
		} catch (err) {
			return { ok: false, reason: explainOsaError(`${err?.stderr ?? ""} ${err?.message ?? ""}`) };
		}
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
