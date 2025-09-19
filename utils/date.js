function now() {
  return new Date();
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function toDateOnlyString(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function isSameOrAfter(a, b) {
  return a.getTime() >= b.getTime();
}

module.exports = { now, addDays, toDateOnlyString, isSameOrAfter };
