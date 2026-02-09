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

  evaluate(expression) {
    const ast = this.tokenizeAndParse(expression);
    const result = this.evalNode(ast);
    this.vars.ans = result;
    this.history.push({ expression, result });
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

// Example usage:
const calc = new Calculator();

console.log(calc.evaluate("2 + 3 * (4 - 1)")); // 11
console.log(calc.evaluate("x = 5"));
console.log(calc.evaluate("y = 2"));
console.log(calc.evaluate("sqrt(x^2 + y^2)")); // 5.385...
console.log(calc.evaluate("sin(rad(90))")); // 1
console.log(calc.evaluate("5! + 10")); // 130
console.log(calc.evaluate("log(1000, 10)")); // 3

calc.memoryAdd(calc.evaluate("25"));
console.log(calc.memoryRecall()); // 25
