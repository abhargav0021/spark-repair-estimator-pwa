/* Console tests for the Spark data layer. Run: node test-data.js */
const fs = require("fs");
const path = require("path");
const { ITEMS, ITEM_BY_ID, GROUPS, ROOM_TYPES, fmtMoney, newProject, calc } = require("./data.js");

let passed = 0, failed = 0;
function assert(cond, label) {
  if (cond) { passed++; console.log("  ok  " + label); }
  else { failed++; console.error("FAIL  " + label); }
}
function eq(actual, expected, label) {
  const ok = actual === expected;
  assert(ok, label + (ok ? "" : `  (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`));
}

// ---- 1. ITEMS matches Pricing List.csv verbatim -------------------------
console.log("\n[1] ITEMS vs CSV");
function parseCsvLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
const csvRows = fs.readFileSync(path.join(__dirname, "Pricing List.csv"), "utf8")
  .split("\n").map(l => l.trim()).filter(Boolean).slice(1)
  .map(parseCsvLine)
  .map(([id, name, cost, unit]) => ({ id, name, cost: parseFloat(cost), unit }));

eq(csvRows.length, 108, "CSV has 108 rows");
eq(ITEMS.length, 108, "ITEMS has 108 rows");
let mismatches = 0;
for (let i = 0; i < csvRows.length; i++) {
  const c = csvRows[i], it = ITEMS[i];
  if (!it || it.id !== c.id || it.name !== c.name || it.cost !== c.cost || it.unit !== c.unit) {
    mismatches++;
    console.error("  row diff:", JSON.stringify(c), "vs", JSON.stringify(it));
  }
}
eq(mismatches, 0, "every ITEMS row matches CSV verbatim (id, name, cost, unit)");
eq(new Set(ITEMS.map(i => i.id)).size, 108, "all item ids unique");

// ---- 2. Group / room-type integrity --------------------------------------
console.log("\n[2] Groups & room types");
let badRefs = 0;
for (const [gid, g] of Object.entries(GROUPS))
  for (const iid of g.items) if (!ITEM_BY_ID[iid]) { badRefs++; console.error("  bad ref", gid, iid); }
eq(badRefs, 0, "every group item id exists in ITEMS");

const assigned = new Set(Object.values(GROUPS).flatMap(g => g.items));
const unassigned = ITEMS.filter(i => !assigned.has(i.id)).map(i => i.id);
eq(unassigned.length, 0, "every CSV item assigned to at least one group" + (unassigned.length ? ": missing " + unassigned : ""));

const defaultCounted = ["interior","kitchen","bathroom","systems","exterior"]
  .map(id => ROOM_TYPES.find(rt => rt.id === id))
  .flatMap(rt => rt.groups)
  .filter(gid => GROUPS[gid].counted !== false);
eq(defaultCounted.length, 19, "default project has exactly 19 counted groups");

// ---- 3. Fresh project: no money, no progress ------------------------------
console.log("\n[3] Fresh project");
const p = newProject("Test House");
let r = calc(p);
eq(r.grandTotal, 0, "grand total is 0");
eq(r.groupsTotal, 19, "groupsTotal is 19");
eq(r.groupsReviewed, 0, "0 groups reviewed");
eq(r.progressPct, 0, "progress 0%");
assert(r.rooms.every(rm => rm.groups.every(g => g.lines.every(ln => ln.total === null && ln.qty === null))),
  "Law 3: every unchecked line has total=null, qty=null (renders as dash)");

// helpers to mutate selections like the UI will
const roomByType = t => p.rooms.find(rm => rm.roomTypeId === t);
function check(room, groupId, itemId, qty) {
  const sel = (room.selections[groupId] ||= { noAction: false, items: {} });
  sel.items[itemId] = { checked: true, qty };
}

