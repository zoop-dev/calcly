

import './style.css'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/text-button.js'
import '@material/web/fab/fab.js'
import '@material/web/dialog/dialog.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import { initInstallGate } from 'zoop-kit/install-gate.js'
import { attachBootLoader, removeBootLoaderImmediately } from 'zoop-kit/boot-loader.js'
import { initUpdateCheck } from 'zoop-kit/update-check.js'
import { maybeShowChangelog } from 'zoop-kit/changelog.js'
import { initDesktopWarning } from 'zoop-kit/desktop-warning.js'
import { initSavedTheme, THEMES } from 'zoop-kit/theme-picker.js'
import { initSettingsMenu } from 'zoop-kit/settings-menu.js'
import { fitTextToWidth, fitRowsToViewport, retriggerFit } from 'zoop-kit/fit.js'
import { showFilterableList } from 'zoop-kit/filter-list.js'
import { pushOverlay, popOverlay } from 'zoop-kit/back-nav.js'
import { evaluateExpression, evaluateExpressionWithReason, solveForX } from './engine.js'
import { APP_VERSION, CHANGELOG } from './changelog.js'

const HISTORY_KEY = 'calcly:history'
const VERSION_KEY = 'calcly:version'
const THEME_KEY = 'calcly:theme'
const HISTORY_STRIP_COUNT_KEY = 'calcly:history-strip-count'
const HISTORY_STRIP_OPTIONS = ['none', '2', '5', '10', 'all']
const ANGLE_MODE_KEY = 'calcly:angle-mode'

const FUNC_INV_MAP = { sin: 'asin', cos: 'acos', tan: 'atan', ln: 'exp', log: 'tenpow', sqrt: 'square' }
const SCI_LABELS = {
  normal: { sin: 'sin', cos: 'cos', tan: 'tan', ln: 'ln', log: 'log', sqrt: '√' },
  inv: { sin: 'sin⁻¹', cos: 'cos⁻¹', tan: 'tan⁻¹', ln: 'eˣ', log: '10ˣ', sqrt: 'sqr' },
}


const DISPLAY_FUNC = {
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  ln: 'ln',
  log: 'log',
  sqrt: '√',
  asin: 'sin⁻¹',
  acos: 'cos⁻¹',
  atan: 'tan⁻¹',
  exp: 'eˣ',
  tenpow: '10ˣ',
  square: 'sqr',
}




