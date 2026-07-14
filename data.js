/* =========================================================================
   Spark — data layer
   ITEMS is loaded verbatim from Pricing List.csv — never invent or adjust
   a price. calc() is the single arithmetic authority (UI Law 2): every
   number shown anywhere in the app must come from its output.
   This file is inlined into index.html for the final build; the module
   guard at the bottom exists only so test-data.js can run under Node.
   ========================================================================= */

// ---- Pricing_List.csv, verbatim: { id, name, cost, unit } ---------------
const ITEMS = [
  { id: "ig-01", name: "Refinish Hardwood Floor", cost: 2.35, unit: "sqft" },
  { id: "ig-02", name: "New Hardwoods 1.5\"", cost: 10.00, unit: "sqft" },
  { id: "ig-03", name: "New Hardwoods 2\"", cost: 4.75, unit: "sqft" },
  { id: "ig-04", name: "Hardwood Splicing", cost: 8.40, unit: "sqft" },
  { id: "ig-05", name: "Vinyl Plank", cost: 2.50, unit: "sqft" },
  { id: "ig-06", name: "Carpet", cost: 1.90, unit: "sqft" },
  { id: "ig-07", name: "Interior Paint — 2 Tone", cost: 2.95, unit: "sqft" },
  { id: "ig-08", name: "Drywall Repair", cost: 900.00, unit: "1,000 sqft" },
  { id: "ig-09", name: "Wallpaper Removal", cost: 250.00, unit: "room" },
  { id: "ig-10", name: "Interior Door — Hollow Slab", cost: 125.00, unit: "ea." },
  { id: "ig-11", name: "Interior Door Hardware (Knob + Hinges + Labor)", cost: 25.00, unit: "ea." },
  { id: "ig-12", name: "Bifold Door with Framing", cost: 400.00, unit: "ea." },
  { id: "ig-13", name: "Interior Door — Pre-hung", cost: 200.00, unit: "ea." },
  { id: "ig-14", name: "Front Entry Door", cost: 475.00, unit: "ea." },
  { id: "ig-15", name: "Front Entry Door Hardware", cost: 80.00, unit: "ea." },
  { id: "ig-16", name: "Exterior Door Hardware", cost: 75.00, unit: "handle" },
  { id: "ig-17", name: "Exterior Insulated Side Door (Installed)", cost: 500.00, unit: "ea." },
  { id: "ig-18", name: "Sliding Glass Door", cost: 1025.00, unit: "ea." },
  { id: "ig-19", name: "Trim Out (Casing, Crown, Baseboard)", cost: 3.75, unit: "LF" },
  { id: "ig-20", name: "MISC / Punch List", cost: 2650.00, unit: "flat" },
  { id: "ig-21", name: "Finish Out Labor", cost: 1350.00, unit: "flat" },
  { id: "ig-22", name: "Light Fixtures", cost: 70.00, unit: "100 sqft" },
  { id: "ig-23", name: "Bedbug Spray / Heat Treat", cost: 475.00, unit: "ea." },
  { id: "ig-24", name: "Termite Treatment", cost: 650.00, unit: "ea." },
  { id: "ig-25", name: "Demo", cost: 1375.00, unit: "variable" },
  { id: "ig-26", name: "Haul Off", cost: 725.00, unit: "load" },
  { id: "ig-27", name: "Final Cleaning", cost: 325.00, unit: "flat" },
  { id: "ig-28", name: "Staging", cost: 0.90, unit: "sqft" },
  { id: "kt-01", name: "Hinges and Pulls", cost: 275.00, unit: "kitchen" },
  { id: "kt-02", name: "Cabinets Uppers", cost: 125.00, unit: "LF" },
  { id: "kt-03", name: "Cabinets Lowers", cost: 150.00, unit: "LF" },
  { id: "kt-04", name: "Cabinet Door Faces Only", cost: 80.00, unit: "door" },
  { id: "kt-05", name: "Cabinets (Labor & Paint)", cost: 1100.00, unit: "kitchen" },
  { id: "kt-06", name: "Granite + 4\" Splash Guard", cost: 40.00, unit: "LF" },
  { id: "kt-07", name: "Backsplash", cost: 725.00, unit: "house" },
  { id: "kt-08", name: "Misc Woodwork", cost: 500.00, unit: "variable" },
  { id: "kt-09", name: "Tile — Large Areas", cost: 6.45, unit: "sqft" },
  { id: "kt-10", name: "Tile — Small Areas", cost: 10.00, unit: "sqft" },
  { id: "kt-11", name: "Undermount Kitchen Sink", cost: 325.00, unit: "ea." },
  { id: "kt-12", name: "Microwave / Hood", cost: 500.00, unit: "ea." },
  { id: "kt-13", name: "Range", cost: 725.00, unit: "ea." },
  { id: "kt-14", name: "Wall Oven", cost: 1075.00, unit: "ea." },
  { id: "kt-15", name: "Cooktop", cost: 550.00, unit: "ea." },
  { id: "kt-16", name: "Dishwasher", cost: 575.00, unit: "ea." },
  { id: "kt-17", name: "Fridge", cost: 1175.00, unit: "ea." },
  { id: "ba-01", name: "Granite ($/LF)", cost: 35.00, unit: "LF" },
  { id: "ba-02", name: "New Bottom Vanity", cost: 125.00, unit: "LF" },
  { id: "ba-03", name: "Home Depot Vanity w/ Sink (18\")", cost: 225.00, unit: "ea." },
  { id: "ba-04", name: "Toilet", cost: 150.00, unit: "ea." },
  { id: "ba-05", name: "Tile — Large Areas", cost: 5.80, unit: "sqft" },
  { id: "ba-06", name: "Tile — Small Areas", cost: 10.00, unit: "sqft" },
  { id: "ba-07", name: "Reglaze Tub or Chemical Clean", cost: 350.00, unit: "ea." },
  { id: "ba-08", name: "Reglaze Tub + Surround", cost: 750.00, unit: "ea." },
  { id: "ba-09", name: "Reglaze Shower", cost: 1325.00, unit: "ea." },
  { id: "ba-10", name: "Tiled Shower Tear Out + Tile Install", cost: 3100.00, unit: "ea." },
  { id: "ba-11", name: "Tub Tile Surround Tear Out + Tile Install (incl. tub)", cost: 2250.00, unit: "ea." },
  { id: "ba-12", name: "Shower Plastic Insert Tear Out + New Insert", cost: 825.00, unit: "ea." },
  { id: "ba-13", name: "Tub Tear Out + New Insert & Tub", cost: 1575.00, unit: "ea." },
  { id: "ba-14", name: "Undermount Sink", cost: 150.00, unit: "ea." },
  { id: "ba-15", name: "Mirror", cost: 200.00, unit: "ea." },
  { id: "ba-16", name: "HVL (needed if no window)", cost: 275.00, unit: "ea." },
  { id: "as-01", name: "Furnace", cost: 3350.00, unit: "ea." },
  { id: "as-02", name: "Condensing Unit", cost: 3300.00, unit: "ea." },
  { id: "as-03", name: "Package Unit", cost: 4700.00, unit: "ea." },
  { id: "as-04", name: "A-Coil (if no condensing unit)", cost: 1625.00, unit: "ea." },
  { id: "as-05", name: "Ducting (if NO HVAC)", cost: 3200.00, unit: "ea." },
  { id: "as-06", name: "Duct Cleaning — Floor Vents", cost: 550.00, unit: "ea." },
  { id: "as-07", name: "Window Unit Replacement 220", cost: 575.00, unit: "ea." },
  { id: "as-08", name: "Hot Water Heater w/ Expansion Tank", cost: 1425.00, unit: "ea." },
  { id: "as-09", name: "Hot Water Heater Expansion Tank Only", cost: 200.00, unit: "ea." },
  { id: "as-10", name: "Switches / Outlets", cost: 1400.00, unit: "house" },
  { id: "as-11", name: "Standard Electrical", cost: 1650.00, unit: "house" },
  { id: "as-12", name: "Subfloor", cost: 8.20, unit: "sqft" },
  { id: "as-13", name: "Framing", cost: 950.00, unit: "variable" },
  { id: "as-14", name: "Structural (Pier)", cost: 375.00, unit: "pier" },
  { id: "as-15", name: "Structural Foam Injection", cost: 5.85, unit: "sqft of affected area" },
  { id: "as-16", name: "Roof", cost: 1100.00, unit: "225 sqft L&M" },
  { id: "as-17", name: "Plumbing", cost: 1000.00, unit: "variable" },
  { id: "as-18", name: "Electrical Panel Swap to 200A", cost: 2350.00, unit: "ea." },
  { id: "as-19", name: "Full Electrical Rewire (to Studs)", cost: 5.65, unit: "sqft" },
  { id: "as-20", name: "Full Electrical Rewire (leaving Drywall)", cost: 9.15, unit: "sqft" },
  { id: "as-21", name: "Wall Insulation (to Studs)", cost: 1.20, unit: "sqft" },
  { id: "as-22", name: "Attic Insulation", cost: 1225.00, unit: "1,600 sqft house" },
  { id: "as-23", name: "New Drywall to Studs (L&M)", cost: 5.20, unit: "sqft" },
  { id: "as-24", name: "Aluminum Wiring", cost: 2450.00, unit: "variable" },
  { id: "ex-01", name: "Fence Repair — Chain Link / Wood Gate", cost: 225.00, unit: "variable" },
  { id: "ex-02", name: "Fence Repair — Chain Link", cost: 275.00, unit: "LF" },
  { id: "ex-03", name: "Fence Repair — Privacy 6ft", cost: 30.00, unit: "LF" },
  { id: "ex-04", name: "Landscaping", cost: 450.00, unit: "variable" },
  { id: "ex-05", name: "Vinyl Siding (10'x10')", cost: 300.00, unit: "square" },
  { id: "ex-06", name: "Tuck Pointing", cost: 225.00, unit: "variable" },
  { id: "ex-07", name: "Exterior Paint", cost: 2.60, unit: "sqft" },
  { id: "ex-08", name: "Exterior Wood Repair", cost: 525.00, unit: "variable" },
  { id: "ex-09", name: "Siding Repair (10'x10')", cost: 975.00, unit: "section" },
  { id: "ex-10", name: "Tree Trimming", cost: 450.00, unit: "variable" },
  { id: "ex-11", name: "Tree Removal (w/o stump)", cost: 1450.00, unit: "tree" },
  { id: "ex-12", name: "Stump Grinding", cost: 250.00, unit: "stump" },
  { id: "ex-13", name: "Aluminum Window Paint (Int/Ext)", cost: 700.00, unit: "house" },
  { id: "ex-14", name: "Windows (3x5 sash)", cost: 425.00, unit: "ea." },
  { id: "ex-15", name: "Window Repair — Non-Insulated (6x6+)", cost: 35.00, unit: "sf" },
  { id: "ex-16", name: "Window Repair — Insulated (6x6+)", cost: 40.00, unit: "sf" },
  { id: "ex-17", name: "Aluminum Framed Window Pane", cost: 100.00, unit: "pane" },
  { id: "ex-18", name: "Guttering", cost: 4.15, unit: "LF" },
  { id: "ex-19", name: "Concrete w/ Demo", cost: 200.00, unit: "sqft" },
  { id: "ex-20", name: "Mowing (summer, every 2 weeks)", cost: 45.00, unit: "mowing" },
  { id: "ex-21", name: "Garage Door — 1 Car", cost: 975.00, unit: "ea." },
  { id: "ex-22", name: "Garage Door — 2 Car (Installed)", cost: 1225.00, unit: "ea." },
  { id: "ex-23", name: "Garage Conversion", cost: 8850.00, unit: "ea." },
];

