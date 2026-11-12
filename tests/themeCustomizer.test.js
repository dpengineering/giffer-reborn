// Theme customizer storage + share codes (js/themeCustomizer.js). Usage: node tests/themeCustomizer.test.js
const path = require("path");
const store = {};
global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
global.btoa = s => Buffer.from(s, "binary").toString("base64");
global.atob = s => Buffer.from(s, "base64").toString("binary");
const src = require("fs").readFileSync(path.join(__dirname, "../js/themeCustomizer.js"), "utf8");
const T = new Function(src + "; return ThemeCustomizer;")();

let failed = 0;
function check(name, ok, info) { if (!ok) { failed++; } console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "  " + JSON.stringify(info))); }

check("defaults when nothing saved", T.load().base === "chrome" && T.load().fontSize === 14);
store.themeValue = "dracula"; store["font-size"] = "18"; store["wrapping-check"] = "false";
const migrated = T.load();
check("old settings carried over", migrated.base === "dracula" && migrated.fontSize === 18 && migrated.wrap === false, migrated);
const mine = T.withDefaults({ base: "monokai", colors: { comment: "#ff0000" }, font: "fira", italicComments: true });
T.save(mine);
check("save then load", JSON.stringify(T.load()) === JSON.stringify(mine), T.load());
check("old keys kept in sync", store.themeValue === "monokai");
const code = T.exportCode(mine);
check("share code round trip", JSON.stringify(T.importCode("  " + code + "\n")) === JSON.stringify(mine));
check("bad code rejected", T.importCode("hello") === null && T.importCode("GIFFER-THEME:!!!") === null);
const evil = T.exportCode({ base: "x;}body{display:none", colors: { comment: "red;}body{x", text: "#00ff00", nope: "#000000" }, font: "evil" });
const cleaned = T.importCode(evil);
check("share code can't inject CSS", cleaned.base === "chrome" && !cleaned.colors.comment && cleaned.colors.text === "#00ff00" && !cleaned.colors.nope && cleaned.font === "default", cleaned);

console.log(failed ? failed + " failed" : "all passed");
process.exit(failed ? 1 : 0);
