







const FUNC_ALIASES = {
  'sin⁻¹': 'asin',
  'cos⁻¹': 'acos',
  'tan⁻¹': 'atan',
  '10ˣ': 'tenpow',
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  sqrt: 'sqrt', 
  sqr: 'square',
  log: 'log',
  exp: 'exp',
  ln: 'ln',
  eˣ: 'exp',
  '√': 'sqrt',
}
const FUNC_KEYS = Object.keys(FUNC_ALIASES).sort((a, b) => b.length - a.length)

export class CalcError extends Error {}

function tokenize(src) {
  const tokens = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === ' ') {
      i++
      continue
    }
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      tokens.push({ type: 'num', value: src.slice(i, j) })
      i = j
      continue
    }
    const rest = src.slice(i)
    if (rest.startsWith('mod')) {
      tokens.push({ type: 'op', value: 'mod' })
      i += 3
      continue
    }
    const key = FUNC_KEYS.find((k) => rest.startsWith(k))
    if (key) {
      tokens.push({ type: 'func', value: FUNC_ALIASES[key] })
      i += key.length
      continue
    }
    if (c === '|') {
      tokens.push({ type: 'pipe' })
      i++
      continue
    }
    if (c === 'π') {
      tokens.push({ type: 'num', value: String(Math.PI) })
      i++
      continue
    }
    if (c === 'e') {
      tokens.push({ type: 'num', value: String(Math.E) })
      i++
      continue
    }
    if ('xyzab'.includes(c)) {
      tokens.push({ type: 'var', value: c })
      i++
      continue
    }
    if ('+−×÷^'.includes(c)) {
      tokens.push({ type: 'op', value: c })
      i++
      continue
    }
    if (c === '(' || c === ')') {
      tokens.push({ type: c === '(' ? 'lparen' : 'rparen' })
      i++
      continue
    }
    if (c === '!' || c === '%') {
      tokens.push({ type: 'postfix', value: c })
      i++
      continue
    }
    
    i++
  }
  return tokens
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new CalcError('factorial needs a non-negative whole number')
  if (n > 170) return Infinity
  let r = 1
  for (let k = 2; k <= n; k++) r *= k
  return r
}

function applyFunc(name, x, angleMode) {
  const toRad = (v) => (angleMode === 'deg' ? (v * Math.PI) / 180 : v)
  const fromRad = (v) => (angleMode === 'deg' ? (v * 180) / Math.PI : v)
  switch (name) {
    case 'sin':
      return Math.sin(toRad(x))
    case 'cos':
      return Math.cos(toRad(x))
    case 'tan':
      return Math.tan(toRad(x))
    case 'asin':
      if (x < -1 || x > 1) throw new CalcError('sin⁻¹ needs a value between -1 and 1')
      return fromRad(Math.asin(x))
    case 'acos':
      if (x < -1 || x > 1) throw new CalcError('cos⁻¹ needs a value between -1 and 1')
      return fromRad(Math.acos(x))
    case 'atan':
      return fromRad(Math.atan(x))
    case 'ln':
      if (x <= 0) throw new CalcError('ln needs a positive number')
      return Math.log(x)
    case 'exp':
      return Math.exp(x)
    case 'log':
      if (x <= 0) throw new CalcError('log needs a positive number')
      return Math.log10(x)
    case 'tenpow':
      return Math.pow(10, x)
    case 'sqrt':
      if (x < 0) throw new CalcError('√ needs a non-negative number')
      return Math.sqrt(x)
    case 'square':
      return x * x
    default:
      throw new CalcError('Invalid expression')
  }
}

class Parser {
  constructor(tokens, angleMode, variables) {
    this.tokens = tokens
    this.pos = 0
    this.angleMode = angleMode
    this.variables = variables || {}
  }
  peek() {
    return this.tokens[this.pos]
  }
  next() {
    return this.tokens[this.pos++]
  }

