/*
  Complex Calculator
  - Expression parsing with precedence, parentheses, functions, variables
  - Operators: +, -, *, /, %, ^, unary +/-, postfix !
  - Functions: sin, cos, tan, asin, acos, atan, sqrt, cbrt, abs, round,
    floor, ceil, exp, ln, log, min, max, clamp, pow, mod, deg, rad
  - Constants: pi, e
  - Assignments: x = 2 + 3
*/

class Tokenizer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
  }

  isAtEnd() {
    return this.pos >= this.input.length;
  }

  peek() {
    return this.input[this.pos];
  }

  advance() {
    return this.input[this.pos++];
  }

  skipWhitespace() {
    while (!this.isAtEnd() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  numberToken() {
    let start = this.pos;
    let sawDot = false;
    let sawExp = false;
    while (!this.isAtEnd()) {
      const ch = this.peek();
      if (ch >= "0" && ch <= "9") {
        this.advance();
        continue;
      }
      if (ch === "." && !sawDot) {
        sawDot = true;
        this.advance();
        continue;
      }
      if ((ch === "e" || ch === "E") && !sawExp) {
        sawExp = true;
        this.advance();
        if (!this.isAtEnd() && (this.peek() === "+" || this.peek() === "-")) {
          this.advance();
        }
        continue;
      }
      break;
    }
    const raw = this.input.slice(start, this.pos);
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid number: ${raw}`);
    }
    return { type: "number", value };
  }

  identifierToken() {
    let start = this.pos;
    while (!this.isAtEnd() && /[A-Za-z0-9_]/.test(this.peek())) {
      this.advance();
    }
    const value = this.input.slice(start, this.pos);
    return { type: "identifier", value };
  }

  nextToken() {
    this.skipWhitespace();
    if (this.isAtEnd()) return { type: "eof" };

    const ch = this.peek();

    if ((ch >= "0" && ch <= "9") || ch === ".") {
      return this.numberToken();
    }

    if (/[A-Za-z_]/.test(ch)) {
      return this.identifierToken();
    }

    this.advance();
    if ("+-*/%^=!".includes(ch)) {
      return { type: "operator", value: ch };
    }
    if (ch === "(" || ch === ")") {
      return { type: "paren", value: ch };
    }
    if (ch === ",") {
      return { type: "comma" };
    }

    throw new Error(`Unexpected character: ${ch}`);
  }
}

class Parser {
  constructor(input) {
    this.tokenizer = new Tokenizer(input);
    this.current = this.tokenizer.nextToken();
  }

  consume(type, value) {
    if (this.current.type !== type) {
      throw new Error(`Expected ${type} but got ${this.current.type}`);
    }
    if (value !== undefined && this.current.value !== value) {
      throw new Error(`Expected ${value} but got ${this.current.value}`);
    }
    const token = this.current;
    this.current = this.tokenizer.nextToken();
    return token;
  }

  match(type, value) {
    if (this.current.type !== type) return false;
    if (value !== undefined && this.current.value !== value) return false;
    return true;
  }

  parse() {
    const expr = this.parseAssignment();
    if (!this.match("eof")) {
      throw new Error("Unexpected input after expression");
    }
    return expr;
  }

  parseAssignment() {
    const expr = this.parseAddSub();
    if (this.match("operator", "=")) {
      if (expr.type !== "Identifier") {
        throw new Error("Left side of assignment must be a variable");
      }
      this.consume("operator", "=");
      const value = this.parseAssignment();
      return { type: "Assignment", name: expr.name, value };
    }
    return expr;
  }

  parseAddSub() {
    let expr = this.parseMulDiv();
    while (this.match("operator", "+") || this.match("operator", "-")) {
      const op = this.current.value;
      this.consume("operator", op);
      const right = this.parseMulDiv();
      expr = { type: "Binary", op, left: expr, right };
    }
    return expr;
  }

  parseMulDiv() {
    let expr = this.parsePower();
    while (
      this.match("operator", "*") ||
      this.match("operator", "/") ||
      this.match("operator", "%")
    ) {
      const op = this.current.value;
      this.consume("operator", op);
      const right = this.parsePower();
      expr = { type: "Binary", op, left: expr, right };
    }
    return expr;
  }

  parsePower() {
    let expr = this.parseUnary();
    if (this.match("operator", "^")) {
      const op = this.current.value;
      this.consume("operator", op);
      const right = this.parsePower();
      expr = { type: "Binary", op, left: expr, right };
    }
    return expr;
  }

  parseUnary() {
    if (this.match("operator", "+") || this.match("operator", "-")) {
      const op = this.current.value;
      this.consume("operator", op);
      const expr = this.parseUnary();
      return { type: "Unary", op, expr };
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();
    while (this.match("operator", "!")) {
      this.consume("operator", "!");
      expr = { type: "Factorial", expr };
    }
    return expr;
  }

  parsePrimary() {
    if (this.match("number")) {
      const value = this.consume("number").value;
      return { type: "Number", value };
    }
    if (this.match("identifier")) {
      const name = this.consume("identifier").value;
      if (this.match("paren", "(")) {
        this.consume("paren", "(");
        const args = [];
        if (!this.match("paren", ")")) {
          args.push(this.parseAssignment());
          while (this.match("comma")) {
            this.consume("comma");
            args.push(this.parseAssignment());
          }
        }
        this.consume("paren", ")");
        return { type: "Call", name, args };
      }
      return { type: "Identifier", name };
    }
    if (this.match("paren", "(")) {
      this.consume("paren", "(");
      const expr = this.parseAssignment();
      this.consume("paren", ")");
      return expr;
    }
    throw new Error("Expected a number, variable, or '('");
  }
}

class Calculator {
  constructor() {
    this.vars = Object.create(null);
    this.history = [];
    this.memory = 0;
    this.constants = {
      pi: Math.PI,
      e: Math.E,
    };
    this.functions = {
      sin: (x) => Math.sin(x),
      cos: (x) => Math.cos(x),
      tan: (x) => Math.tan(x),
      asin: (x) => Math.asin(x),
      acos: (x) => Math.acos(x),
      atan: (x) => Math.atan(x),
      sqrt: (x) => Math.sqrt(x),
      cbrt: (x) => Math.cbrt(x),
      abs: (x) => Math.abs(x),
      round: (x) => Math.round(x),
      floor: (x) => Math.floor(x),
      ceil: (x) => Math.ceil(x),
      exp: (x) => Math.exp(x),
      ln: (x) => Math.log(x),
      log: (x, base) => {
        if (base === undefined) return Math.log10(x);
        return Math.log(x) / Math.log(base);
      },
      min: (...args) => Math.min(...args),
      max: (...args) => Math.max(...args),
      clamp: (x, min, max) => Math.min(Math.max(x, min), max),
      pow: (x, y) => Math.pow(x, y),
      mod: (x, y) => x % y,
      deg: (rad) => (rad * 180) / Math.PI,
      rad: (deg) => (deg * Math.PI) / 180,
    };
  }

  tokenizeAndParse(expression) {
    if (typeof expression !== "string") {
      throw new Error("Expression must be a string");
    }
    const parser = new Parser(expression);
    return parser.parse();
  }

  evaluate(expression, options = {}) {
    const { record = true } = options;
    const ast = this.tokenizeAndParse(expression);
    const result = this.evalNode(ast);
    if (record) {
      this.vars.ans = result;
      this.history.push({ expression, result, ts: Date.now() });
      if (this.history.length > 50) {
        this.history.shift();
      }
    }
    return result;
  }

  evalNode(node) {
    switch (node.type) {
      case "Number":
        return node.value;
      case "Identifier":
        return this.resolveIdentifier(node.name);
      case "Unary": {
        const value = this.evalNode(node.expr);
        if (node.op === "+") return value;
        if (node.op === "-") return -value;
        throw new Error(`Unknown unary operator: ${node.op}`);
      }
      case "Binary": {
        const left = this.evalNode(node.left);
        const right = this.evalNode(node.right);
        switch (node.op) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            if (right === 0) throw new Error("Division by zero");
            return left / right;
          case "%":
            if (right === 0) throw new Error("Division by zero");
            return left % right;
          case "^":
            return Math.pow(left, right);
          default:
            throw new Error(`Unknown operator: ${node.op}`);
        }
      }
      case "Factorial": {
        const value = this.evalNode(node.expr);
        if (!Number.isFinite(value) || value < 0 || value % 1 !== 0) {
          throw new Error("Factorial requires a non-negative integer");
        }
        if (value > 170) {
          throw new Error("Factorial too large");
        }
        let acc = 1;
        for (let i = 2; i <= value; i++) acc *= i;
        return acc;
      }
      case "Call": {
        const fn = this.functions[node.name];
        if (!fn) {
          throw new Error(`Unknown function: ${node.name}`);
        }
        const args = node.args.map((arg) => this.evalNode(arg));
        return fn(...args);
      }
      case "Assignment": {
        const value = this.evalNode(node.value);
        this.vars[node.name] = value;
        return value;
      }
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  resolveIdentifier(name) {
    if (name in this.vars) return this.vars[name];
    if (name in this.constants) return this.constants[name];
    throw new Error(`Unknown variable: ${name}`);
  }

  // Memory helpers
  memoryClear() {
    this.memory = 0;
  }

  memoryRecall() {
    return this.memory;
  }

  memoryAdd(value) {
    this.memory += value;
  }

  memorySubtract(value) {
    this.memory -= value;
  }

  // Variable helpers
  setVar(name, value) {
    this.vars[name] = value;
  }

  getVar(name) {
    return this.vars[name];
  }

  clearVars() {
    this.vars = Object.create(null);
  }

  clearHistory() {
    this.history = [];
  }
}

const calc = new Calculator();
calc.vars.ans = 0;

const DEFAULT_SETTINGS = {
  live: false,
  precision: 8,
  group: false,
  smart: true,
};
const settings = { ...DEFAULT_SETTINGS };
const storageKey = "prismcalc-state";

const themes = [
  {
    name: "Aurora",
    colors: {
      "--bg": "#fff1e8",
      "--bg-2": "#f4e8ff",
      "--accent-a": "#ff6b6b",
      "--accent-a-soft": "#ffe0df",
      "--accent-b": "#4ecdc4",
      "--accent-b-soft": "#dbf6f2",
      "--accent-c": "#ffd166",
      "--accent-c-soft": "#fff1c5",
      "--accent-d": "#3a86ff",
      "--accent-d-soft": "#dbe9ff",
      "--accent-e": "#f15bb5",
      "--accent-e-soft": "#ffd6ec",
      "--accent-f": "#8338ec",
      "--accent-f-soft": "#ead9ff",
    },
  },
  {
    name: "Citrus",
    colors: {
      "--bg": "#fff7e8",
      "--bg-2": "#e9f9ff",
      "--accent-a": "#ff7849",
      "--accent-a-soft": "#ffe3d4",
      "--accent-b": "#00c2a8",
      "--accent-b-soft": "#ccf4ee",
      "--accent-c": "#ffd93d",
      "--accent-c-soft": "#fff4c4",
      "--accent-d": "#00a8e8",
      "--accent-d-soft": "#d4f1ff",
      "--accent-e": "#f65d81",
      "--accent-e-soft": "#ffd8e3",
      "--accent-f": "#3a0ca3",
      "--accent-f-soft": "#e0d3ff",
    },
  },
  {
    name: "Orbit",
    colors: {
      "--bg": "#f4f1ff",
      "--bg-2": "#e8f4ff",
      "--accent-a": "#ff4d6d",
      "--accent-a-soft": "#ffd6df",
      "--accent-b": "#2ec4b6",
      "--accent-b-soft": "#d6f6f2",
      "--accent-c": "#f9c74f",
      "--accent-c-soft": "#fff0c6",
      "--accent-d": "#4895ef",
      "--accent-d-soft": "#dbe8ff",
      "--accent-e": "#b5179e",
      "--accent-e-soft": "#f1d2ea",
      "--accent-f": "#7209b7",
      "--accent-f-soft": "#e5d2f6",
    },
  },
  {
    name: "Lagoon",
    colors: {
      "--bg": "#f2fbff",
      "--bg-2": "#fef2f9",
      "--accent-a": "#ff8fab",
      "--accent-a-soft": "#ffe0ea",
      "--accent-b": "#06d6a0",
      "--accent-b-soft": "#cff6ea",
      "--accent-c": "#ffd166",
      "--accent-c-soft": "#fff2cf",
      "--accent-d": "#118ab2",
      "--accent-d-soft": "#d2eef8",
      "--accent-e": "#ff5d8f",
      "--accent-e-soft": "#ffd8e6",
      "--accent-f": "#5f0f40",
      "--accent-f-soft": "#f0d5e3",
    },
  },
];
let currentThemeIndex = 0;
let numberFormatter = null;

const libraryData = [
  {
    label: "sin(x)",
    insert: "sin()",
    cursor: -1,
    desc: "Sine (radians).",
    tags: "trig angle",
  },
  {
    label: "cos(x)",
    insert: "cos()",
    cursor: -1,
    desc: "Cosine (radians).",
    tags: "trig angle",
  },
  {
    label: "tan(x)",
    insert: "tan()",
    cursor: -1,
    desc: "Tangent (radians).",
    tags: "trig angle",
  },
  {
    label: "asin(x)",
    insert: "asin()",
    cursor: -1,
    desc: "Arc sine.",
    tags: "trig angle",
  },
  {
    label: "acos(x)",
    insert: "acos()",
    cursor: -1,
    desc: "Arc cosine.",
    tags: "trig angle",
  },
  {
    label: "atan(x)",
    insert: "atan()",
    cursor: -1,
    desc: "Arc tangent.",
    tags: "trig angle",
  },
  {
    label: "rad(deg)",
    insert: "rad()",
    cursor: -1,
    desc: "Degrees to radians.",
    tags: "angle convert",
  },
  {
    label: "deg(rad)",
    insert: "deg()",
    cursor: -1,
    desc: "Radians to degrees.",
    tags: "angle convert",
  },
  {
    label: "sqrt(x)",
    insert: "sqrt()",
    cursor: -1,
    desc: "Square root.",
    tags: "power",
  },
  {
    label: "cbrt(x)",
    insert: "cbrt()",
    cursor: -1,
    desc: "Cube root.",
    tags: "power",
  },
  {
    label: "pow(x, y)",
    insert: "pow()",
    cursor: -1,
    desc: "x to the power of y.",
    tags: "power",
  },
  {
    label: "exp(x)",
    insert: "exp()",
    cursor: -1,
    desc: "e to the power of x.",
    tags: "power",
  },
  {
    label: "ln(x)",
    insert: "ln()",
    cursor: -1,
    desc: "Natural log.",
    tags: "log",
  },
  {
    label: "log(x, base)",
    insert: "log()",
    cursor: -1,
    desc: "Log base 10 or custom base.",
    tags: "log",
  },
  {
    label: "abs(x)",
    insert: "abs()",
    cursor: -1,
    desc: "Absolute value.",
    tags: "rounding",
  },
  {
    label: "round(x)",
    insert: "round()",
    cursor: -1,
    desc: "Round to nearest integer.",
    tags: "rounding",
  },
  {
    label: "floor(x)",
    insert: "floor()",
    cursor: -1,
    desc: "Round down.",
    tags: "rounding",
  },
  {
    label: "ceil(x)",
    insert: "ceil()",
    cursor: -1,
    desc: "Round up.",
    tags: "rounding",
  },
  {
    label: "min(a, b, ...)",
    insert: "min()",
    cursor: -1,
    desc: "Smallest of inputs.",
    tags: "stats",
  },
  {
    label: "max(a, b, ...)",
    insert: "max()",
    cursor: -1,
    desc: "Largest of inputs.",
    tags: "stats",
  },
  {
    label: "clamp(x, min, max)",
    insert: "clamp()",
    cursor: -1,
    desc: "Keep value between bounds.",
    tags: "stats",
  },
  {
    label: "mod(x, y)",
    insert: "mod()",
    cursor: -1,
    desc: "Remainder of division.",
    tags: "stats",
  },
];

function updateFormatter() {
  numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: settings.precision,
    useGrouping: settings.group,
  });
}

function formatValue(value) {
  if (!Number.isFinite(value)) return String(value);
  if (!numberFormatter) updateFormatter();
  const abs = Math.abs(value);
  if (settings.smart && abs !== 0 && (abs < 1e-6 || abs >= 1e9)) {
    const sciPrecision = Math.min(12, Math.max(0, settings.precision));
    return value.toExponential(sciPrecision);
  }
  return numberFormatter.format(value);
}

function ready(fn) {
  if (typeof document === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

function applyTheme(index) {
  if (!themes.length || typeof document === "undefined") return;
  const safeIndex = ((index % themes.length) + themes.length) % themes.length;
  const theme = themes[safeIndex];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(key, value);
  }
  currentThemeIndex = safeIndex;
}

function persistState() {
  if (typeof localStorage === "undefined") return;
  const payload = {
    vars: calc.vars,
    history: calc.history,
    memory: calc.memory,
    settings,
    themeIndex: currentThemeIndex,
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (error) {
    // Ignore storage failures.
  }
}

function loadState() {
  if (typeof localStorage === "undefined") return;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (saved && typeof saved === "object") {
      if (saved.settings && typeof saved.settings === "object") {
        if (typeof saved.settings.live === "boolean") {
          settings.live = saved.settings.live;
        }
        if (Number.isFinite(saved.settings.precision)) {
          settings.precision = Math.min(12, Math.max(0, saved.settings.precision));
        }
        if (typeof saved.settings.group === "boolean") {
          settings.group = saved.settings.group;
        }
      }
      if (Number.isFinite(saved.memory)) {
        calc.memory = saved.memory;
      }
      if (saved.vars && typeof saved.vars === "object") {
        calc.vars = Object.create(null);
        for (const [key, value] of Object.entries(saved.vars)) {
          if (Number.isFinite(value)) {
            calc.vars[key] = value;
          }
        }
      }
      if (!Number.isFinite(calc.vars.ans)) {
        calc.vars.ans = 0;
      }
      if (Array.isArray(saved.history)) {
        calc.history = saved.history
          .filter(
            (item) =>
              item &&
              typeof item.expression === "string" &&
              Number.isFinite(item.result)
          )
          .slice(-50);
      }
      if (Number.isInteger(saved.themeIndex)) {
        currentThemeIndex = saved.themeIndex;
      }
    }
  } catch (error) {
    // Ignore parse errors.
  }
}

loadState();
updateFormatter();

ready(() => {
  const input = document.getElementById("expression");
  if (!input) return;

  const resultEl = document.getElementById("result");
  const statusEl = document.getElementById("status");
  const historyList = document.getElementById("historyList");
  const historySearch = document.getElementById("historySearch");
  const varList = document.getElementById("varList");
  const constList = document.getElementById("constList");
  const memoryValue = document.getElementById("memoryValue");
  const historyCount = document.getElementById("historyCount");
  const varCount = document.getElementById("varCount");
  const libraryList = document.getElementById("libraryList");
  const librarySearch = document.getElementById("librarySearch");
  const libraryCount = document.getElementById("libraryCount");
  const precisionRange = document.getElementById("precisionRange");
  const precisionValue = document.getElementById("precisionValue");
  const precisionBadge = document.getElementById("precisionBadge");
  const liveToggle = document.getElementById("liveToggle");
  const groupToggle = document.getElementById("groupToggle");
  const liveBadge = document.getElementById("liveBadge");
  const themeBadge = document.getElementById("themeBadge");

  let lastResult = calc.vars.ans ?? 0;
  let statusTimer = null;
  let liveTimer = null;

  function setStatus(message, kind, timeout = 2500) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.dataset.kind = kind || "idle";
    if (statusTimer) clearTimeout(statusTimer);
    if (message && timeout > 0) {
      statusTimer = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.dataset.kind = "idle";
      }, timeout);
    }
  }

  function flashResult() {
    if (!resultEl) return;
    resultEl.classList.remove("flash");
    void resultEl.offsetWidth;
    resultEl.classList.add("flash");
  }

  function updateBadges() {
    if (liveBadge) {
      liveBadge.textContent = settings.live ? "On" : "Off";
    }
    if (precisionBadge) {
      precisionBadge.textContent = String(settings.precision);
    }
    if (themeBadge && themes[currentThemeIndex]) {
      themeBadge.textContent = themes[currentThemeIndex].name;
    }
  }

  function updateStats() {
    if (historyCount) historyCount.textContent = String(calc.history.length);
    if (varCount) {
      const userVars = Object.keys(calc.vars).filter((name) => name !== "ans");
      varCount.textContent = String(userVars.length);
    }
  }

  function renderMemory() {
    if (!memoryValue) return;
    memoryValue.textContent = formatValue(calc.memory);
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    const query = (historySearch?.value || "").trim().toLowerCase();
    const filtered = calc.history.filter((item) => {
      if (!query) return true;
      const formatted = formatValue(item.result);
      return (
        item.expression.toLowerCase().includes(query) ||
        formatted.toLowerCase().includes(query)
      );
    });
    const items = filtered.slice(-12).reverse();
    if (items.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No history yet.";
      historyList.appendChild(empty);
      return;
    }
    for (const item of items) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-item";
      button.dataset.expression = item.expression;
      button.textContent = `${item.expression} = ${formatValue(item.result)}`;
      if (item.ts) {
        button.title = new Date(item.ts).toLocaleString();
      }
      li.appendChild(button);
      historyList.appendChild(li);
    }
  }

  function renderVars() {
    if (!varList) return;
    varList.innerHTML = "";
    const entries = Object.entries(calc.vars).sort((a, b) => {
      if (a[0] === "ans") return -1;
      if (b[0] === "ans") return 1;
      return a[0].localeCompare(b[0]);
    });
    if (entries.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No variables saved.";
      varList.appendChild(empty);
      return;
    }
    for (const [name, value] of entries) {
      const li = document.createElement("li");
      li.className = "var-item";
      const key = document.createElement("span");
      key.className = "var-key";
      key.textContent = name;
      const val = document.createElement("span");
      val.className = "var-value";
      val.textContent = formatValue(value);
      li.appendChild(key);
      li.appendChild(val);
      varList.appendChild(li);
    }
  }

  function renderConstants() {
    if (!constList) return;
    constList.innerHTML = "";
    const entries = Object.entries(calc.constants);
    for (const [name, value] of entries) {
      const li = document.createElement("li");
      li.className = "var-item";
      const key = document.createElement("span");
      key.className = "var-key";
      key.textContent = name;
      const val = document.createElement("span");
      val.className = "var-value";
      val.textContent = formatValue(value);
      li.appendChild(key);
      li.appendChild(val);
      constList.appendChild(li);
    }
  }

  function renderLibrary() {
    if (!libraryList) return;
    libraryList.innerHTML = "";
    const query = (librarySearch?.value || "").trim().toLowerCase();
    const filtered = libraryData.filter((item) => {
      if (!query) return true;
      return (
        item.label.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.tags.toLowerCase().includes(query)
      );
    });
    if (libraryCount) libraryCount.textContent = String(filtered.length);
    if (filtered.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No functions match that search.";
      libraryList.appendChild(empty);
      return;
    }
    for (const item of filtered) {
      const li = document.createElement("li");
      li.className = "library-item";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "library-button";
      button.dataset.insert = item.insert;
      if (Number.isFinite(item.cursor)) {
        button.dataset.cursor = String(item.cursor);
      }
      button.textContent = item.label;
      const desc = document.createElement("p");
      desc.className = "library-desc";
      desc.textContent = item.desc;
      li.appendChild(button);
      li.appendChild(desc);
      libraryList.appendChild(li);
    }
  }

  function setResult(value, preview = false) {
    if (!resultEl) return;
    resultEl.textContent = formatValue(value);
    resultEl.dataset.preview = preview ? "true" : "false";
    if (!preview) {
      flashResult();
    }
  }

  function evaluatePreview(expression) {
    const snapshot = calc.vars;
    const tempVars = { ...calc.vars };
    calc.vars = tempVars;
    try {
      return calc.evaluate(expression, { record: false });
    } finally {
      calc.vars = snapshot;
    }
  }

  function evaluateExpression(expression, options = {}) {
    const { record = true, preview = false, status = true } = options;
    const trimmed = expression.trim();
    if (!trimmed) {
      if (status) setStatus("Enter an expression to evaluate.", "warn");
      return null;
    }
    try {
      const result = record
        ? calc.evaluate(trimmed, { record: true })
        : evaluatePreview(trimmed);
      if (record) {
        lastResult = result;
        calc.vars.ans = result;
        setResult(result, false);
        setStatus("Result updated.", "ok");
        renderHistory();
        renderVars();
        renderMemory();
        updateStats();
        persistState();
      } else if (preview) {
        setResult(result, true);
      }
      return result;
    } catch (error) {
      if (status) setStatus(error.message, "error");
      return null;
    }
  }

  function schedulePreview() {
    if (!settings.live) return;
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      if (!input.value.trim()) return;
      evaluateExpression(input.value, { record: false, preview: true, status: false });
    }, 240);
  }

  function insertSnippet(snippet, cursorOffsetFromEnd = 0) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    input.value = before + snippet + after;
    const cursor = Math.max(
      0,
      before.length + snippet.length + cursorOffsetFromEnd
    );
    input.setSelectionRange(cursor, cursor);
    input.focus();
    schedulePreview();
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return Promise.resolve();
  }

  function handleAction(action) {
    switch (action) {
      case "evaluate":
        evaluateExpression(input.value);
        return;
      case "clear":
        input.value = "";
        setStatus("Cleared.", "ok");
        return;
      case "backspace": {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        if (start !== end) {
          input.value = input.value.slice(0, start) + input.value.slice(end);
          input.setSelectionRange(start, start);
        } else if (start > 0) {
          input.value =
            input.value.slice(0, start - 1) + input.value.slice(start);
          input.setSelectionRange(start - 1, start - 1);
        }
        input.focus();
        schedulePreview();
        return;
      }
      case "use-ans":
        insertSnippet("ans");
        return;
      case "mc":
        calc.memoryClear();
        renderMemory();
        setStatus("Memory cleared.", "ok");
        persistState();
        return;
      case "mr":
        insertSnippet(formatValue(calc.memoryRecall()));
        return;
      case "mplus": {
        let value = null;
        if (input.value.trim()) {
          value = evaluateExpression(input.value);
        } else if (Number.isFinite(lastResult)) {
          value = lastResult;
        }
        if (value === null) {
          setStatus("Nothing to add to memory.", "warn");
          return;
        }
        calc.memoryAdd(value);
        renderMemory();
        setStatus("Added to memory.", "ok");
        persistState();
        return;
      }
      case "mminus": {
        let value = null;
        if (input.value.trim()) {
          value = evaluateExpression(input.value);
        } else if (Number.isFinite(lastResult)) {
          value = lastResult;
        }
        if (value === null) {
          setStatus("Nothing to subtract from memory.", "warn");
          return;
        }
        calc.memorySubtract(value);
        renderMemory();
        setStatus("Subtracted from memory.", "ok");
        persistState();
        return;
      }
      case "clear-history":
        calc.clearHistory();
        renderHistory();
        updateStats();
        setStatus("History cleared.", "ok");
        persistState();
        return;
      case "clear-vars":
        calc.clearVars();
        calc.vars.ans = lastResult;
        renderVars();
        updateStats();
        setStatus("Variables cleared.", "ok");
        persistState();
        return;
      case "clear-all":
        calc.clearHistory();
        calc.clearVars();
        calc.memoryClear();
        lastResult = 0;
        calc.vars.ans = 0;
        input.value = "";
        setResult(0, false);
        renderHistory();
        renderVars();
        renderMemory();
        updateStats();
        setStatus("Session reset.", "ok");
        persistState();
        return;
      case "copy-result": {
        const text = resultEl ? resultEl.textContent : String(lastResult);
        copyToClipboard(text)
          .then(() => setStatus("Copied to clipboard.", "ok"))
          .catch(() => setStatus("Copy failed.", "error"));
        return;
      }
      case "shuffle-theme": {
        const nextIndex = (currentThemeIndex + 1) % themes.length;
        applyTheme(nextIndex);
        updateBadges();
        setStatus(`Theme: ${themes[currentThemeIndex].name}`, "ok");
        persistState();
        return;
      }
      case "export-history": {
        const payload = {
          history: calc.history,
          vars: calc.vars,
          memory: calc.memory,
          settings,
          themeIndex: currentThemeIndex,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "prismcalc-session.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setStatus("Session exported.", "ok");
        return;
      }
      default:
        break;
    }
  }

  document.addEventListener("click", (event) => {
    const insertButton = event.target.closest("[data-insert]");
    if (insertButton) {
      const snippet = insertButton.dataset.insert || "";
      const cursor = Number(insertButton.dataset.cursor || 0);
      insertSnippet(snippet, cursor);
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  if (historyList) {
    historyList.addEventListener("click", (event) => {
      const target = event.target.closest("[data-expression]");
      if (!target) return;
      input.value = target.dataset.expression;
      input.focus();
      schedulePreview();
    });
  }

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      evaluateExpression(input.value);
    }
    if (event.key === "Escape") {
      input.value = "";
      setStatus("Cleared.", "ok");
    }
  });

  input.addEventListener("input", () => {
    schedulePreview();
  });

  if (historySearch) {
    historySearch.addEventListener("input", () => renderHistory());
  }

  if (librarySearch) {
    librarySearch.addEventListener("input", () => renderLibrary());
  }

  if (precisionRange) {
    precisionRange.value = String(settings.precision);
    precisionRange.addEventListener("input", () => {
      settings.precision = Number(precisionRange.value);
      updateFormatter();
      if (precisionValue) precisionValue.textContent = String(settings.precision);
      updateBadges();
      renderHistory();
      renderVars();
      renderConstants();
      renderMemory();
      if (resultEl) resultEl.textContent = formatValue(lastResult);
      persistState();
    });
  }

  if (precisionValue) precisionValue.textContent = String(settings.precision);

  if (liveToggle) {
    liveToggle.checked = settings.live;
    liveToggle.addEventListener("change", () => {
      settings.live = liveToggle.checked;
      updateBadges();
      if (settings.live) {
        setStatus("Live preview enabled.", "ok");
        schedulePreview();
      } else {
        setStatus("Live preview off.", "ok");
      }
      persistState();
    });
  }

  if (groupToggle) {
    groupToggle.checked = settings.group;
    groupToggle.addEventListener("change", () => {
      settings.group = groupToggle.checked;
      updateFormatter();
      renderHistory();
      renderVars();
      renderConstants();
      renderMemory();
      if (resultEl) resultEl.textContent = formatValue(lastResult);
      persistState();
    });
  }

  applyTheme(currentThemeIndex);
  updateBadges();
  renderHistory();
  renderVars();
  renderConstants();
  renderLibrary();
  renderMemory();
  updateStats();
  setResult(calc.vars.ans ?? 0, false);
});