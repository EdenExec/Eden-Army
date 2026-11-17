-- "Mando Morning" applet. Save from Script Editor as an Application, check "Stay open after run handler".
-- While it is the frontmost app, Stream Deck's Smart Profile shows the Mando profile (one key, top right).
-- Clicking Start opens the browser, the browser becomes frontmost, and the deck returns to the normal profile.
on run
	activate
end run
on idle
	return 300
end idle