const FORMULAS = [
  
  { category: 'Geometry', name: 'Circle area', display: 'π × r²', template: 'π×({r})^2' },
  { category: 'Geometry', name: 'Circle circumference', display: '2 × π × r', template: '2×π×({r})' },
  { category: 'Geometry', name: 'Square area', display: 's²', template: '({s})^2' },
  { category: 'Geometry', name: 'Square perimeter', display: '4 × s', template: '4×({s})' },
  { category: 'Geometry', name: 'Rectangle area', display: 'l × w', template: '({l})×({w})' },
  { category: 'Geometry', name: 'Rectangle perimeter', display: '2 × (l + w)', template: '2×(({l})+({w}))' },
  { category: 'Geometry', name: 'Triangle area', display: '(b × h) ÷ 2', template: '(({b})×({h}))÷2' },
  { category: 'Geometry', name: 'Trapezoid area', display: '((a + b) ÷ 2) × h', template: '((({a})+({b}))÷2)×({h})' },
  { category: 'Geometry', name: 'Parallelogram area', display: 'b × h', template: '({b})×({h})' },
  { category: 'Geometry', name: 'Pythagorean theorem', display: '√(a² + b²)', template: '√(({a})^2+({b})^2)' },
  { category: 'Geometry', name: 'Cube volume', display: 's³', template: '({s})^3' },
  { category: 'Geometry', name: 'Rectangular prism volume', display: 'l × w × h', template: '({l})×({w})×({h})' },
  { category: 'Geometry', name: 'Sphere volume', display: '(4÷3) × π × r³', template: '(4÷3)×π×({r})^3' },
  { category: 'Geometry', name: 'Sphere surface area', display: '4 × π × r²', template: '4×π×({r})^2' },
  { category: 'Geometry', name: 'Cylinder volume', display: 'π × r² × h', template: 'π×({r})^2×({h})' },
  {
    category: 'Geometry',
    name: 'Cylinder surface area',
    display: '2 × π × r × (r + h)',
    template: '2×π×({r})×(({r})+({h}))',
  },
  { category: 'Geometry', name: 'Cone volume', display: '(1÷3) × π × r² × h', template: '(1÷3)×π×({r})^2×({h})' },
  {
    category: 'Geometry',
    name: 'Distance between two points',
    display: '√((x2−x1)² + (y2−y1)²)',
    template: '√((({x2})−({x1}))^2+(({y2})−({y1}))^2)',
  },

  
  {
    category: 'Algebra',
    name: 'Quadratic formula (+ root)',
    display: '(−b + √(b²−4ac)) ÷ (2a)',
    template: '(−({b})+√(({b})^2−4×({a})×({c})))÷(2×({a}))',
  },
  {
    category: 'Algebra',
    name: 'Quadratic formula (− root)',
    display: '(−b − √(b²−4ac)) ÷ (2a)',
    template: '(−({b})−√(({b})^2−4×({a})×({c})))÷(2×({a}))',
  },
  {
    category: 'Algebra',
    name: 'Slope between two points',
    display: '(y2 − y1) ÷ (x2 − x1)',
    template: '(({y2})−({y1}))÷(({x2})−({x1}))',
  },
  { category: 'Algebra', name: 'Exponential growth', display: 'P × (1 + r)^t', template: '({P})×(1+({r}))^({t})' },
  { category: 'Algebra', name: 'Exponential decay', display: 'P × (1 − r)^t', template: '({P})×(1−({r}))^({t})' },

  
  { category: 'Finance', name: 'Simple interest', display: 'P × r × t', template: '({P})×({r})×({t})' },
  {
    category: 'Finance',
    name: 'Compound interest',
    display: 'P × (1 + r ÷ n)^(n × t)',
    template: '({P})×(1+({r})÷({n}))^(({n})×({t}))',
  },
  {
    category: 'Finance',
    name: 'Percentage change',
    display: '((new − old) ÷ old) × 100',
    template: '((({new})−({old}))÷({old}))×100',
  },
  { category: 'Finance', name: 'Percentage of a total', display: '(part ÷ whole) × 100', template: '(({part})÷({whole}))×100' },
  { category: 'Finance', name: 'Discounted price', display: 'P × (1 − d)', template: '({P})×(1−({d}))' },
  { category: 'Finance', name: 'Price with tax', display: 'P × (1 + t)', template: '({P})×(1+({t}))' },
  {
    category: 'Finance',
    name: 'Profit margin',
    display: '((revenue − cost) ÷ revenue) × 100',
    template: '((({revenue})−({cost}))÷({revenue}))×100',
  },
  { category: 'Finance', name: 'Markup', display: '((price − cost) ÷ cost) × 100', template: '((({price})−({cost}))÷({cost}))×100' },

  
  { category: 'Physics', name: 'Speed', display: 'd ÷ t', template: '({d})÷({t})' },
  { category: 'Physics', name: 'Acceleration', display: '(v2 − v1) ÷ t', template: '(({v2})−({v1}))÷({t})' },
  { category: 'Physics', name: "Force (Newton's 2nd law)", display: 'm × a', template: '({m})×({a})' },
  { category: 'Physics', name: 'Kinetic energy', display: '(1÷2) × m × v²', template: '(1÷2)×({m})×({v})^2' },
  { category: 'Physics', name: 'Potential energy', display: 'm × g × h', template: '({m})×({g})×({h})' },
  { category: 'Physics', name: 'Momentum', display: 'm × v', template: '({m})×({v})' },
  { category: 'Physics', name: 'Density', display: 'm ÷ V', template: '({m})÷({V})' },
  { category: 'Physics', name: 'Pressure', display: 'F ÷ A', template: '({F})÷({A})' },
  { category: 'Physics', name: 'Work', display: 'F × d', template: '({F})×({d})' },
  { category: 'Physics', name: 'Power', display: 'W ÷ t', template: '({W})÷({t})' },
  { category: 'Physics', name: "Ohm's law (voltage)", display: 'I × R', template: '({I})×({R})' },
  { category: 'Physics', name: "Ohm's law (current)", display: 'V ÷ R', template: '({V})÷({R})' },

  
  { category: 'Misc', name: 'BMI', display: 'weight ÷ height²', template: '({weight})÷({height})^2' },
  { category: 'Misc', name: '°F to °C', display: '(F − 32) × 5 ÷ 9', template: '(({F})−32)×5÷9' },
  { category: 'Misc', name: '°C to °F', display: 'C × 9 ÷ 5 + 32', template: '({C})×9÷5+32' },
]

const FORMULA_CATEGORIES = ['All', ...new Set(FORMULAS.map((f) => f.category))]

let currentThemeKey = initSavedTheme(THEME_KEY, THEMES, 'emerald')

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}
function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)))
}
function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function getHistoryStripCount() {
  const saved = localStorage.getItem(HISTORY_STRIP_COUNT_KEY)
  return HISTORY_STRIP_OPTIONS.includes(saved) ? saved : '2'
}
function setHistoryStripCount(value) {
  localStorage.setItem(HISTORY_STRIP_COUNT_KEY, value)
}
function historyStripCountLabel(value) {
  return value === 'none' ? 'None' : value === 'all' ? 'All' : value
}