const ITEM_BY_ID = Object.fromEntries(ITEMS.map(it => [it.id, it]));

// ---- Groups & room types (briefing structure — exact) -------------------
// counted:false groups (Sitewide & Cleanup) hold money but do not drive
// the 19-group progress count.
const GROUPS = {
  "g-int-flooring":   { name: "Flooring",              items: ["ig-01","ig-02","ig-03","ig-04","ig-05","ig-06"] },
  "g-int-paint":      { name: "Paint & Wall Repair",   items: ["ig-07","ig-08","ig-09"] },
  "g-int-doors":      { name: "Doors",                 items: ["ig-10","ig-11","ig-12","ig-13","ig-14","ig-15","ig-16","ig-17","ig-18","ig-19"] },
  "g-int-pest":       { name: "Pest Control",          items: ["ig-23","ig-24"] },
  "g-int-sitewide":   { name: "Sitewide & Cleanup",    items: ["ig-20","ig-21","ig-22","ig-25","ig-26","ig-27","ig-28"], counted: false },
  "g-kt-cabinets":    { name: "Cabinets",              items: ["kt-01","kt-02","kt-03","kt-04","kt-05","kt-08"] },
  "g-kt-counters":    { name: "Countertops & Tile",    items: ["kt-06","kt-07","kt-09","kt-10"] },
  "g-kt-appliances":  { name: "Appliances",            items: ["kt-11","kt-12","kt-13","kt-14","kt-15","kt-16","kt-17"] },
  "g-ba-vanity":      { name: "Vanity & Countertop",   items: ["ba-01","ba-02","ba-03","ba-04","ba-14","ba-15"] },
  "g-ba-tubshower":   { name: "Tub & Shower",          items: ["ba-07","ba-08","ba-09","ba-10","ba-11","ba-12","ba-13","ba-16"] },
  "g-ba-tile":        { name: "Tile",                  items: ["ba-05","ba-06"] },
  "g-as-hvac":        { name: "HVAC",                  items: ["as-01","as-02","as-03","as-04","as-05","as-06","as-07","as-08","as-09"] },
  "g-as-electrical":  { name: "Electrical",            items: ["as-10","as-11","as-18","as-19","as-20","as-24"] },
  "g-as-structural":  { name: "Structural",            items: ["as-12","as-13","as-14","as-15","as-16","as-17"] },
  "g-as-insulation":  { name: "Insulation & Drywall",  items: ["as-21","as-22","as-23"] },
  "g-ex-fence":       { name: "Fence",                 items: ["ex-01","ex-02","ex-03"] },
  "g-ex-siding":      { name: "Siding",                items: ["ex-05","ex-06","ex-07","ex-08","ex-09","ex-18"] },
  "g-ex-windows":     { name: "Windows",               items: ["ex-13","ex-14","ex-15","ex-16","ex-17"] },
  "g-ex-garage":      { name: "Garage",                items: ["ex-19","ex-21","ex-22","ex-23"] },
  "g-ex-trees":       { name: "Trees",                 items: ["ex-04","ex-10","ex-11","ex-12","ex-20"] },
  // Bedroom / Living groups reference the relevant ig- items; each room
  // instance tracks its own selections, so sharing item ids is safe.
  "g-bd-flooring":    { name: "Flooring",              items: ["ig-01","ig-02","ig-03","ig-04","ig-05","ig-06"] },
  "g-bd-paint":       { name: "Paint",                 items: ["ig-07","ig-08","ig-09"] },
  "g-bd-doors":       { name: "Doors",                 items: ["ig-10","ig-11","ig-13"] },
  "g-bd-closet":      { name: "Closet",                items: ["ig-12","ig-11"] },
  "g-lv-flooring":    { name: "Flooring",              items: ["ig-01","ig-02","ig-03","ig-04","ig-05","ig-06"] },
  "g-lv-paint":       { name: "Paint",                 items: ["ig-07","ig-08","ig-09"] },
  "g-lv-doors":       { name: "Doors",                 items: ["ig-10","ig-11","ig-12","ig-13"] },
  "g-lv-lighting":    { name: "Lighting",              items: ["ig-22"] },
};

