// Builds the two bundled Stream Deck + profiles into the plugin folder:
//   Eden Rest.streamDeckProfile   the Sabbath layout: Barny's Workshop, Music, Gemini, Cross (top right), four dials
//   Eden Cross.streamDeckProfile  the screen saver / locked layout: the Cross, top right, nothing else
// Run: node scripts/make-profiles.mjs
//
// HONEST NOTE: this file format is Elgato's own and is not documented. It was written from the known shape of
// exported profiles and has NOT been opened in the Stream Deck app (no Mac here). If Stream Deck refuses it or the
// layout looks wrong, use the fallback in setup.md: build the two profiles by hand, export them, and drop the
// exports over these two files.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const OUT = (n) => fileURLToPath(new URL(`../com.kdtw.edendeck.sdPlugin/${n}`, import.meta.url));
const PLUGIN = { Name: "Eden Deck", UUID: "com.kdtw.edendeck", Version: "0.2.0.0" };
const BARNYS = "https://claude.ai/artifact/BBgMLsVw8x9CtVy5XViBK6";

const uuid = (seed) => {
	const h = createHash("md5").update(seed).digest("hex").toUpperCase();
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};

const action = (profile, slot, name, actionUuid, settings = {}) => ({
	ActionID: uuid(`${profile}/${slot}`),
	LinkedTitle: true,
	Name: name,
	Plugin: PLUGIN,
	Resources: null,
	Settings: settings,
	State: 0,
	States: [{ ShowTitle: false, Title: "" }],
	UUID: actionUuid,
});

const U = "com.kdtw.edendeck";
function profile(name, keys, dials) {
	const key = {};
	for (const [slot, [n, id, s]] of Object.entries(keys)) key[slot] = action(name, slot, n, `${U}.${id}`, s);
	const enc = {};
	for (const [slot, [n, id, s]] of Object.entries(dials)) enc[slot] = action(name, `e${slot}`, n, `${U}.${id}`, s);
	return {
		Controllers: [
			{ Actions: key, Type: "Keypad" },
			{ Actions: enc, Type: "Encoder" },
		],
		Icon: "",
		Name: name,
		Version: "3.0",
	};
}

const REST = profile(
	"Eden Rest",
	{
		"0,0": ["Open link", "openlink", { url: BARNYS, label: "Barny's", glyph: "workshop" }],
		"1,0": ["Open app", "openapp", { app: "Music", glyph: "music" }],
		"2,0": ["Open app", "openapp", { app: "Gemini", glyph: "gemini" }],
		"3,0": ["Cross", "cross", {}],
	},
	{ "0,0": ["Day", "day", {}], "1,0": ["Desktop", "desktop", {}], "2,0": ["Focus", "focus", {}], "3,0": ["Volume", "volume", {}] },
);
const CROSS = profile("Eden Cross", { "3,0": ["Cross", "cross", {}] }, {});

// ---- a minimal zip writer (stored, no compression needed for tiny JSON; deflate used anyway) ----
const CRC = (() => {
	const t = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[n] = c >>> 0;
	}
	return (buf) => {
		let c = 0xffffffff;
		for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
		return (c ^ 0xffffffff) >>> 0;
	};
})();

function zip(files) {
	const parts = [];
	const central = [];
	let offset = 0;
	for (const [name, text] of files) {
		const nameBuf = Buffer.from(name);
		const data = Buffer.from(text);
		const comp = deflateRawSync(data);
		const crc = CRC(data);
		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(0x0800, 6); // utf-8 names
		local.writeUInt16LE(8, 8);
		local.writeUInt32LE(0x58210000, 10); // fixed date/time so builds are reproducible
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(comp.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(nameBuf.length, 26);
		parts.push(local, nameBuf, comp);
		const c = Buffer.alloc(46);
		c.writeUInt32LE(0x02014b50, 0);
		c.writeUInt16LE(20, 4);
		c.writeUInt16LE(20, 6);
		c.writeUInt16LE(0x0800, 8);
		c.writeUInt16LE(8, 10);
		c.writeUInt32LE(0x58210000, 12);
		c.writeUInt32LE(crc, 16);
		c.writeUInt32LE(comp.length, 20);
		c.writeUInt32LE(data.length, 24);
		c.writeUInt16LE(nameBuf.length, 28);
		c.writeUInt32LE(offset, 42);
		central.push(c, nameBuf);
		offset += 30 + nameBuf.length + comp.length;
	}
	const cd = Buffer.concat(central);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(files.length, 8);
	end.writeUInt16LE(files.length, 10);
	end.writeUInt32LE(cd.length, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...parts, cd, end]);
}

function build(file, manifest) {
	const dir = `Profiles/${uuid(manifest.Name)}.sdProfile`;
	const pkg = { AppVersion: "7.1.0.0", DeviceModel: "20GBD9901", DeviceSettings: null, FormatVersion: 1, OSType: "macOS", OSVersion: "13.0.0", RequiredPlugins: [PLUGIN.UUID] };
	writeFileSync(OUT(file), zip([["package.json", JSON.stringify(pkg)], [`${dir}/manifest.json`, JSON.stringify(manifest)]]));
	console.log(`wrote ${file}`);
}

build("Eden Rest.streamDeckProfile", REST);
build("Eden Cross.streamDeckProfile", CROSS);
