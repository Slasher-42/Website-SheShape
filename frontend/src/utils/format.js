const numberFormat = new Intl.NumberFormat('en-US')

export function formatPrice(value) {
  return `${numberFormat.format(value)} RWF`
}

export function formatCategory(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