const ROOM_TYPES = [
  { id: "interior", name: "Interior / General",  single: true,  groups: ["g-int-flooring","g-int-paint","g-int-doors","g-int-pest","g-int-sitewide"] },
  { id: "kitchen",  name: "Kitchen",             single: false, groups: ["g-kt-cabinets","g-kt-counters","g-kt-appliances"] },
  { id: "bathroom", name: "Bathroom",            single: false, groups: ["g-ba-vanity","g-ba-tubshower","g-ba-tile"] },
  { id: "systems",  name: "Systems & Structure", single: true,  groups: ["g-as-hvac","g-as-electrical","g-as-structural","g-as-insulation"] },
  { id: "exterior", name: "Exterior",            single: true,  groups: ["g-ex-fence","g-ex-siding","g-ex-windows","g-ex-garage","g-ex-trees"] },
  { id: "bedroom",  name: "Bedroom",             single: false, groups: ["g-bd-flooring","g-bd-paint","g-bd-doors","g-bd-closet"] },
  { id: "living",   name: "Living / Common",     single: false, groups: ["g-lv-flooring","g-lv-paint","g-lv-doors","g-lv-lighting"] },
];

const ROOM_TYPE_BY_ID = Object.fromEntries(ROOM_TYPES.map(rt => [rt.id, rt]));

