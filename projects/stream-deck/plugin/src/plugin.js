import streamDeck from "@elgato/streamdeck";
import { hub } from "./hub.js";
import { DayDial, DesktopDial, FocusDial, VolumeDial } from "./actions/dials.js";
import { JoinKey, OpenLinkKey, OpenAppKey, DesktopKey } from "./actions/keys.js";

for (const A of [DayDial, DesktopDial, FocusDial, VolumeDial, JoinKey, OpenLinkKey, OpenAppKey, DesktopKey]) {
	streamDeck.actions.registerAction(new A());
}

// The property inspector's "Check now" button.
streamDeck.ui.onSendToPlugin((ev) => {
	if (ev.payload?.event === "refresh") hub.refreshCalendar();
	if (ev.payload?.event === "status") hub.pushStatus();
});

hub.start();
streamDeck.connect();