if (
  initInstallGate({
    appName: 'Calcly',
    iconUrl: '/icons/icon-192.png',
    subtitle: 'a beautiful calculator with history. no account, no permissions.',
  })
) {
  removeBootLoaderImmediately()
} else {
  attachBootLoader(() => {
    renderApp()
    initDesktopWarning('calcly:desktop-warning-dismissed')
    initUpdateCheck()
    maybeShowChangelog({
      appVersion: APP_VERSION,
      changelog: CHANGELOG,
      versionKey: VERSION_KEY,
      isFirstRun: loadHistory().length === 0,
    })
  })
}


let expr = ''
let expressionLabel = ''
let justEvaluated = false
let angleMode = localStorage.getItem(ANGLE_MODE_KEY) === 'rad' ? 'rad' : 'deg'
let invMode = false
let hasError = false
let errorReason = ''
let isSolveResult = false

function setAngleMode(mode) {
  angleMode = mode
  localStorage.setItem(ANGLE_MODE_KEY, mode)
}

function formatResult(n) {
  if (!isFinite(n)) return 'Error'
  const rounded = parseFloat(n.toPrecision(12))
  return rounded.toString()
}

function formatDisplay(raw) {
  if (raw === 'Error') return raw
  const neg = raw.startsWith('-')
  const s = neg ? raw.slice(1) : raw
  const [intPart, decPart] = s.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (neg ? '-' : '') + withCommas + (decPart !== undefined ? '.' + decPart : '')
}

let fractionState = null 

function startFraction() {
  
  
  
  commitFormula()
  if (fractionState) return
  if (justEvaluated) {
    expr = ''
    justEvaluated = false
  }
  fractionState = { num: '', den: '', active: 'num' }
  retriggerFitCalcGrid()
}





function commitFraction() {
  if (!fractionState) return
  const num = fractionState.num || '0'
  const den = fractionState.den || '1'
  
  
  
  
  
  
  
  expr += `((${num})÷(${den}))`
  fractionState = null
  retriggerFitCalcGrid()
}

let formulaState = null 

function startFormula(formula) {
  
  
  commitFraction()
  if (formulaState) return
  if (justEvaluated) {
    expr = ''
    justEvaluated = false
  }
  const blanks = [...new Set(formula.template.match(/\{(\w+)\}/g).map((t) => t.slice(1, -1)))]
  formulaState = {
    template: formula.template,
    blanks,
    values: Object.fromEntries(blanks.map((b) => [b, ''])),
    active: blanks[0],
  }
  retriggerFitCalcGrid()
}

function commitFormula() {
  if (!formulaState) return
  let result = formulaState.template
  for (const name of formulaState.blanks) {
    const val = formulaState.values[name] || '0'
    result = result.replaceAll(`{${name}}`, `(${val})`)
  }
  expr += result
  formulaState = null
  retriggerFitCalcGrid()
}

function inputDigit(d) {
  if (fractionState || formulaState) {
    const cur = getTarget()
    if (cur.replace(/[^0-9]/g, '').length >= 15) {
      hasError = true
      errorReason = "That's the max digits for one number"
      flashError()
      return
    }
    setTarget(cur + d)
    return
  }
  if (justEvaluated) {
    expr = d
    justEvaluated = false
  } else if (expr.replace(/[^0-9]/g, '').length >= 15) {
    hasError = true
    errorReason = "That's the max digits for one number"
    flashError()
    return
  } else {
    expr = expr === '0' ? d : expr + d
  }
}

function inputDecimal() {
  if (fractionState || formulaState) {
    const cur = getTarget()
    if (!cur.includes('.')) setTarget(cur + (cur === '' ? '0.' : '.'))
    return
  }
  if (justEvaluated) {
    expr = '0.'
    justEvaluated = false
    return
  }
  const trailing = expr.match(/[0-9.]*$/)[0]
  if (!trailing.includes('.')) expr += trailing === '' ? '0.' : '.'
}






function getTarget() {
  if (fractionState) return fractionState[fractionState.active]
  if (formulaState) return formulaState.values[formulaState.active]
  return expr
}
function setTarget(value) {
  if (fractionState) fractionState[fractionState.active] = value
  else if (formulaState) formulaState.values[formulaState.active] = value
  else expr = value
}

function appendOperator(op) {
  if (!fractionState && justEvaluated) justEvaluated = false
  const target = getTarget()
  if (!target) {
    if (op === '−') setTarget('−')
    return
  }
  const last = target.slice(-1)
  const lastIsOperator = '+−×÷^'.includes(last)

  
  
  
  
  if (op === '−' && (lastIsOperator || last === '(')) {
    setTarget(target + '−')
    return
  }

  if (lastIsOperator) setTarget(target.slice(0, -1) + op)
  else setTarget(target + op)
}

