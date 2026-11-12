import { SingletonAction } from "@elgato/streamdeck";
import { hub } from "../hub.js";
import { keyFace, svgDataUri } from "../lib/keyface.js";
import { safeWebUrl, safeAppName } from "../lib/keys.js";
import { sys } from "../lib/system.js";

const UUID = "com.kdtw.edendeck";
const quiet = (p) => p.catch(() => {});

// JOIN: dim until a meeting with a link is near; cream with the start time at 15 minutes; press opens the link.
export class JoinKey extends SingletonAction {
	manifestId = `${UUID}.join`;
	onWillAppear(ev) {
		hub.registerJoinKey(ev.action);
	}
	onWillDisappear(ev) {
		hub.unregisterJoinKey(ev.action.id);
	}
	async onKeyDown(ev) {
		const link = hub.view().join.link; // null on the Sabbath, with no link, or when nothing is near
		const url = safeWebUrl(link ?? "");
		if (!url) return ev.action.showAlert();
		await quiet(sys.openUrl(url));
	}
}

// Draws a key from its settings, so a label change shows at once.
class FaceKey extends SingletonAction {
	face(settings) {
		return keyFace({});
	}
	async paint(action, settings) {
		await quiet(action.setImage(svgDataUri(this.face(settings ?? {}))));
	}
	onWillAppear(ev) {
		return this.paint(ev.action, ev.payload.settings);
	}
	onDidReceiveSettings(ev) {
		return this.paint(ev.action, ev.payload.settings);
	}
}

// OPEN LINK: opens a web address in the default browser (Radar chat, Command Center page).
export class OpenLinkKey extends FaceKey {
	manifestId = `${UUID}.openlink`;
	face(s) {
		return keyFace({ label: s.label || "Link" });
	}
	async onKeyDown(ev) {
		const url = safeWebUrl(ev.payload.settings.url ?? "");
		if (!url) return ev.action.showAlert();
		await quiet(sys.openUrl(url));
	}
}

// OPEN APP: opens a Mac app by name (for example Wispr Flow).
export class OpenAppKey extends FaceKey {
	manifestId = `${UUID}.openapp`;
	face(s) {
		return keyFace({ label: s.label || safeAppName(s.app ?? "") || "App" });
	}
	async onKeyDown(ev) {
		const name = safeAppName(ev.payload.settings.app ?? "");
		if (!name) return ev.action.showAlert();
		try {
			await (ev.payload.settings.showWindow ? sys.openAppWindow(name) : sys.openApp(name));
		} catch {
			await ev.action.showAlert();
		}
	}
}

// DESKTOP: Control+number, or open an app instead (full-screen and split-screen spaces have no shortcut).
export class DesktopKey extends FaceKey {
	manifestId = `${UUID}.desktop-key`;
	face(s) {
		const n = Math.round(Number(s.number));
		return keyFace({ big: n >= 1 && n <= 9 ? String(n) : "", label: s.label || "" });
	}
	async onKeyDown(ev) {
		const s = ev.payload.settings;
		if (s.mode === "app") {
			const name = safeAppName(s.app ?? "");
			if (!name) return ev.action.showAlert();
			return sys.openApp(name).catch(() => ev.action.showAlert());
		}
		const n = Math.round(Number(s.number));
		if (!(n >= 1 && n <= 9)) return ev.action.showAlert();
		// Was silent before: Control+number through System Events needs Accessibility permission and fails without a word.
		// Now the key shows the alert triangle. For a reliable desktop key use Stream Deck's own System > Hotkey instead.
		await sys.controlNumber(n).catch(() => ev.action.showAlert());
	}
}
