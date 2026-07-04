export const UNIT_CATEGORIES = [
  {
    name: 'Length',
    key: 'length',
    units: [
      { key: 'mm', label: 'Millimeters', factor: 0.001 },
      { key: 'cm', label: 'Centimeters', factor: 0.01 },
      { key: 'm', label: 'Meters', factor: 1 },
      { key: 'km', label: 'Kilometers', factor: 1000 },
      { key: 'in', label: 'Inches', factor: 0.0254 },
      { key: 'ft', label: 'Feet', factor: 0.3048 },
      { key: 'yd', label: 'Yards', factor: 0.9144 },
      { key: 'mi', label: 'Miles', factor: 1609.344 },
    ],
  },
  {
    name: 'Weight',
    key: 'weight',
    units: [
      { key: 'mg', label: 'Milligrams', factor: 0.000001 },
      { key: 'g', label: 'Grams', factor: 0.001 },
      { key: 'kg', label: 'Kilograms', factor: 1 },
      { key: 'oz', label: 'Ounces', factor: 0.0283495 },
      { key: 'lb', label: 'Pounds', factor: 0.453592 },
    ],
  },
  {
    name: 'Temperature',
    key: 'temperature',
    special: 'temperature',
    units: [
      { key: 'c', label: 'Celsius' },
      { key: 'f', label: 'Fahrenheit' },
      { key: 'k', label: 'Kelvin' },
    ],
  },
  {
    name: 'Volume',
    key: 'volume',
    units: [
      { key: 'ml', label: 'Milliliters', factor: 0.001 },
      { key: 'l', label: 'Liters', factor: 1 },
      { key: 'tsp', label: 'Teaspoons', factor: 0.00492892 },
      { key: 'tbsp', label: 'Tablespoons', factor: 0.0147868 },
      { key: 'floz', label: 'Fluid ounces', factor: 0.0295735 },
      { key: 'cup', label: 'Cups', factor: 0.236588 },
      { key: 'pt', label: 'Pints', factor: 0.473176 },
      { key: 'qt', label: 'Quarts', factor: 0.946353 },
      { key: 'gal', label: 'Gallons', factor: 3.78541 },
    ],
  },
  {
    name: 'Speed',
    key: 'speed',
    units: [
      { key: 'mps', label: 'Meters/sec', factor: 1 },
      { key: 'kph', label: 'Km/h', factor: 0.277778 },
      { key: 'mph', label: 'Miles/h', factor: 0.44704 },
      { key: 'knot', label: 'Knots', factor: 0.514444 },
    ],
  },
  {
    name: 'Data',
    key: 'data',
    units: [
      { key: 'b', label: 'Bytes', factor: 1 },
      { key: 'kb', label: 'Kilobytes', factor: 1024 },
      { key: 'mb', label: 'Megabytes', factor: 1024 ** 2 },
      { key: 'gb', label: 'Gigabytes', factor: 1024 ** 3 },
      { key: 'tb', label: 'Terabytes', factor: 1024 ** 4 },
    ],
  },
]

function convertTemperature(value, fromKey, toKey) {
  let celsius
  if (fromKey === 'c') celsius = value
  else if (fromKey === 'f') celsius = ((value - 32) * 5) / 9
  else celsius = value - 273.15

  if (toKey === 'c') return celsius
  if (toKey === 'f') return (celsius * 9) / 5 + 32
  return celsius + 273.15
}

export function convertUnit(category, value, fromKey, toKey) {
  if (category.special === 'temperature') return convertTemperature(value, fromKey, toKey)
  const from = category.units.find((u) => u.key === fromKey)
  const to = category.units.find((u) => u.key === toKey)
  return (value * from.factor) / to.factor
}
