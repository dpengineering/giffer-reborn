#!/usr/bin/env node
// Builds exercises/<N>/Exercise_<N>.FrameManager (what the site loads) from the exercise's files,
// so you no longer have to run the answer and use Tools > Export Exercise by hand.
//
//   node tools/build-exercise.js 31          build exercise 31
//   node tools/build-exercise.js 31 40 41    build several
//   node tools/build-exercise.js 31 --check  build in memory and compare with the current file
//                                            (nothing is written)
//   node tools/build-exercise.js --all       check every exercise that has an answer key
//                                            (check only: some old answer keys no longer match
//                                            their .FrameManager, so build those on purpose)
//   node tools/build-exercise.js 31 --show   also print the starting code students will get
//
// What an exercise folder needs (N = exercise number):
//   exercises/N/ExerciseN.html                     directions (Tips & Tricks tab)
//   exercises/N/ExerciseN/ExerciseN.ino            answer key
// Optional:
//   exercises/N/ExerciseN_StartingPoint/ExerciseN_StartingPoint.ino
//       starting code, used when the answer key has no //@todo or //@hide markers.
//       When it does, this file (plus a _NoComments copy) is written for you instead.
//   exercises/N/exercise.json   {"board": {"type": "LED Board", "setup": {"pinKeyframes": [...]}},
//                                "vars": {"ON": [100, 200]}}
//       Without a board here, the board saved in the old .FrameManager is kept (LED Board otherwise).
//
// Per-student timings and starter-code markers: see the top of js/exerciseTemplate.js.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");

const repo = path.join(__dirname, "..");
const T = require(path.join(repo, "js/exerciseTemplate.js"));
const MAX_VARIANTS = 400;

// ---- Running Arduino code with the site's own interpreter ---------------------------

const boardSource = fs.readFileSync(path.join(repo, "js/Board.js"), "utf8");
function prefixFor(boardType) {
  const pick = name => {
    const m = new RegExp(name + "\\.prototype\\.codePrefix = (Board\\.prototype\\.codePrefix \\+ )?`([\\s\\S]*?)`;").exec(boardSource);
    return m ? (m[1] ? pick("Board") : "") + m[2] : null;
  };
  if (boardType === "KS Board") { return pick("KSBoard"); }
  if (boardType === "Light Sculpture") { return pick("LightSculptureBoard"); }
  return pick("Board");
}
const defaultSuffix = fs.readFileSync(path.join(repo, "js/main.js"), "utf8").match(/var defaultSuffix = `([\s\S]*?)`;/)[1];

// Runs code the way the browser's worker does and returns the FrameManager (plain object).
function runSketch(code, board, suffix) {
  const ctx = { console: { log() {}, warn() {}, error: console.error } };
  ctx.self = ctx; ctx.global = ctx; ctx.location = { search: "" };
  let result = null, output = "";
  ctx.postMessage = m => {
    const o = JSON.parse(m);
    if (o.type === "frameManager") { result = JSON.parse(o.frameManager); }
    else if (o.type === "output") { output += o.text; }
  };
  let handler;
  ctx.addEventListener = (t, h) => { handler = h; };
  ctx.importScripts = f => vm.runInContext(fs.readFileSync(path.join(repo, "js", f.split("?")[0]), "utf8"), ctx, { filename: f });
  vm.createContext(ctx);
  ctx.importScripts("JSCPP-WebWorker.js");
  const full = prefixFor(board.type) + code + (suffix || defaultSuffix);
  handler({ data: { type: "code", code: full, pinKeyframes: (board.setup && board.setup.pinKeyframes) || [], debugging: false, boardType: board.type } });
  if (!result) { throw new Error("The answer key didn't finish running."); }
  // Same shape the browser saves (it marks the key as graded/correct).
  result.isGraded = true;
  result.grade = true;
  return result;
}

// ---- Finding an exercise's files ---------------------------------------------------

function findFile(dir, candidates) {
  for (const c of candidates) {
    const p = path.join(dir, c);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) { return p; }
  }
  return null;
}
function firstIno(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { return null; }
  const f = fs.readdirSync(dir).filter(x => /\.ino$/i.test(x)).sort()[0];
  return f ? path.join(dir, f) : null;
}

