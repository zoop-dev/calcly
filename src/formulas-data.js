



export const FORMULAS = [
  
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

export const FORMULA_CATEGORIES = ['All', ...new Set(FORMULAS.map((f) => f.category))]
