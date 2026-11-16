// Money is integer rupiah from the API and is formatted exactly once, here.
// Example: 12500000 -> "Rp 12.500.000".
export function formatRupiah(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '-';
  return 'Rp ' + Math.trunc(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
