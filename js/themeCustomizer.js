// Editor theme customizer (Tools > Change Theme).
//
// A theme = a built-in Ace theme ("base") + the colors the student changed on top of it, plus
// font, size, line spacing and wrapping. Saved in localStorage as "giffer-editor-theme".
// Changed colors are applied with a <style> block scoped to one editor (#editor for the real one,
// #theme-preview for the live preview in the modal), so the preview never touches the real editor
// until Apply.
//
// Also adds Arduino highlighting to Ace's C++ mode (pinMode, digitalWrite, HIGH, LOW, Serial...),
// like the Arduino IDE, so those words get their own colors.

var ThemeCustomizer = (function () {
  var STORAGE_KEY = "giffer-editor-theme";

  // Every color a student can change.
  //   probe: which element of a fake editor to read the theme's own color from (see readThemeColors)
  //   css:   the rule(s) that apply the student's color; P is the editor selector (#editor)
  var COLORS = [
    {key: "background", label: "Background", group: "Editor", probe: ["", "background-color"],
     css: function (P, v) { return P + ".ace_editor{background-color:" + v + "}"; }},
    {key: "text", label: "Text", group: "Editor", probe: ["", "color"],
     css: function (P, v) { return P + ".ace_editor{color:" + v + "}"; }},
    {key: "gutter", label: "Line number area", group: "Editor", probe: ["ace_gutter", "background-color"],
     css: function (P, v) { return P + " .ace_gutter{background:" + v + "}"; }},
    {key: "gutterText", label: "Line numbers", group: "Editor", probe: ["ace_gutter", "color"],
     css: function (P, v) { return P + " .ace_gutter{color:" + v + "}"; }},
    {key: "activeLine", label: "Current line", group: "Editor", probe: ["ace_marker-layer ace_active-line", "background-color"],
     css: function (P, v) { return P + " .ace_marker-layer .ace_active-line{background:" + v + "}" + P + " .ace_gutter-active-line{background:" + v + "}"; }},
    {key: "selection", label: "Selection", group: "Editor", probe: ["ace_marker-layer ace_selection", "background-color"],
     css: function (P, v) { return P + " .ace_marker-layer .ace_selection{background:" + v + "}"; }},
    {key: "cursor", label: "Cursor", group: "Editor", probe: ["ace_cursor-layer ace_cursor", "color"],
     css: function (P, v) { return P + " .ace_cursor{color:" + v + ";border-left-color:" + v + "}"; }},

    {key: "comment", label: "Comments", sample: "// note", group: "Code", probe: ["ace_comment", "color"],
     css: function (P, v) { return P + " .ace_comment{color:" + v + "}"; }},
    {key: "keyword", label: "Keywords", sample: "if for return", group: "Code", probe: ["ace_keyword", "color"],
     css: function (P, v) { return P + " .ace_keyword:not(.ace_operator){color:" + v + "}"; }},
    {key: "type", label: "Types", sample: "int void", group: "Code", probe: ["ace_storage ace_type", "color"],
     css: function (P, v) { return P + " .ace_storage{color:" + v + "}"; }},
    {key: "arduinoFunction", label: "Arduino functions", sample: "pinMode Serial", group: "Code", probe: ["ace_support ace_function", "color"],
     css: function (P, v) { return P + " .ace_support.ace_function{color:" + v + "}"; }},
    {key: "arduinoConstant", label: "Constants", sample: "HIGH OUTPUT true", group: "Code", probe: ["ace_constant ace_language", "color"],
     css: function (P, v) { return P + " .ace_constant.ace_language{color:" + v + "}"; }},
    {key: "number", label: "Numbers", sample: "13 200", group: "Code", probe: ["ace_constant ace_numeric", "color"],
     css: function (P, v) { return P + " .ace_constant.ace_numeric{color:" + v + "}"; }},
    {key: "string", label: "Text in quotes", sample: "\"Done!\"", group: "Code", probe: ["ace_string", "color"],
     css: function (P, v) { return P + " .ace_string{color:" + v + "}"; }},
    {key: "operator", label: "Operators", sample: "= + <", group: "Code", probe: ["ace_keyword ace_operator", "color"],
     css: function (P, v) { return P + " .ace_keyword.ace_operator{color:" + v + "}"; }},
  ];

  var FONTS = [
    {value: "default", label: "Default", css: "'dejavu sans mono', menlo, monaco, monospace"},
    {value: "menlo", label: "Menlo / Monaco", css: "menlo, monaco, monospace"},
    {value: "consolas", label: "Consolas", css: "consolas, 'courier new', monospace"},
    {value: "courier", label: "Courier New", css: "'courier new', courier, monospace"},
    {value: "jetbrains", label: "JetBrains Mono", css: "'JetBrains Mono', monospace", google: "JetBrains+Mono:wght@400;700"},
    {value: "fira", label: "Fira Code", css: "'Fira Code', monospace", google: "Fira+Code:wght@400;700"},
    {value: "source", label: "Source Code Pro", css: "'Source Code Pro', monospace", google: "Source+Code+Pro:wght@400;700"},
    {value: "roboto", label: "Roboto Mono", css: "'Roboto Mono', monospace", google: "Roboto+Mono:wght@400;700"},
  ];

  // Starting points; the student can keep changing them.
  var PRESETS = [
    {name: "Arduino IDE", settings: {base: "chrome", colors: {
      background: "#ffffff", text: "#434f54", gutter: "#f7f9f9", gutterText: "#95a5a6",
      comment: "#95a5a6", keyword: "#00979c", type: "#00979c", arduinoFunction: "#d35400",
      arduinoConstant: "#00979c", number: "#434f54", string: "#005c5f", operator: "#434f54"}}},
    {name: "Arduino Dark", settings: {base: "tomorrow_night", colors: {
      background: "#171e21", text: "#dae3e3", gutter: "#1f272a", gutterText: "#5f6b6e", activeLine: "#212b2f",
      selection: "#2f4a52", cursor: "#dae3e3", comment: "#7f8c8d", keyword: "#0ca1a6", type: "#0ca1a6",
      arduinoFunction: "#f39c12", arduinoConstant: "#0ca1a6", number: "#7fcbcd", string: "#7fcbcd", operator: "#dae3e3"}}},
    {name: "Projector", settings: {base: "chrome", fontSize: 18, bold: true, colors: {
      background: "#ffffff", text: "#000000", gutter: "#eeeeee", gutterText: "#333333", activeLine: "#fff6c4",
      comment: "#2e7d32", keyword: "#0000d0", type: "#0000d0", arduinoFunction: "#b33c00",
      arduinoConstant: "#7a00b3", number: "#c00000", string: "#a31515", operator: "#000000"}}},
  ];

  var DEFAULTS = {base: "chrome", colors: {}, font: "default", fontSize: 14, lineHeight: "", wrap: true,
                  italicComments: false, bold: false};

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function withDefaults(s) {
    var out = clone(DEFAULTS);
    Object.keys(s || {}).forEach(function (k) { if (s[k] !== undefined && s[k] !== null) { out[k] = s[k]; } });
    out.colors = Object.assign({}, (s && s.colors) || {});
    out.fontSize = Math.min(40, Math.max(6, Number(out.fontSize) || DEFAULTS.fontSize));
    if (["", "1.5", "1.8"].indexOf(String(out.lineHeight)) === -1) { out.lineHeight = ""; }
    return out;
  }

  // ---- Saving -----------------------------------------------------------------
  function load() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { return withDefaults(JSON.parse(saved)); }
      // Older versions saved three separate keys.
      var old = localStorage.getItem("themeValue");
      if (old) {
        return withDefaults({base: old, fontSize: localStorage.getItem("font-size"),
                             wrap: localStorage.getItem("wrapping-check") !== "false"});
      }
    } catch (e) {}
    return withDefaults({});
  }
  function save(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      // Keep the old keys too, in case an older copy of the site is opened.
      localStorage.setItem("themeValue", s.base);
      localStorage.setItem("font-size", s.fontSize);
      localStorage.setItem("wrapping-check", s.wrap);
    } catch (e) {}
  }

  // Theme codes let students share themes: "GIFFER-THEME:" + base64 JSON.
  function exportCode(s) {
    return "GIFFER-THEME:" + btoa(unescape(encodeURIComponent(JSON.stringify(s))));
  }
  function importCode(code) {
    var m = /GIFFER-THEME:([A-Za-z0-9+\/=]+)/.exec(String(code || "").replace(/\s+/g, ""));
    if (!m) { return null; }
    try {
      var s = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      if (!s || typeof s !== "object") { return null; }
      // Only keep valid colors.
      var colors = {};
      Object.keys(s.colors || {}).forEach(function (k) {
        if (COLORS.some(function (c) { return c.key === k; }) && /^#[0-9a-f]{6}$/i.test(s.colors[k])) { colors[k] = s.colors[k]; }
      });
      s.colors = colors;
      if (!/^[a-z0-9_]+$/.test(s.base || "")) { delete s.base; }
      if (!FONTS.some(function (f) { return f.value === s.font; })) { delete s.font; }
      return withDefaults(s);
    } catch (e) { return null; }
  }

  // ---- Applying -----------------------------------------------------------------
  function fontCss(value) {
    var f = FONTS.filter(function (x) { return x.value === value; })[0] || FONTS[0];
    if (f.google && !document.getElementById("font-" + f.value)) {
      var link = document.createElement("link");
      link.id = "font-" + f.value;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=" + f.google + "&display=swap";
      document.head.appendChild(link);
    }
    return f.css;
  }

  function overrideCss(prefix, s) {
    var css = "";
    COLORS.forEach(function (c) {
      var v = s.colors[c.key];
      if (v && /^#[0-9a-f]{6}$/i.test(v)) { css += c.css(prefix, v) + "\n"; }
    });
    if (s.italicComments) { css += prefix + " .ace_comment{font-style:italic}\n"; }
    if (s.bold) { css += prefix + " .ace_keyword:not(.ace_operator)," + prefix + " .ace_storage," + prefix + " .ace_support.ace_function{font-weight:bold}\n"; }
    return css;
  }

  function styleTag(id) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    return el;
  }

  // Apply settings to an Ace editor whose container has the given id.
  // Just the color/style overrides (cheap enough to run while dragging a color picker).
  function applyColors(s, containerId) {
    styleTag(containerId + "-theme-overrides").textContent = overrideCss("#" + containerId, s);
  }

  // onThemeLoaded(themeModule) runs once the base theme's CSS is in.
  function apply(editor, s, containerId, onThemeLoaded) {
    var themeId = "ace/theme/" + s.base;
    editor.setTheme(themeId, function () {
      if (onThemeLoaded && editor.renderer.$themeId === themeId && editor.renderer.theme) { onThemeLoaded(editor.renderer.theme); }
    });
    styleTag(containerId + "-theme-overrides").textContent = overrideCss("#" + containerId, s);
    var container = editor.container;
    container.style.fontSize = s.fontSize + "pt";
    container.style.lineHeight = s.lineHeight || "";
    editor.setOption("fontFamily", fontCss(s.font));
    editor.session.setUseWrapMode(!!s.wrap);
    // Web fonts arrive later; re-measure once they're in.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { try { editor.renderer.updateFontSize(); editor.resize(true); } catch (e) {} });
    }
    try { editor.renderer.updateFontSize(); editor.resize(true); } catch (e) {}
  }

  // ---- Reading a theme's own colors ---------------------------------------------
  // Builds an invisible fake editor with the theme's CSS class and reads the computed colors,
  // so the color pickers start from what the theme really looks like.
  function readThemeColors(theme) {
    var root = document.createElement("div");
    root.className = "ace_editor " + theme.cssClass + (theme.isDark ? " ace_dark" : "");
    root.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;";
    var probes = {};
    COLORS.forEach(function (c) {
      var parent = root;
      var classes = c.probe[0] ? c.probe[0].split(" ") : [];
      var el = root;
      if (classes.length) {
        // "ace_marker-layer ace_active-line" = a .ace_active-line inside a .ace_marker-layer
        var layered = /layer$/.test(classes[0]);
        if (layered) {
          parent = document.createElement("div");
          parent.className = classes[0];
          root.appendChild(parent);
          classes = classes.slice(1);
        } else {
          parent = document.createElement("div");
          parent.className = "ace_text-layer";
          root.appendChild(parent);
        }
        el = document.createElement(layered ? "div" : "span");
        el.className = classes.join(" ");
        el.textContent = "x";
        parent.appendChild(el);
      }
      probes[c.key] = el;
    });
    document.body.appendChild(root);
    var bg = parseColor(getComputedStyle(root).backgroundColor) || [255, 255, 255, 1];
    if (bg[3] < 1) { bg = blend(bg, theme.isDark ? [0, 0, 0, 1] : [255, 255, 255, 1]); }
    var out = {};
    COLORS.forEach(function (c) {
      var rgba = parseColor(getComputedStyle(probes[c.key])[c.probe[1] === "color" ? "color" : "backgroundColor"]);
      if (!rgba || (c.probe[1] !== "color" && rgba[3] === 0)) { rgba = bg; }
      out[c.key] = toHex(rgba[3] < 1 ? blend(rgba, bg) : rgba);
    });
    document.body.removeChild(root);
    return out;
  }
  function parseColor(str) {
    var m = /rgba?\(([^)]+)\)/.exec(str || "");
    if (!m) { return null; }
    var p = m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function blend(fg, bg) {
    var a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
  }
  function toHex(rgba) {
    return "#" + rgba.slice(0, 3).map(function (x) { return ("0" + Math.round(x).toString(16)).slice(-2); }).join("");
  }

  // ---- Arduino highlighting -------------------------------------------------------
  var ARDUINO_FUNCTIONS = ["setup", "loop", "pinMode", "digitalWrite", "digitalRead", "analogRead", "analogWrite",
    "analogReference", "delay", "delayMicroseconds", "millis", "micros", "tone", "noTone", "pulseIn", "shiftOut",
    "shiftIn", "attachInterrupt", "detachInterrupt", "digitalPinToInterrupt", "interrupts", "noInterrupts", "map",
    "constrain", "min", "max", "abs", "pow", "sqrt", "sq", "random", "randomSeed", "bitRead", "bitWrite", "bitSet",
    "bitClear", "bit", "lowByte", "highByte", "Serial"];
  var SERIAL_METHODS = ["begin", "end", "print", "println", "available", "read", "write", "peek", "flush",
    "parseInt", "parseFloat", "readString", "readStringUntil"];
  var ARDUINO_CONSTANTS = ["HIGH", "LOW", "INPUT", "OUTPUT", "INPUT_PULLUP", "LED_BUILTIN", "RISING", "FALLING", "CHANGE"];

  // Calls done(mode): Ace's C++ mode plus the Arduino words above.
  function arduinoMode(done) {
    ace.config.loadModule("ace/mode/c_cpp", function (cpp) {
      var oop = ace.require("ace/lib/oop");
      var CppRules = ace.require("ace/mode/c_cpp_highlight_rules").c_cppHighlightRules;
      function ArduinoRules() {
        CppRules.call(this);
        this.$rules.start.unshift(
          {token: "support.function.arduino", regex: "\\b(?:" + ARDUINO_FUNCTIONS.join("|") + ")\\b"},
          {token: "support.function.arduino", regex: "(?<=\\bSerial\\s*\\.\\s*)(?:" + SERIAL_METHODS.join("|") + ")\\b"},
          {token: "constant.language.arduino", regex: "\\b(?:" + ARDUINO_CONSTANTS.join("|") + ")\\b"});
        this.normalizeRules();
      }
      oop.inherits(ArduinoRules, CppRules);
      function ArduinoMode() {
        cpp.Mode.call(this);
        this.HighlightRules = ArduinoRules;
        this.$id = "ace/mode/arduino";
      }
      oop.inherits(ArduinoMode, cpp.Mode);
      done(new ArduinoMode());
    });
  }

  return {
    COLORS: COLORS, FONTS: FONTS, PRESETS: PRESETS, DEFAULTS: DEFAULTS,
    load: load, save: save, apply: apply, applyColors: applyColors, withDefaults: withDefaults, clone: clone,
    readThemeColors: readThemeColors, exportCode: exportCode, importCode: importCode,
    arduinoMode: arduinoMode
  };
})();
