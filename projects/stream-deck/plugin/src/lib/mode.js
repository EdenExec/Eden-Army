// Which layout the deck should show, and how to get there. Pure functions: no Stream Deck, no files, no clock.
//
//   eden  = Kev's normal profile (he builds it; the plugin never replaces it)
//   rest  = the Sabbath layout: Cross, Barny's Workshop, Music, Gemini, and the clock / REST / volume strip
//   cross = the screen saver / locked / display-off layout: the Cross, top right, nothing else
//
// Cross wins over everything (a locked Mac on the Sabbath still shows only the Cross), then rest, then eden.

import { sabbathLayoutWindow, DEFAULT_SUNDAY_CUTOFF } from "./sabbath.js";

// Names exactly as in manifest.json "Profiles" (the .streamDeckProfile files in the plugin folder, extension left off).
export const PROFILE_NAMES = { rest: "Eden Rest", cross: "Eden Cross" };

// What the Mac helper writes to ~/.edendeck/screen.json: { "state": "cross" | "awake", "at": "<ISO time>" }.
// Anything unreadable counts as awake, so a broken file can never trap the deck on the Cross.
export function parseScreenState(text) {
	try {
		const o = JSON.parse(String(text ?? ""));
		return o && o.state === "cross" ? "cross" : "awake";
	} catch {
		return "awake";
	}
}

export function desiredMode({ now, place, cutoff = DEFAULT_SUNDAY_CUTOFF, screen = "awake" }) {
	if (screen === "cross") return "cross";
	const w = sabbathLayoutWindow(now, place, cutoff);
	return w?.active ? "rest" : "eden";
}

// Steps to go from one mode to another. { back: true } means "previous profile" (Kev's own Eden, because the
// plugin only ever leaves Eden for a bundled profile); { profile } switches to a bundled profile.
// Going rest <-> cross passes through Eden first so "previous" is always the real home profile.
export function planSwitch(from, to) {
	if (from === to) return [];
	if (to === "eden") return [{ back: true }];
	if (from === "eden") return [{ profile: PROFILE_NAMES[to] }];
	return [{ back: true }, { profile: PROFILE_NAMES[to] }];
}

// On the Sabbath the deck can fall back to Eden when Kev leaves Music (whose own smart profile is on) for Gemini or Barny's.
// If the front app changed and it is not one that owns a smart profile, put the Rest layout back.
export const SMART_PROFILE_APPS = ["music", "zoom.us", "google calendar"];
export function shouldReassertRest({ mode, previousApp, frontApp }) {
	if (mode !== "rest") return false;
	if (!frontApp || frontApp === previousApp) return false;
	return !SMART_PROFILE_APPS.includes(String(frontApp).trim().toLowerCase());
}
