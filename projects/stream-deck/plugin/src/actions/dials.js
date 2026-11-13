import { SingletonAction } from "@elgato/streamdeck";
import { hub } from "../hub.js";
import { RULES } from "../theme.js";
import { sys } from "../lib/system.js";

const UUID = "com.kdtw.edendeck";
const quiet = (p) => p.catch(() => {});

// Shared by the four dial actions: draw this dial's slice of the strip, refresh on touch.
class StripDial extends SingletonAction {
	onWillAppear(ev) {
		hub.registerDial(ev.action);
	}
	onWillDisappear(ev) {
		hub.unregisterDial(ev.action.id);
	}
	onTouchTap() {
		hub.refreshCalendar();
	}
	// Sabbath: only VOLUME works.
	get resting() {
		return hub.view().rest;
	}
	rotate() {}
	press() {}
	onDialRotate(ev) {
		if (this.resting && !this.worksOnSabbath) return;
		this.rotate(Math.max(-5, Math.min(5, ev.payload.ticks)), ev);
	}
	onDialDown(ev) {
		if (this.resting && !this.worksOnSabbath) return;
		this.press(ev);
	}
}

// DAY: turn = Left/Right Arrow to the frontmost app (steps the Day Board a day). Press only flashes.
export class DayDial extends StripDial {
	manifestId = `${UUID}.day`;
	rotate(ticks) {
		for (let i = 0; i < Math.abs(ticks); i++) quiet(sys.arrow(ticks > 0 ? "right" : "left"));
	}
	press(ev) {
		hub.flash(ev.action.id);
	}
}

// DESKTOP: turn = Control+Left/Right (switch space). Press = Mission Control.
export class DesktopDial extends StripDial {
	manifestId = `${UUID}.desktop`;
	rotate(ticks) {
		for (let i = 0; i < Math.abs(ticks); i++) quiet(sys.controlArrow(ticks > 0 ? "right" : "left"));
	}
	press() {
		quiet(sys.missionControl());
	}
}

// FOCUS: turn = minutes in steps of 5 (5 to 120). Press = start or stop.
export class FocusDial extends StripDial {
	manifestId = `${UUID}.focus`;
	rotate(ticks) {
		hub.timer.turn(ticks);
		hub.render();
	}
	press() {
		hub.timer.toggle(Date.now());
		hub.render();
	}
}

// VOLUME: turn = system volume in steps of 4. Press = mute or unmute. Works on the Sabbath.
export class VolumeDial extends StripDial {
	manifestId = `${UUID}.volume`;
	worksOnSabbath = true;
	async rotate(ticks) {
		const level = Math.max(0, Math.min(100, hub.volume.level + ticks * RULES.volumeStep));
		hub.volume = { ...hub.volume, level };
		hub.render();
		await quiet(sys.setVolume(level));
	}
	async press() {
		const muted = !hub.volume.muted;
		hub.volume = { ...hub.volume, muted };
		hub.render();
		await quiet(sys.setMuted(muted));
	}
}