function locate(num) {
  const dir = path.join(repo, "exercises", String(num));
  if (!fs.existsSync(dir)) { throw new Error("No folder exercises/" + num); }
  const answer = findFile(dir, ["Exercise" + num + "/Exercise" + num + ".ino", "Exercise_" + num + "/Exercise" + num + ".ino",
                                "Exercise_" + num + "/Exercise_" + num + ".ino", "answer.ino"])
    || firstIno(path.join(dir, "Exercise" + num)) || firstIno(path.join(dir, "Exercise_" + num));
  const directions = findFile(dir, ["Exercise" + num + ".html", "directions.html"]);
  const starterDir = path.join(dir, "Exercise" + num + "_StartingPoint");
  const starter = findFile(starterDir, ["Exercise" + num + "_StartingPoint.ino"]) || firstIno(starterDir);
  const config = findFile(dir, ["exercise.json"]);
  const output = path.join(dir, "Exercise_" + num + ".FrameManager");
  return { dir, answer, directions, starter, starterDir, config, output };
}

// ---- Building ------------------------------------------------------------------------

function build(num, opts) {
  const f = locate(num);
  if (!f.answer) { throw new Error("No answer key found (expected exercises/" + num + "/Exercise" + num + "/Exercise" + num + ".ino)"); }
  const answerSource = fs.readFileSync(f.answer, "utf8");
  const config = f.config ? JSON.parse(fs.readFileSync(f.config, "utf8")) : {};
  let old = null;
  if (fs.existsSync(f.output)) { try { old = JSON.parse(fs.readFileSync(f.output, "utf8")); } catch (e) { old = null; } }

  const header = T.parseHeader(answerSource);
  const vars = Object.assign({}, header.vars);
  Object.keys(config.vars || {}).forEach(k => { vars[k] = T.normalizeChoices(config.vars[k]); });

  let board = config.board || (old && old.board) || { type: "LED Board", setup: { pinKeyframes: [] } };
  if (header.board) { board = { type: header.board, setup: (board.type === header.board && board.setup) || { pinKeyframes: [] } }; }
  if (!board.setup) { board.setup = { pinKeyframes: [] }; }

  const parts = T.split(answerSource);
  const notes = [];
  let starter;
  if (parts.hasMarkers) {
    starter = parts.starter;
    notes.push("starting code made from the answer key's markers");
  } else if (f.starter) {
    starter = fs.readFileSync(f.starter, "utf8");
    notes.push("starting code from " + path.relative(repo, f.starter));
  } else if (old && old.startingCode) {
    starter = old.startingCode;
    notes.push("starting code kept from the old .FrameManager");
  } else {
    starter = "";
    notes.push("no starting code");
  }
  const directions = f.directions ? fs.readFileSync(f.directions, "utf8") : (old && old.directions) || "";
  if (!f.directions) { notes.push(old && old.directions ? "directions kept from the old .FrameManager" : "no directions"); }
  const suffix = config.suffix || (old && old.suffix) || defaultSuffix;

  // Every {{NAME}} has to be a known variable (fill throws otherwise).
  const names = Object.keys(vars);
  const sample = T.pickValues(vars, "sample", num);
  [["answer key", parts.answer], ["starting code", starter], ["directions", directions]].forEach(([what, text]) => {
    try { T.fill(text, sample); } catch (e) { throw new Error(what + ": " + e.message); }
  });
  if (!names.length && [parts.answer, starter, directions].some(T.usesPlaceholders)) {
    throw new Error("Uses {{...}} but has no //@vary lines");
  }

  const variants = T.countVariants(vars);
  if (variants > MAX_VARIANTS) { throw new Error(variants + " combinations is too many to check (max " + MAX_VARIANTS + "); use fewer choices"); }

  // Run every combination so a broken one is caught now, not by a student.
  const combos = T.allValues(vars);
  const timings = new Set();
  let frameManager = null;
  combos.forEach(values => {
    let fm;
    try { fm = runSketch(T.fill(parts.answer, values), board, suffix); }
    catch (e) { throw new Error("Answer key failed" + (names.length ? " with " + JSON.stringify(values) : "") + ": " + (e.message || e)); }
    if (!names.length) { frameManager = fm; }
    timings.add(JSON.stringify(fm.frames));
  });
  if (names.length && timings.size < combos.length) {
    notes.push("warning: only " + timings.size + " of " + combos.length + " combinations give different gifs");
  }

  const bundle = {
    number: String(num),
    version: 2,
    startingCode: starter,
    startingCodeBare: T.stripComments(starter),
    suffix: suffix,
    board: board,
    directions: directions
  };
  if (names.length) {
    bundle.vars = vars;
    bundle.answerKey = T.encode(parts.answer);   // run in the browser with each student's values
  } else {
    bundle.frameManager = frameManager;
  }

  const summary = "Exercise " + num + ": " + (names.length
    ? names.map(n => n + " = " + vars[n].join("/")).join(", ") + " -> " + combos.length + " versions (a table of 4 all different " + Math.round(100 * pAllDifferent(combos.length, 4)) + "% of the time)"
    : (frameManager.frames.length + " frames, same for everyone"));

  if (opts.show) {
    console.log("---- starting code (with comments) ----\n" + T.fill(starter, sample));
    console.log("---- starting code (no comments) ----\n" + T.fill(bundle.startingCodeBare, sample));
  }

  if (opts.check) {
    return { summary, notes, diff: old ? compare(old, bundle) : ["no existing file"] };
  }

  fs.writeFileSync(f.output, JSON.stringify(bundle));
  if (parts.hasMarkers) {
    fs.mkdirSync(f.starterDir, { recursive: true });
    const base = path.join(f.starterDir, "Exercise" + num + "_StartingPoint");
    fs.writeFileSync(base + ".ino", starter);
    fs.writeFileSync(base + "_NoComments.ino", bundle.startingCodeBare);
    notes.push("wrote " + path.relative(repo, base) + ".ino and _NoComments.ino");
  }
  return { summary, notes, wrote: path.relative(repo, f.output) };
}

