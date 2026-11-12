// Everything a designer may want to change lives in this file:
// colours, font, sizes, words and the timing rules. strip.js and keys.js only read from here.

export const COLORS = {
	panel: "#0C0B08", // behind everything
	key: "#14130E", // dark key / dark strip panel
	cream: "#F2EEE4", // "now"
	ink: "#14130E", // text on cream
	grey: "#A39D8D", // quiet text on dark
	greyOnCream: "#5B564A", // quiet text on cream
	brass: "#D9B45E", // ONLY for "something is waiting for you"
	divider: "#2A271E",
	// Sabbath (rest) tones, dimmer than normal
	restText: "#8C8576",
	restLabel: "#6B655A",
	restFaint: "#3A362B",
	// Off / faded text
	off: "#3A362B",
};

export const FONT = "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Strip is one 800 x 100 drawing; each dial shows its own 200 x 100 slice of it.
export const STRIP = { width: 800, height: 100, sliceWidth: 200, slices: 4 };

// Words. Change a caption here and it changes everywhere.
export const LABELS = {
	dials: ["DAY", "DESKTOP", "FOCUS", "VOLUME"],
	next: "NEXT",
	inCall: "IN CALL ENDS",
	rest: "REST",
	restTitle: "Until sundown Saturday",
	sabbathSoon: "SABBATH",
	sabbathSoonTitle: "Rest begins at",
	noMeeting: "NEXT",
	noMeetingTitle: "No more meetings today",
	desktopHint: "TURN",
	focusIdle: "PRESS TO START",
	focusRunning: "PRESS TO STOP",
	focusDone: "DONE",
	muted: "MUTED",
	min: "min",
	join: "JOIN",
};

// Text sizes in px on the 800 x 100 canvas.
export const SIZES = {
	small: 12,
	title: 24,
	big: 30,
	unit: 14,
	caption: 11,
	margin: 18,
	titleMaxChars: 22,
	restTitle: 18,
};

// Timing rules, in minutes.
export const RULES = {
	creamBeforeMin: 15, // strip turns cream this long before a meeting
	creamAfterMin: 5, // and stays cream this long after it starts
	joinKeyAfterMin: 15, // Join key stays cream this long after start
	joinDimBeyondMin: 30, // Join key is plain "JOIN" if nothing starts within this
	progressLookaheadMin: 120, // the thin line fills over this many minutes before start
	maxMeetingHours: 6, // events this long or longer are ignored
	pollMinutes: 2, // calendar refresh
	focusStepMin: 5,
	focusMinMin: 5,
	focusMaxMin: 120,
	focusDefaultMin: 25,
	volumeStep: 4,
};
