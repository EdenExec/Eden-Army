// EdenWake: a tiny stay-open helper for Kev's Mac.   (Q, 15 Nov 2026)
//
// It watches the screen saver, the lock screen and display sleep. While any of them is on it writes
//     ~/.edendeck/screen.json   {"state":"cross","at":"..."}
// and when all of them are off it writes {"state":"awake",...} and plays the Mando chime once.
// The Eden Deck plugin watches that file and switches the Stream Deck + (Cross layout / back to Eden).
// This program opens no pages, apps or windows. It never reads the screen or any keystroke.
//
// Build (once, needs Xcode Command Line Tools):
//     mkdir -p ~/.edendeck/bin && swiftc -O -o ~/.edendeck/bin/EdenWake EdenWake.swift
// Test without locking the Mac:
//     ~/.edendeck/bin/EdenWake cross      (deck shows the Cross)
//     ~/.edendeck/bin/EdenWake awake      (deck returns, chime plays; add --no-chime to skip it)
// Run by hand (normally the LaunchAgent does this):
//     ~/.edendeck/bin/EdenWake
//
// Chime: ~/Music/Stream Deck/start-mando.mp3, or the path in the EDENDECK_CHIME environment variable.

import AppKit
import Foundation

let stateDir = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".edendeck")
let stateFile = stateDir.appendingPathComponent("screen.json")
let chimePath: String = ProcessInfo.processInfo.environment["EDENDECK_CHIME"]
    ?? FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Music/Stream Deck/start-mando.mp3").path

func note(_ message: String) {
    FileHandle.standardError.write(Data("EdenWake: \(message)\n".utf8))
}

// state is "cross" or "awake". Written atomically so the plugin never reads half a file.
func writeState(_ state: String) {
    do {
        try FileManager.default.createDirectory(at: stateDir, withIntermediateDirectories: true)
        let stamp = ISO8601DateFormatter().string(from: Date())
        let json = "{\"state\":\"\(state)\",\"at\":\"\(stamp)\"}\n"
        try json.write(to: stateFile, atomically: true, encoding: .utf8)
        note("state \(state)")
    } catch {
        note("could not write state file: \(error.localizedDescription)")
    }
}

func playChime() {
    guard FileManager.default.fileExists(atPath: chimePath) else {
        note("chime file not found")
        return
    }
    let p = Process()
    p.executableURL = URL(fileURLWithPath: "/usr/bin/afplay")
    p.arguments = [chimePath]
    do { try p.run() } catch { note("afplay failed: \(error.localizedDescription)") }
}

final class Watcher {
    var saver = false
    var locked = false
    var displayAsleep = false
    var published = ""            // what the state file says right now: "cross" or "awake"
    var pending: DispatchWorkItem?

    func start() {
        // Is the screen already locked (helper started late)?
        if let session = CGSessionCopyCurrentDictionary() as? [String: Any],
           let isLocked = session["CGSSessionScreenIsLocked"] as? Bool {
            locked = isLocked
        }

        let distributed = DistributedNotificationCenter.default()
        func watch(_ name: String, _ change: @escaping (Watcher) -> Void) {
            distributed.addObserver(forName: NSNotification.Name(name), object: nil, queue: .main) { [weak self] _ in
                guard let self = self else { return }
                change(self)
                self.changed()
            }
        }
        watch("com.apple.screensaver.didstart") { $0.saver = true }
        watch("com.apple.screensaver.didstop") { $0.saver = false }
        watch("com.apple.screenIsLocked") { $0.locked = true }
        watch("com.apple.screenIsUnlocked") { $0.locked = false }

        // Display sleep and wake (and system sleep, in case the Mac sleeps anyway).
        let workspace = NSWorkspace.shared.notificationCenter
        func watchWorkspace(_ name: NSNotification.Name, asleep: Bool) {
            workspace.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                self?.displayAsleep = asleep
                self?.changed()
            }
        }
        watchWorkspace(NSWorkspace.screensDidSleepNotification, asleep: true)
        watchWorkspace(NSWorkspace.screensDidWakeNotification, asleep: false)
        watchWorkspace(NSWorkspace.willSleepNotification, asleep: true)
        watchWorkspace(NSWorkspace.didWakeNotification, asleep: false)

        evaluate()
    }

    // Several notifications arrive together on a wake (saver stops, screen unlocks, display wakes).
    // Wait half a second so we decide once, and chime once.
    func changed() {
        pending?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.evaluate() }
        pending = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: work)
    }

    func evaluate() {
        let state = (saver || locked || displayAsleep) ? "cross" : "awake"
        if state == published { return }
        let wasCross = (published == "cross")
        published = state
        writeState(state)
        if state == "awake" && wasCross { playChime() }
    }
}

// ---- command line: `EdenWake cross` / `EdenWake awake [--no-chime]` write once and exit (for testing) ----
let args = Array(CommandLine.arguments.dropFirst())
if let first = args.first, first == "cross" || first == "awake" {
    writeState(first)
    if first == "awake" && !args.contains("--no-chime") { playChime(); Thread.sleep(forTimeInterval: 1.0) }
    exit(0)
}

// ---- normal run: stay open ----
let watcher = Watcher()
watcher.start()

// If we are stopped while the deck shows the Cross, put the deck back.
signal(SIGTERM, SIG_IGN)
signal(SIGINT, SIG_IGN)
var signalSources: [DispatchSourceSignal] = []
for sig in [SIGTERM, SIGINT] {
    let source = DispatchSource.makeSignalSource(signal: sig, queue: .main)
    source.setEventHandler {
        writeState("awake")
        exit(0)
    }
    source.resume()
    signalSources.append(source)
}

RunLoop.main.run()