  parseExpression() {
    let value = this.parseTerm()
    while (this.peek() && this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '−')) {
      const op = this.next().value
      const rhs = this.parseTerm()
      value = op === '+' ? value + rhs : value - rhs
    }
    return value
  }

  
  
  
  
  
  
  startsImplicitFactor(tok) {
    return tok && ['num', 'func', 'lparen', 'var'].includes(tok.type)
  }

  parseTerm() {
    let value = this.parsePower()
    while (this.peek() && (this.isMulOp(this.peek()) || this.startsImplicitFactor(this.peek()))) {
      const isExplicit = this.isMulOp(this.peek())
      const op = isExplicit ? this.next().value : '×'
      const rhs = this.parsePower()
      if (op === '÷') {
        if (rhs === 0) throw new CalcError("Can't divide by zero")
        value = value / rhs
      } else if (op === 'mod') {
        if (rhs === 0) throw new CalcError("Can't divide by zero")
        value = value % rhs
      } else {
        value = value * rhs
      }
    }
    return value
  }

  isMulOp(tok) {
    return tok.type === 'op' && ['×', '÷', 'mod'].includes(tok.value)
  }

  parsePower() {
    const base = this.parseUnary()
    if (this.peek() && this.peek().type === 'op' && this.peek().value === '^') {
      this.next()
      const exp = this.parsePower() 
      return Math.pow(base, exp)
    }
    return base
  }

  parseUnary() {
    if (this.peek() && this.peek().type === 'op' && this.peek().value === '−') {
      this.next()
      return -this.parseUnary()
    }
    return this.parsePostfix()
  }

  parsePostfix() {
    let value = this.parsePrimary()
    while (this.peek() && this.peek().type === 'postfix') {
      const op = this.next().value
      value = op === '!' ? factorial(value) : value / 100
    }
    return value
  }

  parsePrimary() {
    const tok = this.peek()
    if (!tok) throw new CalcError('Incomplete expression')

    if (tok.type === 'num') {
      this.next()
      return parseFloat(tok.value)
    }
    if (tok.type === 'func') {
      this.next()
      if (this.peek() && this.peek().type === 'lparen') this.next()
      const arg = this.parseExpression()
      if (this.peek() && this.peek().type === 'rparen') this.next()
      return applyFunc(tok.value, arg, this.angleMode)
    }
    if (tok.type === 'lparen') {
      this.next()
      const value = this.parseExpression()
      if (this.peek() && this.peek().type === 'rparen') this.next()
      return value
    }
    if (tok.type === 'pipe') {
      this.next()
      const value = this.parseExpression()
      if (this.peek() && this.peek().type === 'pipe') this.next()
      return Math.abs(value)
    }
    if (tok.type === 'var') {
      this.next()
      if (!(tok.value in this.variables)) throw new CalcError(`${tok.value} has no value yet`)
      return this.variables[tok.value]
    }
    throw new CalcError('Invalid expression')
  }
}

function evalCore(expr, angleMode, variables) {
  const openCount = (expr.match(/\(/g) || []).length
  const closeCount = (expr.match(/\)/g) || []).length
  let padded = expr + ')'.repeat(Math.max(0, openCount - closeCount))

  const pipeCount = (padded.match(/\|/g) || []).length
  if (pipeCount % 2 === 1) padded += '|'

  const tokens = tokenize(padded)
  const parser = new Parser(tokens, angleMode, variables)
  const result = parser.parseExpression()
  if (typeof result !== 'number' || Number.isNaN(result)) throw new CalcError('Invalid expression')
  if (!isFinite(result)) throw new CalcError('Result is too large')
  return result
}


export function evaluateExpression(expr, angleMode, variables) {
  if (!expr || !expr.trim()) return NaN
  try {
    return evalCore(expr, angleMode, variables)
  } catch {
    return NaN
  }
}


export function evaluateExpressionWithReason(expr, angleMode, variables) {
  if (!expr || !expr.trim()) return { value: NaN, error: 'Invalid expression' }
  try {
    return { value: evalCore(expr, angleMode, variables), error: null }
  } catch (e) {
    return { value: NaN, error: e instanceof CalcError ? e.message : 'Invalid expression' }
  }
}

const INEQUALITY_OPS = ['≤', '≥', '<', '>']


export function solveForX(expr, angleMode) {
  const op = INEQUALITY_OPS.find((o) => expr.includes(o)) || (expr.includes('=') ? '=' : null)
  if (!op) return { result: null, error: 'No = or inequality found to solve' }

  const [lhsStr, rhsStr] = expr.split(op)
  if (lhsStr == null || rhsStr == null || !lhsStr.trim() || !rhsStr.trim()) {
    return { result: null, error: 'Invalid equation' }
  }

  const diffAt = (xVal) => {
    const lhs = evalCore(lhsStr, angleMode, { x: xVal })
    const rhs = evalCore(rhsStr, angleMode, { x: xVal })
    return lhs - rhs
  }

  try {
    const f0 = diffAt(0)
    const f1 = diffAt(1)
    const f2 = diffAt(2)
    const slope = f1 - f0
    const predictedF2 = f0 + slope * 2
    if (Math.abs(predictedF2 - f2) > 1e-6 * (Math.abs(f2) + 1)) {
      return { result: null, error: "Can't solve — not linear in x" }
    }
    if (Math.abs(slope) < 1e-12) {
      return { result: null, error: f0 === 0 ? 'True for every x' : 'No solution' }
    }

    const root = -f0 / slope
    if (op === '=') return { result: `x = ${formatSolved(root)}`, error: null }

    
    
    const wantsPositive = op === '>' || op === '≥'
    const rootIsGreater = slope > 0 ? wantsPositive : !wantsPositive
    const inclusive = op === '≥' || op === '≤'
    const cmp = rootIsGreater ? (inclusive ? '≥' : '>') : inclusive ? '≤' : '<'
    return { result: `x ${cmp} ${formatSolved(root)}`, error: null }
  } catch (e) {
    return { result: null, error: e instanceof CalcError ? e.message : 'Invalid equation' }
  }
}

function formatSolved(n) {
  const rounded = parseFloat(n.toPrecision(10))
  return rounded.toString()
}