// Chance that k students (e.g. a table) all get different versions.
function pAllDifferent(n, k) {
  let p = 1;
  for (let i = 0; i < k; i++) { p *= Math.max(0, n - i) / n; }
  return p;
}

// For --check: does the new build grade the same as the current file?
function compare(old, bundle) {
  const diffs = [];
  if (old.frameManager && bundle.frameManager) {
    const a = old.frameManager.frames, b = bundle.frameManager.frames;
    if (a.length !== b.length) { diffs.push("frame count " + a.length + " -> " + b.length); }
    else {
      for (let i = 0; i < a.length; i++) {
        const strip = fr => JSON.stringify({ s: fr.ledStates, m: fr.ledModes, d: fr.postDelay, o: (fr.outputText || []).map(t => String(t).trim()) });
        if (strip(a[i]) !== strip(b[i])) { diffs.push("frame " + i + " differs"); break; }
      }
    }
  } else if (bundle.vars && !old.vars) {
    diffs.push("now has per-student timings");
  } else if (bundle.vars) {
    if (JSON.stringify(old.vars) !== JSON.stringify(bundle.vars)) { diffs.push("timing choices changed"); }
    if (old.answerKey !== bundle.answerKey) { diffs.push("answer key changed"); }
  } else if (old.vars) {
    diffs.push("no longer has per-student timings");
  }
  if ((old.startingCode || "").trim() !== (bundle.startingCode || "").trim()) { diffs.push("starting code changed"); }
  if ((old.directions || "") !== (bundle.directions || "")) { diffs.push("directions changed"); }
  if (JSON.stringify(old.board) !== JSON.stringify(bundle.board)) { diffs.push("board changed"); }
  return diffs;
}

// ---- CLI -----------------------------------------------------------------------------

function main(argv) {
  const opts = { check: argv.includes("--check"), show: argv.includes("--show") };
  let nums = argv.filter(a => /^\d+$/.test(a));
  if (argv.includes("--all")) {
    opts.check = true;
    nums = fs.readdirSync(path.join(repo, "exercises")).filter(d => /^\d+$/.test(d) && locate(d).answer).sort((a, b) => a - b);
  }
  if (!nums.length) {
    console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 26).map(l => l.replace(/^\/\/ ?/, "")).join("\n"));
    return 1;
  }
  let failed = 0;
  nums.forEach(n => {
    try {
      const r = build(n, opts);
      console.log((opts.check ? (r.diff.length ? "DIFF " : "same ") : "ok   ") + r.summary);
      r.notes.forEach(x => console.log("       " + x));
      if (opts.check && r.diff.length) { console.log("       " + r.diff.join("; ")); }
      if (r.wrote) { console.log("       wrote " + r.wrote); }
    } catch (e) {
      failed++;
      console.log("FAIL Exercise " + n + ": " + (e.message || e));
    }
  });
  return failed ? 1 : 0;
}

if (require.main === module) { process.exitCode = main(process.argv.slice(2)); }
module.exports = { build, runSketch, prefixFor, locate };
