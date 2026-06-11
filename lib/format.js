// Formatage XOF déterministe (même rendu SSR et CSR — évite les hydration mismatches).
// Séparateur de milliers : espace insécable fin (U+202F) → identique côté serveur et navigateur.
function formatInteger(amount) {
  if (amount == null || isNaN(amount)) return '0';
  const num = Math.round(Number(amount));
  const str = String(Math.abs(num));
  const padded = str.length <= 3 ? str : str.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\u202f');
  return (num < 0 ? '-' : '') + padded;
}

export function formatXOF(amount) {
  return formatInteger(amount) + ' FCFA';
}

export function formatPct(value) {
  if (value == null || isNaN(value)) return '0%';
  return `${formatInteger(Number(value))}%`;
}