function appendFunc(baseName) {
  if (!fractionState && justEvaluated) {
    expr = ''
    justEvaluated = false
  }
  const name = invMode ? FUNC_INV_MAP[baseName] || baseName : baseName
  setTarget(getTarget() + (DISPLAY_FUNC[name] || name) + '(')
}

function appendConstant(sym) {
  if (!fractionState && justEvaluated) {
    expr = ''
    justEvaluated = false
  }
  setTarget(getTarget() + sym)
}

function appendParen() {
  if (!fractionState && justEvaluated) {
    expr = ''
    justEvaluated = false
  }
  const target = getTarget()
  const opens = (target.match(/\(/g) || []).length
  const closes = (target.match(/\)/g) || []).length
  const last = target.slice(-1)
  if (opens > closes && last !== '(' && !'+−×÷^'.includes(last)) setTarget(target + ')')
  else setTarget(target + '(')
}

function appendAbs() {
  if (!fractionState && justEvaluated) {
    expr = ''
    justEvaluated = false
  }
  
  
  
  setTarget(getTarget() + '|')
}

function appendEE() {
  if (!fractionState && justEvaluated) {
    expr = ''
    justEvaluated = false
  }
  setTarget(getTarget() + '×10^')
}

function appendPostfix(sym) {
  if (!fractionState && justEvaluated) justEvaluated = false
  const target = getTarget()
  const last = target.slice(-1)
  if (!last || '+−×÷^('.includes(last)) return
  setTarget(target + sym)
}

function clearAll() {
  expr = ''
  expressionLabel = ''
  justEvaluated = false
  fractionState = null
  formulaState = null
  
  
  
  retriggerFitCalcGrid()
}

function clearOrBackspace() {
  if (fractionState) {
    const cur = fractionState[fractionState.active]
    if (cur) fractionState[fractionState.active] = cur.slice(0, -1)
    else if (fractionState.active === 'den') fractionState.active = 'num'
    else {
      fractionState = null
      retriggerFitCalcGrid()
    }
    return
  }
  if (formulaState) {
    const cur = formulaState.values[formulaState.active]
    if (cur) {
      formulaState.values[formulaState.active] = cur.slice(0, -1)
      return
    }
    const idx = formulaState.blanks.indexOf(formulaState.active)
    if (idx > 0) {
      formulaState.active = formulaState.blanks[idx - 1]
    } else {
      formulaState = null
      retriggerFitCalcGrid()
    }
    return
  }
  if (expr && !justEvaluated) expr = expr.slice(0, -1)
  else clearAll()
}

function inputEquals() {
  commitFraction()
  commitFormula()
  if (!expr) return
  
  
  if (justEvaluated) return

  if (/[=<>≤≥]/.test(expr)) {
    const original = expr
    const { result, error } = solveForX(original, angleMode)

    if (error) {
      hasError = true
      errorReason = error
      flashError()
      return
    }

    hasError = false
    addHistory(original, result)
    expressionLabel = `${original}`
    expr = result
    isSolveResult = true
    justEvaluated = true
    return
  }

  if (/x/.test(expr)) {
    hasError = true
    errorReason = 'Add = from the Algebra tab to solve for x'
    flashError()
    return
  }

  const { value, error } = evaluateExpressionWithReason(expr, angleMode)

  if (error) {
    hasError = true
    errorReason = error
    flashError()
    return
  }

  const resultStr = formatResult(value)
  hasError = false
  addHistory(expr, formatDisplay(resultStr))
  expressionLabel = `${expr} =`
  expr = resultStr
  justEvaluated = true
}

function flashError() {
  const displayEl = document.querySelector('#calc-display')
  displayEl.classList.remove('flash-error')
  void displayEl.offsetWidth
  displayEl.classList.add('flash-error')
}

function addHistory(exprStr, result) {
  const list = loadHistory()
  list.unshift({ id: uid(), expr: exprStr, result })
  saveHistory(list)
  renderHistory()
}

function loadFromHistory(entry) {
  expr = entry.result.replace(/,/g, '')
  expressionLabel = ''
  justEvaluated = true
  render()
}


function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}






function formulaTemplateHtml(state) {
  return state.template
    .split(/(\{\w+\})/g)
    .map((part) => {
      const m = part.match(/^\{(\w+)\}$/)
      if (!m) return escapeHtml(part)
      const name = m[1]
      const val = state.values[name]
      const isActive = name === state.active
      return `<span class="formula-blank${isActive ? ' active' : ''}" data-blank="${name}">${escapeHtml(val) || escapeHtml(name)}</span>`
    })
    .join('')
}