// ---- Currency formatting — the one function used everywhere -------------
// >= $100 rounds to whole dollars ($1,425); < $100 shows cents ($2.35).
function fmtMoney(n) {
  const abs = Math.abs(n);
  if (abs >= 100) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  return "$" + n.toFixed(2);
}

// ---- Project factory -----------------------------------------------------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function newRoom(roomTypeId, label) {
  return { roomInstanceId: uid(), roomTypeId, label, selections: {} };
}

function newProject(name) {
  const now = Date.now();
  return {
    id: uid(),
    name: name || "New Project",
    address: "",
    agentName: "",
    walkthroughDate: new Date().toISOString().slice(0, 10),
    createdAt: now,
    updatedAt: now,
    rooms: [
      newRoom("interior", "Interior / General"),
      newRoom("kitchen", "Kitchen"),
      newRoom("bathroom", "Bathroom 1"),
      newRoom("systems", "Systems & Structure"),
      newRoom("exterior", "Exterior"),
    ],
    customItems: [],   // { id, groupScope: "roomInstanceId:groupId", name, cost, unit }
    priceOverrides: {}, // { [itemId]: cost }
    photos: [],
    notes: "",
  };
}

// ---- calc(): the single arithmetic authority (UI Law 2) ------------------
// All money math is done in integer cents; dollars only at the boundary.
// Effective cost = project override ?? global override ?? ITEMS default.
//
// Returns:
// {
//   rooms: [ { roomInstanceId, label, roomTypeId, subtotal,
//              reviewedCount, countedGroupCount,
//              groups: [ { groupId, name, counted, noAction, reviewed,
//                          status: "untouched"|"active"|"done",
//                          checkedCount, subtotal,
//                          lines: [ { itemId, name, unit, qty, unitCost,
//                                     checked, overridden, custom,
//                                     total } ] } ] } ],
//   grandTotal, itemCount, noActionCount,
//   groupsReviewed, groupsTotal, unreviewedCount, progressPct,
//   biggestLine: { roomLabel, groupName, name, total } | null,
// }
function calc(project, globalPrices = {}) {
  const toCents = d => Math.round(d * 100);

  function effectiveCost(itemId) {
    if (project.priceOverrides && itemId in project.priceOverrides) {
      return { cost: project.priceOverrides[itemId], overridden: true };
    }
    if (itemId in globalPrices) {
      return { cost: globalPrices[itemId], overridden: true };
    }
    return { cost: ITEM_BY_ID[itemId].cost, overridden: false };
  }

  const customByScope = {};
  for (const ci of project.customItems || []) {
    (customByScope[ci.groupScope] ||= []).push(ci);
  }

  let grandCents = 0;
  let itemCount = 0;
  let noActionCount = 0;
  let groupsReviewed = 0;
  let groupsTotal = 0;
  let biggestLine = null;

  const rooms = project.rooms.map(room => {
    let roomCents = 0;
    let reviewedCount = 0;
    let countedGroupCount = 0;
    const roomType = ROOM_TYPE_BY_ID[room.roomTypeId];

    const groups = roomType.groups.map(groupId => {
      const def = GROUPS[groupId];
      const counted = def.counted !== false;
      const sel = (room.selections || {})[groupId] || {};
      const selItems = sel.items || {};

      const scope = room.roomInstanceId + ":" + groupId;
      const customs = customByScope[scope] || [];

      let groupCents = 0;
      let checkedCount = 0;

      const lines = [];
      for (const itemId of def.items) {
        const base = ITEM_BY_ID[itemId];
        const { cost, overridden } = effectiveCost(itemId);
        const st = selItems[itemId] || {};
        const checked = !!st.checked;
        const qty = checked ? (st.qty ?? 1) : null;
        // Law 3: unchecked = no money, total is null (UI renders "—").
        const totalCents = checked ? Math.round(toCents(cost) * qty) : null;
        if (checked) {
          checkedCount++;
          groupCents += totalCents;
        }
        lines.push({
          itemId, name: base.name, unit: base.unit,
          qty, unitCost: cost, checked, overridden, custom: false,
          total: checked ? totalCents / 100 : null,
        });
      }
      for (const ci of customs) {
        const st = selItems[ci.id] || {};
        const checked = !!st.checked;
        const qty = checked ? (st.qty ?? 1) : null;
        const totalCents = checked ? Math.round(toCents(ci.cost) * qty) : null;
        if (checked) {
          checkedCount++;
          groupCents += totalCents;
        }
        lines.push({
          itemId: ci.id, name: ci.name, unit: ci.unit,
          qty, unitCost: ci.cost, checked, overridden: false, custom: true,
          total: checked ? totalCents / 100 : null,
        });
      }

      const noAction = !!sel.noAction;
      // A group is reviewed when marked No Action or has >=1 checked item.
      const reviewed = noAction || checkedCount > 0;
      const status = noAction ? "done" : checkedCount > 0 ? "active" : "untouched";

      if (counted) {
        countedGroupCount++;
        groupsTotal++;
        if (reviewed) { reviewedCount++; groupsReviewed++; }
      }
      if (noAction) noActionCount++;
      itemCount += checkedCount;
      roomCents += groupCents;

      for (const ln of lines) {
        if (ln.total != null && (!biggestLine || ln.total > biggestLine.total)) {
          biggestLine = { roomLabel: room.label, groupName: def.name, name: ln.name, total: ln.total };
        }
      }

      return {
        groupId, name: def.name, counted, noAction, reviewed, status,
        checkedCount, subtotal: groupCents / 100, lines,
      };
    });

    grandCents += roomCents;
    return {
      roomInstanceId: room.roomInstanceId, label: room.label,
      roomTypeId: room.roomTypeId, subtotal: roomCents / 100,
      reviewedCount, countedGroupCount, groups,
    };
  });

  return {
    rooms,
    grandTotal: grandCents / 100,
    itemCount,
    noActionCount,
    groupsReviewed,
    groupsTotal,
    unreviewedCount: groupsTotal - groupsReviewed,
    progressPct: groupsTotal ? Math.round((groupsReviewed / groupsTotal) * 100) : 0,
    biggestLine,
  };
}

// Node-only export for test-data.js; inert in the browser.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ITEMS, ITEM_BY_ID, GROUPS, ROOM_TYPES, ROOM_TYPE_BY_ID, fmtMoney, newProject, newRoom, calc };
}
