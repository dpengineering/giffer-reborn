// =============================================================================
//  Terminal1337 -- a hidden fake bash terminal (easter egg).
//
//  Unlocked by getting Exercise 1337 graded as correct. When unlocked, the
//  Output console is swapped for a little text-only, roguelike "descent" into
//  a fake file system. Students learn cd, ls (-a), cat, less, mkdir, mv, cp,
//  rm (-r) and finally sudo to reach the secret at the bottom of the well.
//
//  Layout of this file:
//    1. Small utilities (seeded RNG, the obfuscated secret)
//    2. World generation  -- builds a randomized file system per run
//    3. Shell             -- pure command interpreter (no DOM, testable in node)
//    4. UI                -- DOM terminal + hooks called from main.js
//
//  Hooks used by main.js (all guarded with `typeof Terminal1337`):
//    Terminal1337.onExerciseLoaded(number)   -- locks/hides when leaving 1337
//    Terminal1337.onRunStart()               -- shows the normal console again
//    Terminal1337.onGraded(number, correct)  -- unlocks on a correct 1337
// =============================================================================
(function (global) {
  "use strict";

  var EXERCISE = 1337;
  var STORAGE_KEY = "terminal1337";

  // ---------------------------------------------------------------------------
  // 1. Utilities
  // ---------------------------------------------------------------------------

  // Small seeded PRNG so a run's random layout survives page reloads.
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  // Pick n distinct items from a pool.
  function pickN(rng, arr, n) { return shuffle(rng, arr).slice(0, n); }

  // The super duper secret phrase, lightly obfuscated so it isn't sitting in
  // the source as plain text (a curious student with devtools will still win,
  // which is honestly also fine).
  var SECRET_BYTES = [107, 102, 108, 99, 111, 125, 127, 112, 98, 111, 120];
  function secretPhrase() {
    return SECRET_BYTES.map(function (b) { return String.fromCharCode(b ^ 42); }).join("");
  }

  // ---------------------------------------------------------------------------
  // 2. World generation
  // ---------------------------------------------------------------------------
  //
  // Node format (plain JSON so the whole world can be saved to localStorage):
  //   dir:  { t: "d", c: { name: node, ... }, ...flags }
  //   file: { t: "f", x: "text", ...flags }
  // Flags:
  //   s: true  -> sturdy: rm refuses to destroy it
  //   f: true  -> fixed:  mv refuses to move it
  //   r: true  -> root-only: needs sudo to look inside / read
  //   g: "id"  -> gated: can't be entered until gate "id" is satisfied
  //   lvl: n   -> arriving here for the first time prints level n's intro

  function D(children, flags) { return Object.assign({ t: "d", c: children || {} }, flags || {}); }
  function F(text, flags) { return Object.assign({ t: "f", x: text }, flags || {}); }
  var CARVED = { s: true, f: true };   // structural: can't be removed or moved

  function generateWorld(seed) {
    var rng = mulberry32(seed);

    var w = {};  // names chosen for this run (used by gates & messages)
    w.shaft = pick(rng, ["shaft", "throat", "drop", "hollow", "descent"]);
    var tunnels = pickN(rng, ["moss", "echo", "drip", "root", "bone", "silt", "hush", "ash", "glow", "fern"], 4);
    w.breath = tunnels[0];                 // the tunnel that leads on
    w.decoys = tunnels.slice(1);
    w.crack = pick(rng, [".crack", ".seam", ".fissure", ".split"]);
    w.scratch = pick(rng, [".scratches", ".carving", ".marks"]);
    w.critter = pick(rng, ["moth", "newt", "mole", "bat", "toad"]);
    w.nest = pick(rng, ["nest", "burrow", "den"]);
    var passages = pickN(rng, ["stairs", "chute", "passage", "hole", "ladder", "steps", "crawlway", "gap"], 4);
    w.p3 = passages[0]; w.p4 = passages[1]; w.p5 = passages[2]; w.p6 = passages[3];
    w.egg = pick(rng, ["egg", "orb", "pearl", "seed"]);
    w.altar = pick(rng, ["altar", "pedestal", "plinth"]);
    w.flame = pick(rng, ["flame", "ember", "spark"]);
    var sides = pick(rng, [["left", "right"], ["east", "west"], ["north", "south"]]);
    w.sideA = sides[0]; w.sideB = sides[1];
    w.rubble = pick(rng, ["rubble", "rocks", "debris", "rockfall"]);
    w.vault = pick(rng, ["vault", "crypt", "reliquary"]);
    w.pwA = pick(rng, ["lum", "emb", "hol", "noc", "vel", "mir"]);
    w.pwB = pick(rng, ["ina", "ers", "low", "tis", "ora", "ith"]);
    w.stones = 3 + Math.floor(rng() * 4);

    // Absolute paths of each level (gates look things up relative to these).
    w.L0 = "/well";
    w.L1 = w.L0 + "/" + w.shaft;
    w.L2 = w.L1 + "/" + w.breath;
    w.L3 = w.L2 + "/" + w.crack;
    w.L4 = w.L3 + "/" + w.p3;
    w.L5 = w.L4 + "/" + w.p4;
    w.L6 = w.L5 + "/" + w.p5;
    w.L7 = w.L6 + "/" + w.p6;

    // --- Level 7: the bottom (sudo) ------------------------------------------
    var L7 = D({
      "README": F([
        "The bottom of the well. Dry. Silent.",
        "",
        "A " + w.vault + " is sealed with the mark of ROOT.",
        "You are not root.",
        "",
        "`sudo` lets you borrow root's voice for one command:",
        "    sudo ls " + w.vault,
        "    sudo cat " + w.vault + "/<something>",
        "",
        "It will ask for the word.",
        "The word was split in two on your way down.",
        "One half was carved at the end of a long story.",
        "The other half hid in the smooth walls."
      ].join("\n"), CARVED)
    }, Object.assign({ g: "rubble", lvl: 7 }, CARVED));
    L7.c[w.vault] = D({
      "secret": F("@@WIN@@", { r: true, s: true }),
      "dust": F("Just dust. Very old, very important dust.", { r: true })
    }, Object.assign({ r: true }, CARVED));

    // --- Level 6: rm ---------------------------------------------------------
    var stones = {};
    for (var i = 1; i <= w.stones; i++) {
      stones["stone" + i] = F(pick(rng, ["A heavy stone.", "A cold stone.", "A stone. It looks back at you.", "A wet stone."]));
    }
    var L6 = D({
      "README": F([
        "The " + w.rubble + " chokes the way down.",
        "",
        "Some things must be destroyed to move forward.",
        "`rm` removes a file. A directory needs `rm -r`.",
        "",
        "Be careful. In a real terminal, there is no undo."
      ].join("\n"), CARVED)
    }, Object.assign({ g: "flames", lvl: 6 }, CARVED));
    L6.c[w.rubble] = D(stones);
    L6.c[w.p6] = L7;

    // --- Level 5: cp ---------------------------------------------------------
    var L5 = D({
      "README": F([
        "Two empty braziers: " + w.sideA + " and " + w.sideB + ".",
        "One " + w.flame + ".",
        "",
        "Both must burn.",
        "Moving fire only leaves darkness behind.",
        "Copying it... `cp`"
      ].join("\n"), CARVED)
    }, Object.assign({ g: "altar", lvl: 5 }, CARVED));
    L5.c[w.flame] = F("A small " + w.flame + ". It doesn't burn your hand.", { s: true });
    L5.c[w.sideA] = D({}, CARVED);
    L5.c[w.sideB] = D({}, CARVED);
    L5.c[w.p5] = L6;

    // --- Level 4: mv ---------------------------------------------------------
    var L4 = D({
      "README": F([
        "An empty " + w.altar + " stands in the middle of the room.",
        "A " + w.egg + " lies in the dust at your feet.",
        "",
        "Some things belong somewhere else.",
        "`mv` moves them."
      ].join("\n"), CARVED)
    }, Object.assign({ g: "nest", lvl: 4 }, CARVED));
    L4.c[w.egg] = F("A smooth " + w.egg + ". Warm. Humming very quietly.", { s: true });
    L4.c[w.altar] = D({}, CARVED);
    L4.c[w.p4] = L5;

    // --- Level 3: mkdir ------------------------------------------------------
    var L3 = D({
      "README": F([
        "A tiny " + w.critter + " blocks the way, shivering.",
        "It has nowhere to sleep.",
        "",
        "Make it a " + w.nest + ".",
        "(`mkdir` makes a directory.)"
      ].join("\n"), CARVED)
    }, Object.assign({ lvl: 3 }, CARVED));
    L3.c[w.critter] = F(critterArt(w.critter), CARVED);
    L3.c[w.p3] = L4;

    // --- Level 2: ls -a ------------------------------------------------------
    var L2 = D({
      "README": F([
        "Smooth walls. Nothing here.",
        "",
        "...nothing you can see, anyway.",
        "`ls` only shows what wants to be seen.",
        "Ask it to show you -a ll of it."
      ].join("\n"), CARVED)
    }, Object.assign({ lvl: 2 }, CARVED));
    L2.c[w.scratch] = F([
      "Someone scratched letters into the stone:",
      "",
      "        . . . " + w.pwB.toUpperCase(),
      "",
      "(The beginning is worn away.)"
    ].join("\n"), CARVED);
    L2.c[w.crack] = L3;

    // --- Level 1: less + cd .. -----------------------------------------------
    var L1 = D({
      "README": F([
        "Four tunnels lead away into the dark.",
        "Only one of them breathes.",
        "",
        "Someone left a journal. It's long --",
        "`less journal` is kinder than `cat` for long things.",
        "(space = next page, q = quit)",
        "",
        "Wrong tunnel? `cd ..` climbs back up."
      ].join("\n"), CARVED),
      "journal": F(journalText(rng, w), CARVED)
    }, Object.assign({ lvl: 1 }, CARVED));
    var deadEnds = [
      "Old bones. A dead end.\n(cd .. to climb back)",
      "The tunnel narrows to nothing. A dead end.\n(cd .. to climb back)",
      "Water. Just water, all the way down. A dead end.\n(cd .. to climb back)",
      "Your own voice echoes back: \"dead end\".\n(cd .. to climb back)"
    ];
    w.decoys.forEach(function (name, idx) {
      var note = {};
      note[pick(rng, ["note", "bones", "puddle", "echo"])] = F(deadEnds[idx % deadEnds.length]);
      L1.c[name] = D(note, CARVED);
    });
    L1.c[w.breath] = L2;

    // --- Level 0: the surface ------------------------------------------------
    var L0 = D({
      "README": F([
        "You stand at the edge of an old stone well.",
        "There is only one way to go.",
        "",
        "  ls        look around",
        "  cat FILE  read something",
        "  cd DIR    go somewhere",
        "",
        "Type `help` if you forget."
      ].join("\n"), CARVED),
      "lantern": F("Your lantern. It flickers, but it holds.", { s: true })
    }, Object.assign({ lvl: 0 }, CARVED));
    L0.c[w.shaft] = L1;

    // --- The rest of the "system" (for the curious) --------------------------
    var root = D({
      "well": L0,
      "bin": D({
        "ls": F("\u007fELF\u0002\u0001\u0001 ...binary noise..."),
        "cat": F("\u007fELF\u0002\u0001\u0001 =^..^="),
        "sudo": F("\u007fELF\u0002\u0001\u0001 ...you hear a faint hum...")
      }, CARVED),
      "etc": D({
        "motd": F("Message of the day: the well is deeper than it looks."),
        "passwd": F("root:x:0:0:root:/root:/bin/bash\nyou:x:1337:1337:explorer:/well:/bin/bash", { s: true }),
        "shadow": F("Nice try. :)", { r: true, s: true })
      }, CARVED),
      "root": D({
        "note": F("If you're reading this, you already know the word.", { r: true })
      }, Object.assign({ r: true }, CARVED)),
      "tmp": D({}, { s: true, f: true })
    }, CARVED);

    return { fs: root, w: w };
  }

  function journalText(rng, w) {
    var lines = [
      "Day 1.",
      "  The rope was shorter than I thought.",
      "  I dropped the last few feet. My lantern survived.",
      "",
      "Day 2.",
      "  Four tunnels. I tried the " + w.decoys[0] + " one first.",
      "  It only goes so far. I came back up.",
      "",
      "Day 3.",
      "  Something small follows me. It doesn't seem dangerous.",
      "  I've started talking to it.",
      "",
      "Day 4.",
      "  The " + w.decoys[1] + " tunnel is a dead end too.",
      "  The walls here have marks on them. Not mine.",
      "",
      "Day 5.",
      "  I keep hearing the number again. One. Three. Three. Seven.",
      "  It comes from below.",
      "",
      "Day 6.",
      "  Lost my notes from yesterday. Doesn't matter.",
      "  Note to self: the walls lie. Not everything shows itself.",
      "",
      "Day 7.",
      "  The " + w.decoys[2] + " tunnel. Nothing. I'm tired.",
      "",
      "Day 8.",
      "  I sat very still for a long time today.",
      "  One of the tunnels... breathes. Cold air, in and out.",
      "  It's the " + w.breath + " tunnel. I'm sure of it now.",
      "",
      "Day 9.",
      "  Going down the " + w.breath + " tunnel tomorrow.",
      "  If I don't come back, the word begins with what I carved",
      "  on the inside of the back cover.",
      "",
      "",
      "                    [ back cover ]",
      "",
      "            carved deep:   " + w.pwA.toUpperCase() + " . . .",
      ""
    ];
    return lines.join("\n");
  }

  function critterArt(name) {
    var arts = {
      moth: ["   \\(o o)/  ", "  --( V )--   a moth.", "    /   \\     it shivers."],
      newt: ["      __     ", "  ~~=(oo)>   a newt.", "      ``     it shivers."],
      mole: ["    .---.    ", "   ( -.- )   a mole.", "    `-^-'    it shivers."],
      bat:  ["  /\\(o.o)/\\  ", "    \\ v /    a bat.", "     ` `     it shivers."],
      toad: ["    (o)(o)   ", "   (  __  )  a toad.", "    `----'   it shivers."]
    };
    return (arts[name] || arts.moth).join("\n") + "\n\nIt needs somewhere to sleep.";
  }

  var LEVEL_INTROS = [
    { art: [
      "        .-~~~~~~~-.",
      "       |~-._____.-~|",
      "       |  |     |  |",
      "       |  |     |  |",
      "      _|  |_____|  |_",
      "     /_____________ /|",
      "     |             | |",
      "     |   THE WELL  | /",
      "     |_____________|/"
    ], text: "Cold air rises from below. (try `ls`)" },
    { art: ["   |   |   |   |", "   o   o   o   o"], text: "You climb down. Four dark mouths stare back." },
    { art: [], text: "The air moves here. The walls are perfectly smooth." },
    { art: [], text: "You squeeze through. Something small is breathing nearby." },
    { art: ["        ___", "       |___|", "       |   |"], text: "A round room. Dust everywhere." },
    { art: ["    )       ("], text: "Warm air. Two dark braziers face each other." },
    { art: ["   .:.::.:.:::.:."], text: "The ceiling has collapsed here." },
    { art: ["   ___________", "  |  R O O T  |", "  |___________|"], text: "The bottom. You can feel it humming." }
  ];

  var AMBIENT = [
    "Somewhere above, water drips.",
    "Your lantern flickers.",
    "You hear something skitter in the dark.",
    "A faint hum. One... three... three... seven...",
    "The stone is cold under your hand.",
    "Far away, something sighs."
  ];

  function winText() {
    return [
      "",
      "      *    .  *       .        *",
      "   .     _________________    .",
      "        /                 \\       *",
      "  *    |   you found it.   |",
      "       |                   |   .",
      "    .  |   " + secretPhrase() + "     |",
      "       |                   |  *",
      "   *    \\_________________/",
      "          .    *     .      .",
      "",
      "  The super duper secret phrase is: " + secretPhrase(),
      "",
      "  Tell no one.",
      "  (Okay, tell your teacher.)",
      ""
    ].join("\n");
  }

  // ---------------------------------------------------------------------------
  // 3. Shell -- pure interpreter. exec(line) returns a result object:
  //      { lines: [{text, cls}], pager?: [lines], password?: true, clear?: true, exit?: true }
  // ---------------------------------------------------------------------------

  var COMMANDS = {
    help:    "help [command]        list commands, or explain one",
    ls:      "ls [-a] [-l] [path]   list what's here (-a: include hidden)",
    cd:      "cd [path]             go somewhere (.. = up, ~ = surface, - = back)",
    pwd:     "pwd                   print where you are",
    cat:     "cat FILE...           print a file",
    less:    "less FILE             read a long file one page at a time",
    mkdir:   "mkdir [-p] DIR...     make a directory",
    rm:      "rm [-r] [-f] PATH...  remove (directories need -r)",
    rmdir:   "rmdir DIR             remove an empty directory",
    cp:      "cp [-r] SRC DEST      copy",
    mv:      "mv SRC DEST           move or rename",
    touch:   "touch FILE            make an empty file",
    echo:    "echo TEXT [> FILE]    print text (or write it to a file)",
    sudo:    "sudo COMMAND          run a command as root",
    whoami:  "whoami                who are you?",
    history: "history               commands you've typed",
    clear:   "clear                 clear the screen",
    reset:   "reset                 fall back to the surface of a NEW well",
    exit:    "exit                  close the terminal"
  };

  function Shell(saved) {
    if (saved && saved.fs && saved.w) {
      this.s = saved;
    } else {
      this.newGame();
    }
  }

  Shell.prototype.newGame = function (seed) {
    seed = (seed === undefined) ? Math.floor(Math.random() * 1e9) : seed;
    var world = generateWorld(seed);
    this.s = {
      seed: seed, fs: world.fs, w: world.w,
      cwd: ["well"], prev: ["well"],
      open: {}, visited: {}, sudo: false, fails: 0, won: false, hist: []
    };
  };

  Shell.prototype.save = function () { return this.s; };

  // ---- output helpers ----
  Shell.prototype._out = function (text, cls) {
    var self = this;
    String(text).split("\n").forEach(function (t) { self.buf.push({ text: t, cls: cls || "" }); });
  };
  Shell.prototype._err = function (text) { this._out(text, "err"); };

  Shell.prototype.prompt = function () {
    return (this.root ? "root" : "you") + "@well:" + this.displayPath(this.s.cwd) + (this.root ? "# " : "$ ");
  };
  Shell.prototype.displayPath = function (parts) {
    var p = "/" + parts.join("/");
    if (p === "/well") return "~";
    if (p.indexOf("/well/") === 0) return "~" + p.slice(5);
    return p;
  };

  // ---- path handling ----
  // Turns a path string into an array of names from "/".
  Shell.prototype.split = function (path) {
    var parts;
    if (path === "~" || path.indexOf("~/") === 0) {
      parts = ["well"]; path = path.slice(1);
    } else if (path.charAt(0) === "/") {
      parts = [];
    } else {
      parts = this.s.cwd.slice();
    }
    path.split("/").forEach(function (seg) {
      if (seg === "" || seg === ".") return;
      if (seg === "..") { parts.pop(); return; }
      parts.push(seg);
    });
    return parts;
  };

  Shell.prototype.gateCheck = function (id) {
    var s = this.s, w = s.w, self = this;
    function at(path) { return self.nodeAt(self.split(path)); }
    switch (id) {
      case "nest": {
        var n = at(w.L3 + "/" + w.nest);
        if (n && n.t === "d") return { ok: true, msg: "The " + w.critter + " curls up in the " + w.nest + " and falls asleep. The way is clear." };
        return { ok: false, msg: "The " + w.critter + " won't let you pass. It needs a " + w.nest + "." };
      }
      case "altar": {
        var onAltar = at(w.L4 + "/" + w.altar + "/" + w.egg);
        var onFloor = at(w.L4 + "/" + w.egg);
        if (onAltar && onAltar.t === "f" && !onFloor) return { ok: true, msg: "The " + w.egg + " settles on the " + w.altar + ". Stone grinds. A way opens." };
        if (onAltar && onFloor) return { ok: false, msg: "The " + w.altar + " wants the real " + w.egg + ". It can't be in two places at once." };
        return { ok: false, msg: "A sealed door. The " + w.altar + " is empty." };
      }
      case "flames": {
        var a = at(w.L5 + "/" + w.sideA + "/" + w.flame);
        var b = at(w.L5 + "/" + w.sideB + "/" + w.flame);
        if (a && b) return { ok: true, msg: "Both braziers roar to life. The way down is lit." };
        if (a || b) return { ok: false, msg: "One brazier burns. The other is still dark." };
        return { ok: false, msg: "Too dark to go on. Both braziers are cold." };
      }
      case "rubble": {
        if (!at(w.L6 + "/" + w.rubble)) return { ok: true, msg: "The last of the " + w.rubble + " is gone. Cold air rushes up from below." };
        return { ok: false, msg: "The " + w.rubble + " blocks the way." };
      }
    }
    return { ok: true };
  };

  // Raw lookup with no permission or gate checks (used internally by gates).
  Shell.prototype.nodeAt = function (parts) {
    var cur = this.s.fs;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || cur.t !== "d" || !cur.c.hasOwnProperty(parts[i])) return null;
      cur = cur.c[parts[i]];
    }
    return cur;
  };

  // Resolve a path for a user command, enforcing permissions and gates.
  // opts.silent: never open gates or print (used by tab completion).
  // Returns { node, parts, parent, name } or { err }.
  Shell.prototype.resolve = function (path, cmd, opts) {
    opts = opts || {};
    var parts = this.split(path);
    var cur = this.s.fs, parent = null;
    for (var i = 0; i < parts.length; i++) {
      if (cur.t !== "d") return { err: cmd + ": " + path + ": Not a directory" };
      if (!cur.c.hasOwnProperty(parts[i])) return { err: cmd + ": " + path + ": No such file or directory", missing: true, parts: parts, depth: i };
      parent = cur;
      cur = cur.c[parts[i]];
      if (cur.r && !this.root) return { err: cmd + ": " + path + ": Permission denied", denied: true };
      if (cur.g && !this.s.open[cur.g]) {
        var g = this.gateCheck(cur.g);
        if (!g.ok || opts.silent) return { err: g.msg || (cmd + ": " + path + ": blocked"), gate: true };
        this.s.open[cur.g] = true;
        this._out(g.msg, "good");
      }
    }
    return { node: cur, parts: parts, parent: parent, name: parts[parts.length - 1] };
  };

  // Resolve the *parent* of a path that may not exist yet (mkdir, touch, cp/mv dest).
  Shell.prototype.resolveParent = function (path, cmd) {
    var parts = this.split(path);
    if (parts.length === 0) return { err: cmd + ": cannot use '/' here" };
    var name = parts[parts.length - 1];
    var dirPath = "/" + parts.slice(0, -1).join("/");
    var r = this.resolve(dirPath, cmd);
    if (r.err) return { err: r.err.replace(dirPath, path) };
    if (r.node.t !== "d") return { err: cmd + ": " + path + ": Not a directory" };
    return { dir: r.node, name: name, parts: parts };
  };

  function isPrefix(a, b) { // is path a a prefix of (or equal to) path b?
    if (a.length > b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function containsSpecial(node) {
    if (node.s || node.g || node.r || node.lvl !== undefined) return true;
    if (node.t === "d") {
      for (var k in node.c) if (containsSpecial(node.c[k])) return true;
    }
    return false;
  }
  function cloneNode(node) {
    var copy = JSON.parse(JSON.stringify(node));
    (function strip(n) { delete n.s; delete n.f; if (n.t === "d") for (var k in n.c) strip(n.c[k]); })(copy);
    return copy;
  }

  // Split a command line into words, honoring simple "quotes".
  function tokenize(line) {
    var out = [], cur = "", quote = null, has = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      if (quote) {
        if (ch === quote) quote = null; else cur += ch;
      } else if (ch === "\"" || ch === "'") {
        quote = ch; has = true;
      } else if (ch === " " || ch === "\t") {
        if (cur || has) { out.push(cur); cur = ""; has = false; }
      } else {
        cur += ch;
      }
    }
    if (cur || has) out.push(cur);
    return out;
  }
  // Separate "-abc" flags from positional args.
  function parseFlags(args) {
    var flags = {}, rest = [];
    args.forEach(function (a) {
      if (a.length > 1 && a.charAt(0) === "-") {
        a.slice(1).split("").forEach(function (f) { flags[f] = true; });
      } else {
        rest.push(a);
      }
    });
    return { flags: flags, args: rest };
  }

  // ---- main entry point ----
  Shell.prototype.exec = function (line) {
    this.buf = [];
    var result = { lines: this.buf };
    var trimmed = line.trim();
    if (!trimmed) return result;
    this.s.hist.push(trimmed);
    if (this.s.hist.length > 200) this.s.hist.shift();

    var words = tokenize(trimmed);
    var cmd = words[0];
    var args = words.slice(1);

    if (cmd === "sudo") {
      if (args.length === 0) { this._err("usage: sudo COMMAND"); return result; }
      if (args[0] === "su" || args[0] === "-i" || args[0] === "-s" || args[0] === "bash") {
        this._err("Nice try. Root only lends its voice one command at a time.");
        return result;
      }
      if (!this.s.sudo) {
        this.pendingSudo = args;
        result.password = true;
        this._out("[sudo] password for you:", "dim");
        return result;
      }
      return this.runAsRoot(args, result);
    }
    return this.run(cmd, args, result);
  };

  Shell.prototype.submitPassword = function (pw) {
    this.buf = [];
    var result = { lines: this.buf };
    var args = this.pendingSudo;
    this.pendingSudo = null;
    var w = this.s.w;
    if ((pw || "").trim().toLowerCase() === (w.pwA + w.pwB)) {
      this.s.sudo = true;
      this.s.fails = 0;
      return this.runAsRoot(args, result);
    }
    this.s.fails++;
    this._err("Sorry, try again.");
    if (this.s.fails >= 3) {
      this._out("The wall whispers: \"the beginning is on the back cover of the journal in ~/" + w.shaft +
        ". the end hides with the smooth walls. put them together.\"", "dim");
    }
    return result;
  };

  Shell.prototype.runAsRoot = function (args, result) {
    this.root = true;
    try {
      return this.run(args[0], args.slice(1), result);
    } finally {
      this.root = false;
    }
  };

  Shell.prototype.run = function (cmd, args, result) {
    // echo/touch-style output redirection:  echo hi > file
    var redirect = null;
    var gt = args.indexOf(">"), gtgt = args.indexOf(">>");
    if (gt !== -1 || gtgt !== -1) {
      var idx = gt !== -1 ? gt : gtgt;
      redirect = { path: args[idx + 1], append: gtgt !== -1 && gt === -1 };
      args = args.slice(0, idx);
      if (!redirect.path) { this._err("syntax error near unexpected token `newline'"); return result; }
    }

    var handler = this["cmd_" + cmd];
    if (!handler || !COMMANDS.hasOwnProperty(cmd)) {
      if (cmd.toUpperCase() === secretPhrase()) {
        this._out("...the well hums back at you.", "glow");
      } else {
        this._err("bash: " + cmd + ": command not found");
      }
      return result;
    }

    if (redirect) {
      var start = this.buf.length;
      handler.call(this, args, result);
      var produced = this.buf.splice(start).filter(function (l) { return l.cls !== "err"; });
      this.writeFile(redirect.path, produced.map(function (l) { return l.text; }).join("\n"), redirect.append, cmd);
    } else {
      handler.call(this, args, result);
    }

    // A little atmosphere, now and then.
    if (cmd !== "clear" && cmd !== "history" && Math.random() < 0.07) {
      this._out(AMBIENT[Math.floor(Math.random() * AMBIENT.length)], "dim");
    }
    return result;
  };

  Shell.prototype.writeFile = function (path, text, append, cmd) {
    var p = this.resolveParent(path, cmd);
    if (p.err) { this._err(p.err); return; }
    var existing = p.dir.c[p.name];
    if (existing && existing.t === "d") { this._err(cmd + ": " + path + ": Is a directory"); return; }
    if (existing && existing.s) { this._err(cmd + ": " + path + ": the words are carved in stone"); return; }
    if (existing && append) existing.x += (existing.x ? "\n" : "") + text;
    else p.dir.c[p.name] = F(text);
  };

  // ---- commands ----
  Shell.prototype.cmd_help = function (args) {
    if (args[0]) {
      if (COMMANDS[args[0]]) this._out(COMMANDS[args[0]]);
      else this._err("help: no help topics match `" + args[0] + "'");
      return;
    }
    this._out("Commands:", "glow");
    for (var k in COMMANDS) this._out("  " + COMMANDS[k]);
    this._out("");
    this._out("Lost? `cat README`. Up/Down = history. Tab = complete.", "dim");
  };

  Shell.prototype.cmd_pwd = function () { this._out("/" + this.s.cwd.join("/")); };
  Shell.prototype.cmd_whoami = function () { this._out(this.root ? "root" : "you"); };
  Shell.prototype.cmd_clear = function (args, result) { result.clear = true; };
  Shell.prototype.cmd_exit = function (args, result) { result.exit = true; };
  Shell.prototype.cmd_echo = function (args) { this._out(args.join(" ")); };
  Shell.prototype.cmd_history = function () {
    var self = this;
    this.s.hist.forEach(function (h, i) { self._out(("    " + (i + 1)).slice(-5) + "  " + h); });
  };
  Shell.prototype.cmd_reset = function (args, result) {
    this.newGame();
    result.clear = true;
    result.reset = true;
  };

  Shell.prototype.cmd_cd = function (args) {
    var target = args[0];
    if (target === undefined) target = "~";
    if (target === "-") target = "/" + this.s.prev.join("/");
    var r = this.resolve(target, "cd");
    if (r.err) { this._err(r.gate ? r.err : "bash: " + r.err); return; }
    if (r.node.t !== "d") { this._err("bash: cd: " + target + ": Not a directory"); return; }
    this.s.prev = this.s.cwd;
    this.s.cwd = r.parts;
    if (r.node.lvl !== undefined && !this.s.visited[r.node.lvl]) {
      this.s.visited[r.node.lvl] = true;
      this.intro(r.node.lvl);
    }
  };

  Shell.prototype.intro = function (lvl) {
    var intro = LEVEL_INTROS[lvl];
    if (!intro) return;
    if (intro.art.length) this._out(intro.art.join("\n"), "glow");
    this._out(intro.text, "dim");
  };

  Shell.prototype.cmd_ls = function (rawArgs) {
    var p = parseFlags(rawArgs);
    var paths = p.args.length ? p.args : ["."];
    var self = this;
    paths.forEach(function (path, idx) {
      var r = self.resolve(path, "ls");
      if (r.err) { self._err(r.gate ? r.err : "ls: cannot access '" + path + "': " + r.err.split(": ").pop()); return; }
      if (paths.length > 1) self._out((idx ? "\n" : "") + path + ":");
      if (r.node.t === "f") { self._out(path); return; }
      var names = Object.keys(r.node.c).sort();
      if (!p.flags.a) names = names.filter(function (n) { return n.charAt(0) !== "."; });
      else names = [".", ".."].concat(names);
      if (names.length === 0) return;
      if (p.flags.l) {
        names.forEach(function (n) {
          var node = (n === "." || n === "..") ? { t: "d" } : r.node.c[n];
          var owner = node.r ? "root" : "you ";
          var perms = node.t === "d" ? (node.r ? "drwx------" : "drwxr-xr-x") : (node.r ? "-rw-------" : "-rw-r--r--");
          var size = node.t === "f" ? String(node.x.length) : "4096";
          self._out(perms + " " + owner + " " + ("     " + size).slice(-5) + " " + n + (node.t === "d" ? "/" : ""), node.t === "d" ? "dir" : "");
        });
      } else {
        // Multiple items per line, directories highlighted.
        self.buf.push({ parts: names.map(function (n) {
          var node = (n === "." || n === "..") ? { t: "d" } : r.node.c[n];
          return { text: n + (node.t === "d" ? "/" : ""), cls: node.t === "d" ? "dir" : (node.r ? "err" : "") };
        }) });
      }
    });
  };

  Shell.prototype.readFile = function (path, cmd) {
    var r = this.resolve(path, cmd);
    if (r.err) { this._err(r.err); return null; }
    if (r.node.t === "d") { this._err(cmd + ": " + path + ": Is a directory"); return null; }
    if (r.node.x === "@@WIN@@") {
      this.s.won = true;
      return { text: winText(), cls: "glow" };
    }
    return { text: r.node.x, cls: "" };
  };

  Shell.prototype.cmd_cat = function (args) {
    if (!args.length) { this._err("cat: missing file operand"); return; }
    var self = this;
    args.forEach(function (path) {
      var f = self.readFile(path, "cat");
      if (f) self._out(f.text, f.cls);
    });
  };

  Shell.prototype.cmd_less = function (args, result) {
    if (!args.length) { this._err("Missing filename (\"less --help\" for help)"); return; }
    var f = this.readFile(args[0], "less");
    if (!f) return;
    result.pager = f.text.split("\n").map(function (t) { return { text: t, cls: f.cls }; });
  };

  Shell.prototype.cmd_mkdir = function (rawArgs) {
    var p = parseFlags(rawArgs), self = this;
    if (!p.args.length) { this._err("mkdir: missing operand"); return; }
    p.args.forEach(function (path) {
      if (p.flags.p) {
        var parts = self.split(path), cur = "/";
        for (var i = 0; i < parts.length; i++) {
          cur += (i ? "/" : "") + parts[i];
          var existing = self.resolve(cur, "mkdir");
          if (existing.node) { if (existing.node.t !== "d") { self._err("mkdir: " + cur + ": Not a directory"); return; } continue; }
          var mp = self.resolveParent(cur, "mkdir");
          if (mp.err) { self._err(mp.err); return; }
          mp.dir.c[mp.name] = D({});
        }
        return;
      }
      var r = self.resolveParent(path, "mkdir");
      if (r.err) { self._err(r.err.replace(/^mkdir: /, "mkdir: cannot create directory '" + path + "': ").replace(/: [^:]*: /, ": ")); return; }
      if (r.dir.c.hasOwnProperty(r.name)) { self._err("mkdir: cannot create directory '" + path + "': File exists"); return; }
      if (r.dir.r && !self.root) { self._err("mkdir: cannot create directory '" + path + "': Permission denied"); return; }
      r.dir.c[r.name] = D({});
    });
  };

  Shell.prototype.cmd_touch = function (args) {
    var self = this;
    if (!args.length) { this._err("touch: missing file operand"); return; }
    args.forEach(function (path) {
      var r = self.resolveParent(path, "touch");
      if (r.err) { self._err(r.err); return; }
      if (!r.dir.c.hasOwnProperty(r.name)) r.dir.c[r.name] = F("");
    });
  };

  // Shared guard: is it safe to remove/move the node at `parts`?
  Shell.prototype.guardRemove = function (r, path, cmd) {
    if (r.parts.length === 0) { this._err(cmd + ": it is dangerous to operate recursively on '/'"); return false; }
    if (isPrefix(r.parts, this.s.cwd)) { this._err(cmd + ": cannot " + (cmd === "mv" ? "move" : "remove") + " '" + path + "': you're standing in it"); return false; }
    return true;
  };

  Shell.prototype.cmd_rm = function (rawArgs) {
    var p = parseFlags(rawArgs), self = this;
    var recursive = p.flags.r || p.flags.R;
    if (!p.args.length) { this._err("rm: missing operand"); return; }
    p.args.forEach(function (path) {
      var r = self.resolve(path, "rm");
      if (r.err) { if (!p.flags.f || !r.missing) self._err(r.gate ? r.err : "rm: cannot remove '" + path + "': " + r.err.split(": ").pop()); return; }
      if (!self.guardRemove(r, path, "rm")) return;
      if (r.node.t === "d" && !recursive) { self._err("rm: cannot remove '" + path + "': Is a directory"); return; }
      if (hasSturdy(r.node)) {
        self._err("rm: cannot remove '" + path + "': it is carved from the well itself");
        return;
      }
      if (r.parent.r && !self.root) { self._err("rm: cannot remove '" + path + "': Permission denied"); return; }
      delete r.parent.c[r.name];
    });
  };
  function hasSturdy(node) {
    if (node.s) return true;
    if (node.t === "d") for (var k in node.c) if (hasSturdy(node.c[k])) return true;
    return false;
  }

  Shell.prototype.cmd_rmdir = function (args) {
    var self = this;
    if (!args.length) { this._err("rmdir: missing operand"); return; }
    args.forEach(function (path) {
      var r = self.resolve(path, "rmdir");
      if (r.err) { self._err(r.err); return; }
      if (r.node.t !== "d") { self._err("rmdir: failed to remove '" + path + "': Not a directory"); return; }
      if (!self.guardRemove(r, path, "rmdir")) return;
      if (r.node.s) { self._err("rmdir: failed to remove '" + path + "': it is carved from the well itself"); return; }
      if (Object.keys(r.node.c).length) { self._err("rmdir: failed to remove '" + path + "': Directory not empty"); return; }
      delete r.parent.c[r.name];
    });
  };

  // Work out where cp/mv should put things: into DEST if it's a directory,
  // otherwise as DEST (a new name).
  Shell.prototype.destFor = function (src, dest, cmd) {
    var d = this.resolve(dest, cmd);
    if (d.node && d.node.t === "d") {
      if (d.node.r && !this.root) return { err: cmd + ": cannot create '" + dest + "': Permission denied" };
      return { dir: d.node, name: src.name, parts: d.parts.concat([src.name]) };
    }
    if (d.err && !d.missing) return { err: d.err };
    var p = this.resolveParent(dest, cmd);
    if (p.err) return { err: p.err };
    if (p.dir.r && !this.root) return { err: cmd + ": cannot create '" + dest + "': Permission denied" };
    return { dir: p.dir, name: p.name, parts: p.parts };
  };

  Shell.prototype.cmd_cp = function (rawArgs) {
    var p = parseFlags(rawArgs);
    if (p.args.length < 2) { this._err(p.args.length ? "cp: missing destination file operand after '" + p.args[0] + "'" : "cp: missing file operand"); return; }
    var dest = p.args[p.args.length - 1], self = this;
    p.args.slice(0, -1).forEach(function (path) {
      var src = self.resolve(path, "cp");
      if (src.err) { self._err(src.gate ? src.err : "cp: cannot stat '" + path + "': " + src.err.split(": ").pop()); return; }
      if (src.node.t === "d" && !(p.flags.r || p.flags.R)) { self._err("cp: -r not specified; omitting directory '" + path + "'"); return; }
      if (src.node.t === "d" && containsSpecial(src.node)) { self._err("cp: the well resists being copied"); return; }
      var t = self.destFor(src, dest, "cp");
      if (t.err) { self._err(t.err); return; }
      var existing = t.dir.c[t.name];
      if (existing === src.node) { self._err("cp: '" + path + "' and '" + dest + "' are the same file"); return; }
      if (existing && existing.t === "d" && src.node.t === "f") { self._err("cp: cannot overwrite directory '" + dest + "' with non-directory"); return; }
      if (existing && existing.s) { self._err("cp: cannot overwrite '" + dest + "': it is carved from the well itself"); return; }
      t.dir.c[t.name] = cloneNode(src.node);
    });
  };

  Shell.prototype.cmd_mv = function (args) {
    if (args.length < 2) { this._err(args.length ? "mv: missing destination file operand after '" + args[0] + "'" : "mv: missing file operand"); return; }
    var dest = args[args.length - 1], self = this;
    args.slice(0, -1).forEach(function (path) {
      var src = self.resolve(path, "mv");
      if (src.err) { self._err(src.gate ? src.err : "mv: cannot stat '" + path + "': " + src.err.split(": ").pop()); return; }
      if (!self.guardRemove(src, path, "mv")) return;
      if (src.node.f || (src.node.t === "d" && containsSpecial(src.node))) { self._err("mv: cannot move '" + path + "': it is carved from the well itself"); return; }
      if (src.parent.r && !self.root) { self._err("mv: cannot move '" + path + "': Permission denied"); return; }
      var t = self.destFor(src, dest, "mv");
      if (t.err) { self._err(t.err); return; }
      if (isPrefix(src.parts, t.parts)) { self._err("mv: cannot move '" + path + "' to a subdirectory of itself"); return; }
      var existing = t.dir.c[t.name];
      if (existing === src.node) return;
      if (existing && existing.t === "d") { self._err("mv: cannot overwrite directory '" + dest + "'"); return; }
      if (existing && existing.s) { self._err("mv: cannot overwrite '" + dest + "': it is carved from the well itself"); return; }
      delete src.parent.c[src.name];
      t.dir.c[t.name] = src.node;
    });
  };

  // ---- tab completion ----
  // Returns { line, options } -- line is the completed line (may be unchanged).
  Shell.prototype.complete = function (line) {
    var words = line.split(" ");
    var last = words[words.length - 1];
    var candidates;
    var isCmd = words.length === 1 || (words.length === 2 && words[0] === "sudo");
    if (isCmd) {
      candidates = Object.keys(COMMANDS).filter(function (c) { return c.indexOf(last) === 0; });
      candidates = candidates.map(function (c) { return { full: c, show: c, dir: false }; });
    } else {
      var slash = last.lastIndexOf("/");
      var dirPart = slash === -1 ? "" : last.slice(0, slash + 1);
      var base = slash === -1 ? last : last.slice(slash + 1);
      var r = this.resolve(dirPart === "" ? "." : dirPart, "", { silent: true });
      if (!r.node || r.node.t !== "d") return { line: line, options: [] };
      candidates = Object.keys(r.node.c).sort().filter(function (n) {
        return n.indexOf(base) === 0 && (base.charAt(0) === "." || n.charAt(0) !== ".") &&
          (words[0] !== "cd" || r.node.c[n].t === "d");
      }).map(function (n) {
        var isDir = r.node.c[n].t === "d";
        return { full: dirPart + n + (isDir ? "/" : ""), show: n + (isDir ? "/" : ""), dir: isDir };
      });
    }
    if (candidates.length === 0) return { line: line, options: [] };
    if (candidates.length === 1) {
      words[words.length - 1] = candidates[0].full + (candidates[0].dir ? "" : " ");
      return { line: words.join(" "), options: [] };
    }
    // Longest common prefix.
    var prefix = candidates[0].full;
    candidates.forEach(function (c) { while (c.full.indexOf(prefix) !== 0) prefix = prefix.slice(0, -1); });
    words[words.length - 1] = prefix.length > last.length ? prefix : last;
    return { line: words.join(" "), options: prefix.length > last.length ? [] : candidates.map(function (c) { return c.show; }) };
  };

  // ---------------------------------------------------------------------------
  // 4. UI -- only runs in the browser.
  // ---------------------------------------------------------------------------

  var ui = {
    unlocked: false,
    visible: false,
    shell: null,
    el: null, screen: null, input: null, promptEl: null,
    histIndex: null, mode: "normal", pager: null
  };

  function loadSave() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ui.shell.save())); } catch (e) {}
  }

  function buildDom() {
    if (ui.el) return;
    var pane = document.getElementById("output");
    ui.el = document.createElement("div");
    ui.el.id = "terminal-1337";
    ui.el.innerHTML =
      '<div class="t1337-screen"></div>' +
      '<div class="t1337-line"><span class="t1337-prompt"></span>' +
      '<input class="t1337-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>';
    pane.appendChild(ui.el);
    ui.screen = ui.el.querySelector(".t1337-screen");
    ui.input = ui.el.querySelector(".t1337-input");
    ui.promptEl = ui.el.querySelector(".t1337-prompt");
    ui.el.addEventListener("click", function () {
      if (window.getSelection && String(window.getSelection())) return; // allow copying text
      ui.input.focus();
    });
    ui.input.addEventListener("keydown", onKey);
  }

  function addLine(line) {
    var div = document.createElement("div");
    div.className = "t1337-out";
    if (line.parts) {
      line.parts.forEach(function (p) {
        var span = document.createElement("span");
        span.className = "t1337-item " + (p.cls ? "t1337-" + p.cls : "");
        span.textContent = p.text;
        div.appendChild(span);
      });
    } else {
      if (line.cls) div.className += " t1337-" + line.cls;
      div.textContent = line.text === "" ? "\u00a0" : line.text;
    }
    ui.screen.appendChild(div);
  }
  function addLines(lines) { lines.forEach(addLine); scrollDown(); }
  function scrollDown() { ui.el.scrollTop = ui.el.scrollHeight; }

  function setPrompt() {
    if (ui.mode === "password") { ui.promptEl.textContent = "Password: "; }
    else if (ui.mode === "pager") { ui.promptEl.textContent = ""; }
    else { ui.promptEl.textContent = ui.shell.prompt(); }
    ui.input.type = ui.mode === "password" ? "password" : "text";
  }

  function echoCommand(text) {
    addLine({ text: ui.shell.prompt() + text, cls: "cmd" });
  }

  function handleResult(res) {
    if (res.clear) ui.screen.innerHTML = "";
    if (res.reset) boot(true);
    addLines(res.lines);
    if (res.password) ui.mode = "password";
    if (res.pager) startPager(res.pager);
    if (res.exit) { persist(); hide(); return; }
    persist();
    setPrompt();
    scrollDown();
  }

  // ---- less ----
  function pageSize() {
    var lineHeight = 18;
    return Math.max(5, Math.floor(ui.el.clientHeight / lineHeight) - 3);
  }
  function startPager(lines) {
    ui.mode = "pager";
    ui.pager = { lines: lines, pos: 0 };
    ui.screen.innerHTML = "";
    showPage();
  }
  function showPage() {
    var pg = ui.pager, n = pageSize();
    if (pg.pos === 0) ui.screen.innerHTML = "";
    var chunk = pg.lines.slice(pg.pos, pg.pos + n);
    pg.pos += chunk.length;
    addLines(chunk);
    var old = ui.screen.querySelector(".t1337-more");
    if (old) old.parentNode.removeChild(old);
    if (pg.pos >= pg.lines.length) {
      addLine({ text: "(END)  -- press q --", cls: "more" });
    } else {
      addLine({ text: "-- more (" + Math.round(100 * pg.pos / pg.lines.length) + "%) --  space: next page   enter: next line   q: quit", cls: "more" });
    }
    ui.screen.lastChild.classList.add("t1337-more");
    scrollDown();
  }
  function pagerKey(e) {
    e.preventDefault();
    var pg = ui.pager;
    if (e.key === "q" || e.key === "Q" || e.key === "Escape") {
      ui.mode = "normal"; ui.pager = null;
      ui.screen.innerHTML = "";
      addLine({ text: "(you close the book)", cls: "dim" });
      setPrompt();
      return;
    }
    if (pg.pos >= pg.lines.length) return;
    if (e.key === " " || e.key === "PageDown" || e.key === "f") {
      showPage();
    } else if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "j") {
      var old = ui.screen.querySelector(".t1337-more");
      if (old) old.parentNode.removeChild(old);
      addLine(pg.lines[pg.pos++]);
      addLine({ text: pg.pos >= pg.lines.length ? "(END)  -- press q --" : "-- more --", cls: "more" });
      ui.screen.lastChild.classList.add("t1337-more");
      scrollDown();
    }
  }

  function onKey(e) {
    if (ui.mode === "pager") { pagerKey(e); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      var text = ui.input.value;
      ui.input.value = "";
      if (ui.mode === "password") {
        ui.mode = "normal";
        addLine({ text: "Password: ", cls: "cmd" });
        handleResult(ui.shell.submitPassword(text));
        return;
      }
      ui.histIndex = null;
      echoCommand(text);
      handleResult(ui.shell.exec(text));
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (ui.mode !== "normal") return;
      e.preventDefault();
      var hist = ui.shell.s.hist;
      if (!hist.length) return;
      if (ui.histIndex === null) ui.histIndex = hist.length;
      ui.histIndex += (e.key === "ArrowUp") ? -1 : 1;
      ui.histIndex = Math.max(0, Math.min(hist.length, ui.histIndex));
      ui.input.value = hist[ui.histIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (ui.mode !== "normal") return;
      var c = ui.shell.complete(ui.input.value);
      ui.input.value = c.line;
      if (c.options.length) {
        echoCommand(c.line);
        addLines([{ parts: c.options.map(function (o) { return { text: o, cls: /\/$/.test(o) ? "dir" : "" }; }) }]);
      }
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      echoCommand(ui.input.value + "^C");
      ui.input.value = "";
      ui.mode = "normal";
      setPrompt();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      ui.screen.innerHTML = "";
    }
  }

  function boot(fresh) {
    var s = ui.shell.s;
    var lines = [];
    if (!fresh && s.hist.length) {
      lines.push({ text: "Welcome back. You are where you left off.", cls: "dim" });
      if (s.won) lines.push({ text: "(You've already reached the bottom. `reset` for a new well.)", cls: "dim" });
    } else {
      lines.push({ text: "signal received: 1 3 3 7", cls: "good" });
      lines.push({ text: "something opens beneath the Output console...", cls: "dim" });
      lines.push({ text: "" });
      s.visited[0] = true;
      LEVEL_INTROS[0].art.forEach(function (a) { lines.push({ text: a, cls: "glow" }); });
      lines.push({ text: "" });
      lines.push({ text: LEVEL_INTROS[0].text, cls: "dim" });
      lines.push({ text: "(new to terminals? type `help`, or `cat README`)", cls: "dim" });
    }
    addLines(lines);
  }

  function show() {
    buildDom();
    var consoleOut = document.getElementById("console-output");
    var h = consoleOut.style.height || (consoleOut.offsetHeight ? consoleOut.offsetHeight + "px" : "");
    if (h) ui.el.style.height = h;
    consoleOut.style.display = "none";
    ui.el.style.display = "block";
    if (!ui.shell) {
      ui.shell = new Shell(loadSave());
      ui.mode = "normal";
      boot(false);
      persist();
    }
    setPrompt();
    ui.visible = true;
    if (typeof $ !== "undefined") $("#output-tabs a[href=\"#output\"]").tab("show");
    setTimeout(function () { try { ui.input.focus(); } catch (e) {} scrollDown(); }, 50);
  }

  function hide() {
    if (!ui.el) return;
    ui.el.style.display = "none";
    var consoleOut = document.getElementById("console-output");
    if (consoleOut) consoleOut.style.display = "";
    ui.visible = false;
  }

  var Terminal1337 = {
    Shell: Shell,
    generateWorld: generateWorld,
    secretPhrase: secretPhrase,

    onExerciseLoaded: function (number) {
      if (Number(number) !== EXERCISE) {
        ui.unlocked = false;
        hide();
      }
    },
    onRunStart: function () { hide(); },
    onGraded: function (number, correct) {
      if (Number(number) !== EXERCISE || !correct) return;
      var first = !ui.unlocked;
      ui.unlocked = true;
      // Give the student a moment to see their (correct!) gif first.
      setTimeout(show, first ? 1800 : 600);
    },
    // Re-open after `exit` without re-running (only once unlocked this session).
    open: function () { if (ui.unlocked) show(); }
  };

  global.Terminal1337 = Terminal1337;
  if (typeof module !== "undefined" && module.exports) module.exports = Terminal1337;
})(typeof window !== "undefined" ? window : this);