const DISPLAY_FONT_MAX = 73.6 
const DISPLAY_FONT_MIN = 22

function render() {
  const displayEl = document.querySelector('#calc-display')
  const exprEl = document.querySelector('#calc-expression')

  displayEl.classList.toggle('has-fraction', !!fractionState || !!formulaState)
  if (fractionState) {
    const { num, den, active } = fractionState
    displayEl.innerHTML = `${escapeHtml(expr)}<span class="frac-inline"><span class="frac-num${active === 'num' ? ' active' : ''}">${escapeHtml(num) || '&nbsp;'}</span><span class="frac-bar"></span><span class="frac-den${active === 'den' ? ' active' : ''}">${escapeHtml(den) || '&nbsp;'}</span></span>`
  } else if (formulaState) {
    displayEl.innerHTML = escapeHtml(expr) + formulaTemplateHtml(formulaState)
  } else {
    const raw = expr || '0'
    const shown = isSolveResult ? raw : justEvaluated ? formatDisplay(raw) : raw
    displayEl.textContent = shown
  }
  fitTextToWidth(displayEl, { max: DISPLAY_FONT_MAX, min: DISPLAY_FONT_MIN })
  exprEl.textContent = expressionLabel
  document.querySelector('#fraction-controls').hidden = !fractionState && !formulaState

  const previewEl = document.querySelector('#calc-preview')
  previewEl.classList.toggle('error', hasError)
  const isTrivial = !/[a-zA-Zπ+−×÷^!%()]/.test(expr)
  const isEquation = /[=<>≤≥]/.test(expr)
  if (hasError) {
    previewEl.textContent = `Error - ${errorReason}`
  } else if (isEquation || fractionState) {
    previewEl.textContent = ''
  } else if (!justEvaluated && expr && !isTrivial && !/[+−×÷^(]$/.test(expr)) {
    const preview = evaluateExpression(expr, angleMode)
    previewEl.textContent = isFinite(preview) ? `= ${formatDisplay(formatResult(preview))}` : ''
  } else {
    previewEl.textContent = ''
  }
  previewEl.classList.toggle('shrink-1', previewEl.textContent.length > 24)
  previewEl.classList.toggle('shrink-2', previewEl.textContent.length > 36)

  const clearBtn = document.querySelector('#calc-clear')
  clearBtn.innerHTML = (expr && !justEvaluated) || fractionState || formulaState ? '<md-icon>backspace</md-icon>' : 'AC'

  const radBtn = document.querySelector('#rad-btn')
  if (radBtn) radBtn.textContent = angleMode === 'deg' ? 'Deg' : 'Rad'

  const invBtn = document.querySelector('#inv-btn')
  if (invBtn) invBtn.classList.toggle('active', invMode)

  const labels = invMode ? SCI_LABELS.inv : SCI_LABELS.normal
  document.querySelectorAll('.sci-btn[data-func]').forEach((btn) => {
    btn.textContent = labels[btn.dataset.func]
  })
}

function historyItemMarkup(h) {
  return `
    <button type="button" class="history-item" data-id="${h.id}">
      <span class="history-expr">${h.expr}</span>
      <span class="history-result">= ${h.result}</span>
    </button>
  `
}

function renderHistory() {
  const list = document.querySelector('#history-list')
  const items = loadHistory()
  const count = getHistoryStripCount()
  const shown = count === 'none' ? [] : count === 'all' ? items : items.slice(0, Number(count))

  if (count === 'none') {
    list.innerHTML = ''
    list.style.display = 'none'
  } else {
    list.style.display = ''

    if (!shown.length) {
      list.innerHTML = `<p class="history-empty">Your calculations will show up here</p>`
    } else {
      list.innerHTML = shown.map(historyItemMarkup).join('')

      list.querySelectorAll('.history-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const entry = items.find((h) => h.id === btn.dataset.id)
          if (entry) loadFromHistory(entry)
        })
      })
    }
  }

  
  
  
  retriggerFitCalcGrid()
}

function showFullHistory() {
  const el = document.createElement('div')
  el.id = 'history-overlay'
  el.className = 'search-overlay'
  document.body.appendChild(el)

  const items = loadHistory()
  el.innerHTML = `
    <div class="overlay-header">
      <md-icon-button id="history-overlay-back" aria-label="Back"><md-icon>arrow_back</md-icon></md-icon-button>
      <p class="overlay-title">History</p>
      <div class="overlay-spacer"></div>
    </div>
    ${
      items.length
        ? `<div class="full-history-list">${items.map(historyItemMarkup).join('')}</div>`
        : `<p class="history-empty">Your calculations will show up here</p>`
    }
  `

  el.querySelectorAll('.history-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const entry = items.find((h) => h.id === btn.dataset.id)
      if (entry) {
        loadFromHistory(entry)
        popOverlay()
      }
    })
  })

  el.querySelector('#history-overlay-back').addEventListener('click', popOverlay)

  function closeHistoryOverlay() {
    el.classList.remove('open')
    setTimeout(() => el.remove(), 300)
  }

  pushOverlay(closeHistoryOverlay)
  requestAnimationFrame(() => el.classList.add('open'))
}