// ---- 4. Totals: line, group, room, grand all agree ------------------------
console.log("\n[4] Totals");
const bath = roomByType("bathroom");
const int_ = roomByType("interior");
check(bath, "g-ba-tubshower", "ba-13", 1);   // 1575.00
check(bath, "g-ba-tile", "ba-05", 40);       // 5.80 * 40 = 232.00
check(int_, "g-int-flooring", "ig-01", 850); // 2.35 * 850 = 1997.50
r = calc(p);

const cBath = r.rooms.find(rm => rm.roomInstanceId === bath.roomInstanceId);
const cInt  = r.rooms.find(rm => rm.roomInstanceId === int_.roomInstanceId);
const gTub  = cBath.groups.find(g => g.groupId === "g-ba-tubshower");
const gTile = cBath.groups.find(g => g.groupId === "g-ba-tile");
const gFloor = cInt.groups.find(g => g.groupId === "g-int-flooring");

eq(gTub.lines.find(l => l.itemId === "ba-13").total, 1575, "line: ba-13 x1 = 1575");
eq(gTile.lines.find(l => l.itemId === "ba-05").total, 232, "line: ba-05 x40 = 232");
eq(gFloor.lines.find(l => l.itemId === "ig-01").total, 1997.5, "line: ig-01 x850 = 1997.50");
eq(gTub.subtotal, 1575, "group subtotal (Tub & Shower)");
eq(gTile.subtotal, 232, "group subtotal (Tile)");
eq(cBath.subtotal, 1807, "room subtotal (Bathroom) = 1575 + 232");
eq(cInt.subtotal, 1997.5, "room subtotal (Interior)");
eq(r.grandTotal, 3804.5, "grand total = 3804.50");
eq(r.itemCount, 3, "3 items selected");

// group subtotals always sum to room subtotals sum to grand (Law 2 / Gate 8)
const sumGroups = r.rooms.flatMap(rm => rm.groups).reduce((s, g) => s + g.subtotal, 0);
const sumRooms  = r.rooms.reduce((s, rm) => s + rm.subtotal, 0);
eq(Math.round(sumGroups * 100), Math.round(r.grandTotal * 100), "sum(group subtotals) === grand total");
eq(Math.round(sumRooms * 100), Math.round(r.grandTotal * 100), "sum(room subtotals) === grand total");

// ---- 5. Progress & group states -------------------------------------------
console.log("\n[5] Progress & states");
eq(r.groupsReviewed, 3, "3/19 reviewed (checked item => reviewed)");
eq(gTub.status, "active", "group with checked items is 'active'");
eq(gFloor.status, "active", "interior flooring 'active'");
eq(cBath.groups.find(g => g.groupId === "g-ba-vanity").status, "untouched", "untouched group");

// No Action marks reviewed with zero money
const kit = roomByType("kitchen");
kit.selections["g-kt-cabinets"] = { noAction: true, items: {} };
r = calc(p);
const gCab = r.rooms.find(rm => rm.roomInstanceId === kit.roomInstanceId).groups.find(g => g.groupId === "g-kt-cabinets");
eq(gCab.status, "done", "No Action group is 'done'");
eq(gCab.subtotal, 0, "No Action group has $0");
eq(r.groupsReviewed, 4, "4/19 reviewed after No Action");
eq(r.noActionCount, 1, "noActionCount = 1");
eq(r.progressPct, 21, "progress 4/19 = 21%");

// Sitewide group carries money but never counts toward progress
check(int_, "g-int-sitewide", "ig-27", 1); // Final Cleaning 325
r = calc(p);
eq(r.grandTotal, 4129.5, "sitewide money included in grand total");
eq(r.groupsTotal, 19, "sitewide group not in groupsTotal");
eq(r.groupsReviewed, 4, "sitewide check does not change reviewed count");

