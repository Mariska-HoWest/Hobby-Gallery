// /Hobby-Gallery/kaarsen/dataManipulation.js
console.log('🕯️ Candles dataManipulation.js loaded');

window.initCandleManipulation = function (data) {
  console.log('🟢 initCandleManipulation received:', Array.isArray(data) ? data.length : 0, 'rows');
  console.log('🔍 First row:', Array.isArray(data) ? data[0] : null);

  const el = document.getElementById('display');
  if (el) el.textContent = `✅ Candles loaded: ${Array.isArray(data) ? data.length : 0} rows (check console)`;
};