function showFormulasList() {
  showFilterableList({
    title: 'Formulas',
    items: FORMULAS,
    categories: FORMULA_CATEGORIES,
    getCategory: (f) => f.category,
    getKey: (f) => f.name,
    renderItem: (f) => `<span class="formula-item-name">${f.name}</span><span class="formula-item-display">${f.display}</span>`,
    onSelect: (formula) => {
      startFormula(formula)
      render()
    },
  })
}

function showHistoryStripCountPicker() {
  let dialog = document.querySelector('#calcly-strip-count-dialog')
  if (!dialog) {
    dialog = document.createElement('md-dialog')
    dialog.id = 'calcly-strip-count-dialog'
    dialog.className = 'zk-dialog'
    document.body.appendChild(dialog)
  }

  const current = getHistoryStripCount()
  dialog.innerHTML = `
    <div slot="headline">Top history strip</div>
    <div slot="content">
      <md-list>
        ${HISTORY_STRIP_OPTIONS.map(
          (opt) => `
          <md-list-item type="button" class="strip-count-option" data-value="${opt}">
            <div slot="headline">${historyStripCountLabel(opt)}</div>
            ${opt === current ? `<md-icon slot="end">check</md-icon>` : ''}
          </md-list-item>
        `
        ).join('')}
      </md-list>
    </div>
    <div slot="actions">
      <md-text-button class="zk-dialog-ok">Close</md-text-button>
    </div>
  `

  dialog.querySelectorAll('.strip-count-option').forEach((item) => {
    item.addEventListener('click', () => {
      setHistoryStripCount(item.dataset.value)
      renderHistory()
      const supportingText = document.querySelector('#calcly-history-limit div[slot="supporting-text"]')
      if (supportingText) supportingText.textContent = historyStripCountLabel(item.dataset.value)
      dialog.close()
    })
  })

  dialog.querySelector('.zk-dialog-ok').addEventListener('click', () => dialog.close(), { once: true })
  dialog.show()
}

function vibrate() {
  navigator.vibrate?.(8)
}





const CALC_BTN_MAX = 100
const CALC_BTN_MIN = 44
const CALC_GRID_ROWS = 5

function fitCalcGrid() {
  fitRowsToViewport({ cssVar: '--calc-btn-height', rows: CALC_GRID_ROWS, max: CALC_BTN_MAX, min: CALC_BTN_MIN })
}

function retriggerFitCalcGrid() {
  retriggerFit(fitCalcGrid)
}