// All 19 reviewed => 100% (Gate 6)
for (const rm of p.rooms) {
  const rt = ROOM_TYPES.find(t => t.id === rm.roomTypeId);
  for (const gid of rt.groups) {
    if (GROUPS[gid].counted === false) continue;
    if (!rm.selections[gid] || (!rm.selections[gid].noAction && !Object.values(rm.selections[gid].items || {}).some(s => s.checked)))
      rm.selections[gid] = { noAction: true, items: {} };
  }
}
r = calc(p);
eq(r.groupsReviewed, 19, "all 19 reviewed");
eq(r.progressPct, 100, "progress 100%");
eq(r.unreviewedCount, 0, "unreviewedCount 0");

// Adding a room grows the denominator
const p2 = newProject("Two Bath");
p2.rooms.push({ roomInstanceId: "bath2", roomTypeId: "bathroom", label: "Bathroom 2", selections: {} });
eq(calc(p2).groupsTotal, 22, "adding Bathroom 2 => 22 groups total");

// ---- 6. Price overrides: project ?? global ?? default ---------------------
console.log("\n[6] Overrides");
const p3 = newProject("Override");
const b3 = p3.rooms.find(rm => rm.roomTypeId === "bathroom");
b3.selections["g-ba-vanity"] = { noAction: false, items: { "ba-04": { checked: true, qty: 2 } } };
eq(calc(p3).grandTotal, 300, "default cost: toilet 150 x2 = 300");
eq(calc(p3, { "ba-04": 175 }).grandTotal, 350, "global override 175 x2 = 350");
p3.priceOverrides["ba-04"] = 200;
const rOv = calc(p3, { "ba-04": 175 });
eq(rOv.grandTotal, 400, "project override 200 beats global");
assert(rOv.rooms.find(rm => rm.roomInstanceId === b3.roomInstanceId)
  .groups.find(g => g.groupId === "g-ba-vanity")
  .lines.find(l => l.itemId === "ba-04").overridden === true, "overridden flag set");

// ---- 7. Custom items scoped to room:group ---------------------------------
console.log("\n[7] Custom items");
const p4 = newProject("Custom");
const k4 = p4.rooms.find(rm => rm.roomTypeId === "kitchen");
p4.customItems.push({ id: "cu-1", groupScope: k4.roomInstanceId + ":g-kt-appliances", name: "Pot Filler", cost: 240, unit: "ea." });
k4.selections["g-kt-appliances"] = { noAction: false, items: { "cu-1": { checked: true, qty: 1 } } };
const r4 = calc(p4);
eq(r4.grandTotal, 240, "custom item total 240");
const appl = r4.rooms.find(rm => rm.roomInstanceId === k4.roomInstanceId).groups.find(g => g.groupId === "g-kt-appliances");
assert(appl.lines.some(l => l.itemId === "cu-1" && l.custom), "custom line appears in its scoped group");
assert(!r4.rooms.some(rm => rm.roomInstanceId !== k4.roomInstanceId && rm.groups.some(g => g.lines.some(l => l.itemId === "cu-1"))),
  "custom item does not leak into other rooms");

// ---- 8. Float safety (cents math) -----------------------------------------
console.log("\n[8] Float safety");
const p5 = newProject("Floats");
const i5 = p5.rooms.find(rm => rm.roomTypeId === "interior");
i5.selections["g-int-sitewide"] = { noAction: false, items: { "ig-28": { checked: true, qty: 3 } } }; // 0.90 * 3
eq(calc(p5).grandTotal, 2.7, "0.90 x 3 = 2.70 exactly (no 2.7000000000000004)");

// ---- 9. fmtMoney ----------------------------------------------------------
console.log("\n[9] fmtMoney");
eq(fmtMoney(2.35), "$2.35", "< $100 shows cents");
eq(fmtMoney(99.99), "$99.99", "$99.99 keeps cents");
eq(fmtMoney(100), "$100", ">= $100 whole dollars");
eq(fmtMoney(1425), "$1,425", "thousands comma");
eq(fmtMoney(8362.5), "$8,363", ">= $100 rounds to whole");
eq(fmtMoney(0.9), "$0.90", "sub-dollar shows cents");

// ---- summary ---------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
