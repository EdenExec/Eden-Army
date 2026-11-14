# Bible maps: finds, events and Scripture, linked

Kev, 24 October 2026: "start building your knowledge base... start building the maps following his lead." The lead is John's: a map where physical finds point to the Bible's timeline, then the Old Testament linked to the New. Barnabas keeps the map data as a seed and publishes it as one page, **Biblical Timeline** (Kev renamed it 26 October 2026; the file keeps its old name).

## Where things live

| Piece | Path |
|---|---|
| Events spine (Genesis 1 to Revelation 22) | `memory/seed/bible-maps/events.json` |
| Finds, each with graded links to events | `memory/seed/bible-maps/finds.json` (also `leftOff`: forgeries and claims kept off the map on purpose) |
| Old Testament to New Testament links | `memory/seed/bible-maps/scripture.json` |
| The page | `maps/stones-and-scripture.html`, published with the three JSON files as `data/*.json` |

The page reads the JSON, so adding a row to a seed and republishing is the whole job. Nothing here is private; it can be shared (sharing it beyond Kev is his call).

## In the workshop (Kev, 14 November 2026)

Barny's Workshop has a **Biblical Timeline** room (left menu) built from the same seeds, published with the workshop under `data/` (events, finds, scripture, genealogy). It has folding sections for the timeline with finds, the Old Testament in the New, and the genealogy (`memory/seed/bible-maps/genealogy.json`, Adam to Jesus). When a seed changes, republish both the map and the workshop with the four `data/` files.

## The honesty rule (John's, and ours)

Archaeology confirms real places, rulers and events. It cannot prove the faith, and it cannot test creation, the visions or the resurrection. The resurrection rests on eyewitness testimony (1 Corinthians 15:3-8) and is stated plainly as a first-order truth. Never stretch a find to fit.

## Link types and grades

- Finds map: `names` (names a person the Bible names), `confirms` (an event, custom or detail), `setting` (the place or world was real), `parallel` (a parallel story, not confirmation).
- Scripture map: `quote`, `fulfillment` (the New Testament says so), `echo` (allusion or type).
- Every finds link carries `grade`: CONSENSUS or DISPUTED. DISPUTED draws gray and dashed whatever its type. When a link is disputed, the note says who holds which view.

## Adding a find

1. Check it in a reputable source this session: a museum catalogue page, Mykytiuk's lists of biblical people in inscriptions, Hoffmeier, Kitchen, or a peer-reviewed excavation report. Record its date, where it was found and where it is now.
2. Prefer finds from controlled excavations. Market purchases with no findspot (provenance) are DISPUTED at best. Known forgeries go in `leftOff`.
3. Add the row with `year` (negative for BC) so it sorts, a two-sentence summary in plain words, and one link per claim.
4. Run the integrity check (below), take one look at the page, republish.

## Adding a Scripture link

Give the reference and a one-line gist in your own words; never paste long ESV text. A New Testament node can draw on several Old Testament passages. Assign the Old Testament passage the era of its traditional setting and note where scholars date it differently (Isaiah 40-66, Joel, Daniel).

## Integrity check

```bash
node -e 'const e=require("./events.json"),f=require("./finds.json"),s=require("./scripture.json");const ev=new Set(e.events.map(x=>x.id));const bad=[];f.finds.forEach(x=>x.links.forEach(l=>ev.has(l.to)||bad.push(x.id)));const o=new Set(s.ot.map(x=>x.id)),n=new Set(s.nt.map(x=>x.id));s.links.forEach(l=>(o.has(l.from)&&n.has(l.to))||bad.push(l.from+">"+l.to));console.log(bad.length?bad:"ok")'
```

Run it from `memory/seed/bible-maps/`.

## Next layers (offer, one at a time)

- New Testament internal links (Paul drawing on the Gospels' teaching, Peter on Paul).
- Tie a find to a specific verse, not just an event (the Pilate Stone to John 19:13).
- A Romans layer for Kev's reading: each chapter's Old Testament sources, ready for the Sunday Edition deep dive.