function renderApp() {
  document.querySelector('#app').innerHTML = `
    <div class="topbar">
      <p class="topbar-title">Calcly</p>
      <div class="topbar-actions">
        <button type="button" class="topbar-icon-btn" id="formulas-btn" aria-label="Formulas">
          <md-icon>calculate</md-icon>
        </button>
        <button type="button" class="topbar-icon-btn" id="history-btn" aria-label="History">
          <md-icon>history</md-icon>
        </button>
        <button type="button" class="topbar-icon-btn" id="settings-btn" aria-label="Settings">
          <md-icon>settings</md-icon>
        </button>
      </div>
    </div>

    <div class="history-panel" id="history-list"></div>

    <div class="calc-display-wrap">
      <p class="calc-expression" id="calc-expression"></p>
      <p class="calc-display" id="calc-display">0</p>
      <p class="calc-preview" id="calc-preview"></p>
      <div class="fraction-controls" id="fraction-controls" hidden>
        <button type="button" id="fraction-done">Done ✓</button>
      </div>
    </div>

    <div class="sci-toggle-row" id="sci-toggle-row">
      <button type="button" class="sci-toggle-mini" id="sci-toggle" aria-label="More functions">
        <md-icon class="sci-toggle-chevron">expand_less</md-icon>
      </button>
      <button type="button" class="sci-tab-btn active" id="tab-sci" data-tab="sci">Sci</button>
      <button type="button" class="sci-tab-btn" id="tab-algebra" data-tab="algebra">Algebra</button>
    </div>
    <div class="sci-row-wrap" id="sci-row-wrap">
      <div class="sci-row" id="sci-row-sci">
        <button type="button" class="sci-btn" data-action="func" data-func="sqrt">√</button>
        <button type="button" class="sci-btn" data-action="const" data-const="π">π</button>
        <button type="button" class="sci-btn" data-action="postfix" data-postfix="!">!</button>
        <button type="button" class="sci-btn" id="rad-btn" data-action="angle-mode">Deg</button>
        <button type="button" class="sci-btn" data-action="func" data-func="sin">sin</button>
        <button type="button" class="sci-btn" data-action="func" data-func="cos">cos</button>
        <button type="button" class="sci-btn" data-action="func" data-func="tan">tan</button>
        <button type="button" class="sci-btn" id="inv-btn" data-action="inv-mode">Inv</button>
        <button type="button" class="sci-btn" data-action="const" data-const="e">e</button>
        <button type="button" class="sci-btn" data-action="func" data-func="ln">ln</button>
        <button type="button" class="sci-btn" data-action="func" data-func="log">log</button>
        <button type="button" class="sci-btn" data-action="op" data-op="^">^</button>
        <button type="button" class="sci-btn" data-action="abs">|x|</button>
        <button type="button" class="sci-btn" data-action="op" data-op="mod">mod</button>
        <button type="button" class="sci-btn" data-action="ee">EE</button>
      </div>
      <div class="algebra-row" id="sci-row-algebra" hidden>
        <div class="algebra-grid">
          <button type="button" class="sci-btn" data-action="const" data-const="x">x</button>
          <button type="button" class="sci-btn" data-action="const" data-const="y">y</button>
          <button type="button" class="sci-btn" data-action="const" data-const="z">z</button>
          <button type="button" class="sci-btn" data-action="const" data-const="a">a</button>
          <button type="button" class="sci-btn" data-action="const" data-const="b">b</button>
          <button type="button" class="sci-btn" data-action="const" data-const="=">=</button>
          <button type="button" class="sci-btn" data-action="const" data-const="&lt;">&lt;</button>
          <button type="button" class="sci-btn" data-action="const" data-const="&gt;">&gt;</button>
          <button type="button" class="sci-btn" data-action="const" data-const="≤">≤</button>
          <button type="button" class="sci-btn" data-action="const" data-const="≥">≥</button>
        </div>
        <button type="button" class="sci-btn fraction-square-btn" data-action="fraction">a/b</button>
      </div>
    </div>

    <div class="calc-grid">
      <button type="button" class="calc-btn calc-btn-fn" id="calc-clear" data-action="clear">AC</button>
      <button type="button" class="calc-btn calc-btn-fn" data-action="paren">( )</button>
      <button type="button" class="calc-btn calc-btn-fn" data-action="percent">%</button>
      <button type="button" class="calc-btn calc-btn-op" data-action="op" data-op="÷">÷</button>

      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="7">7</button>
      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="8">8</button>
      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="9">9</button>
      <button type="button" class="calc-btn calc-btn-op" data-action="op" data-op="×">×</button>

      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="4">4</button>
      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="5">5</button>
      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="6">6</button>
      <button type="button" class="calc-btn calc-btn-op" data-action="op" data-op="−">−</button>

      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="1">1</button>
      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="2">2</button>
      <button type="button" class="calc-btn calc-btn-num" data-action="digit" data-digit="3">3</button>
      <button type="button" class="calc-btn calc-btn-op" data-action="op" data-op="+">+</button>

      <button type="button" class="calc-btn calc-btn-num calc-btn-zero" data-action="digit" data-digit="0">0</button>
      <button type="button" class="calc-btn calc-btn-num" data-action="decimal">.</button>
      <button type="button" class="calc-btn calc-btn-op calc-btn-equals" data-action="equals">=</button>
    </div>
  `

  renderHistory()
  render()
  requestAnimationFrame(fitCalcGrid)
  window.addEventListener('resize', fitCalcGrid)

  document.querySelector('.calc-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.calc-btn')
    if (!btn) return
    if (btn.id === 'calc-clear' && clearLongPressed) {
      clearLongPressed = false
      return
    }
    vibrate()

    const { action, digit, op } = btn.dataset
    if (action !== 'equals') {
      hasError = false
      isSolveResult = false
    }
    if (action === 'digit') inputDigit(digit)
    else if (action === 'decimal') inputDecimal()
    else if (action === 'paren') appendParen()
    else if (action === 'percent') appendPostfix('%')
    else if (action === 'op') appendOperator(op)
    else if (action === 'equals') inputEquals()
    else if (action === 'clear') clearOrBackspace()
    render()
  })

  let clearHoldTimer = null
  let clearLongPressed = false
  const clearBtn = document.querySelector('#calc-clear')
  const cancelClearHold = () => clearTimeout(clearHoldTimer)
  clearBtn.addEventListener('pointerdown', () => {
    clearLongPressed = false
    clearHoldTimer = setTimeout(() => {
      clearLongPressed = true
      vibrate()
      hasError = false
      isSolveResult = false
      clearAll()
      render()
    }, 500)
  })
  clearBtn.addEventListener('pointerup', cancelClearHold)
  clearBtn.addEventListener('pointerleave', cancelClearHold)
  clearBtn.addEventListener('pointercancel', cancelClearHold)

  document.querySelector('#sci-toggle').addEventListener('click', () => {
    const toggle = document.querySelector('#sci-toggle')
    const toggleRow = document.querySelector('#sci-toggle-row')
    const rowWrap = document.querySelector('#sci-row-wrap')
    const open = toggle.classList.toggle('open')
    toggleRow.classList.toggle('open', open)
    rowWrap.classList.toggle('open', open)
    toggle.querySelector('.sci-toggle-chevron').textContent = open ? 'expand_more' : 'expand_less'
    retriggerFitCalcGrid()
  })

  document.querySelectorAll('.sci-tab-btn').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      const tab = tabBtn.dataset.tab
      document.querySelectorAll('.sci-tab-btn').forEach((b) => b.classList.toggle('active', b === tabBtn))
      document.querySelector('#sci-row-sci').hidden = tab !== 'sci'
      document.querySelector('#sci-row-algebra').hidden = tab !== 'algebra'
      retriggerFitCalcGrid()
    })
  })

  document.querySelector('#sci-row-wrap').addEventListener('click', (e) => {
    const btn = e.target.closest('.sci-btn')
    if (!btn) return
    vibrate()

    const { action, func, const: constSym, postfix, op } = btn.dataset
    hasError = false
    isSolveResult = false
    if (action === 'func') appendFunc(func)
    else if (action === 'const') appendConstant(constSym)
    else if (action === 'postfix') appendPostfix(postfix)
    else if (action === 'paren') appendParen()
    else if (action === 'abs') appendAbs()
    else if (action === 'ee') appendEE()
    else if (action === 'op') appendOperator(op)
    else if (action === 'angle-mode') setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')
    else if (action === 'inv-mode') invMode = !invMode
    else if (action === 'fraction') startFraction()
    render()
  })

  document.querySelector('#calc-display').addEventListener('click', (e) => {
    if (fractionState) {
      if (e.target.closest('.frac-num')) fractionState.active = 'num'
      else if (e.target.closest('.frac-den')) fractionState.active = 'den'
      else return
      vibrate()
      render()
    } else if (formulaState) {
      const blank = e.target.closest('.formula-blank')
      if (!blank) return
      formulaState.active = blank.dataset.blank
      vibrate()
      render()
    }
  })

  document.querySelector('#fraction-done').addEventListener('click', () => {
    vibrate()
    commitFraction()
    commitFormula()
    render()
  })

  document.querySelector('#formulas-btn').addEventListener('click', showFormulasList)
  document.querySelector('#history-btn').addEventListener('click', showFullHistory)

  const { dialog: settingsDialog } = initSettingsMenu({
    version: APP_VERSION,
    changelog: CHANGELOG,
    themes: THEMES,
    themeKey: currentThemeKey,
    themeStorageKey: THEME_KEY,
    onThemeChange: (key) => {
      currentThemeKey = key
    },
    shareData: { title: 'Calcly', text: 'a beautiful calculator with history', url: location.origin },
    githubUrl: 'https://github.com/zoop-dev/calcly',
    onClearData: () => {
      saveHistory([])
      renderHistory()
    },
    clearDataMessage: "This clears your calculation history. This can't be undone.",
    renderFab: false,
    extraItems: [
      {
        id: 'calcly-history-limit',
        icon: 'view_list',
        headline: 'Top history strip',
        supportingText: historyStripCountLabel(getHistoryStripCount()),
        onClick: showHistoryStripCountPicker,
      },
    ],
  })

  document.querySelector('#settings-btn').addEventListener('click', () => settingsDialog.show())

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== '=') {
      hasError = false
      isSolveResult = false
    }
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key)
    else if (e.key === '.') inputDecimal()
    else if (e.key === '+') appendOperator('+')
    else if (e.key === '-') appendOperator('−')
    else if (e.key === '*') appendOperator('×')
    else if (e.key === '/') {
      e.preventDefault()
      appendOperator('÷')
    } else if (e.key === '^') appendOperator('^')
    else if (e.key === '(' || e.key === ')') appendParen()
    else if (e.key === '!') appendPostfix('!')
    else if (e.key === 'Enter' || e.key === '=') inputEquals()
    else if (e.key === 'Escape') clearAll()
    else if (e.key === 'Backspace') clearOrBackspace()
    else if (e.key === '%') appendPostfix('%')
    else return
    render()
  })
}
