// Turn a number of milliseconds into the short text shown on the strip.
// 5400000 -> "1 h 30", 720000 -> "12 min", 30000 -> "< 1 min".
export function formatCountdown(ms) {
	if (!Number.isFinite(ms) || ms <= 0) return "now";
	const totalMin = Math.ceil(ms / 60000);
	if (totalMin < 1) return "< 1 min";
	if (totalMin < 60) return `${totalMin} min`;
	const hours = Math.floor(totalMin / 60);
	const mins = totalMin % 60;
	if (hours >= 36) return `${Math.round(totalMin / 1440)} d`;
	return mins === 0 ? `${hours} h` : `${hours} h ${String(mins).padStart(2, "0")}`;
}

// Timer face: 1500 seconds -> "25:00".
export function formatClock(totalSeconds) {
	const s = Math.max(0, Math.ceil(totalSeconds));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
