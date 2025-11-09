// node --max-old-space-size=8192 9.js

const { performance } = require("perf_hooks");
const fs = require("fs");


function generateIntArray(n, min = -10000, max = 10000) {
  const span = max - min + 1;
  const arr = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = (Math.random() * span | 0) + min;
  }
  return arr;
}

// Метод 1: Сортування
function methodSort(arr) {
  const copy = Array.from(arr);
  copy.sort((a, b) => b - a);
  return copy[5];
}

// Метод 2: Підтримка TOP-6
function methodTop6(arr) {
  const k = 6;
  const top = [];

  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];

    if (top.length < k || x > top[top.length - 1]) {
      let pos = top.length;
      while (pos > 0 && top[pos - 1] < x) pos--;
      top.splice(pos, 0, x);
      if (top.length > k) top.pop();
    }
  }
  return top[k - 1];
}

// Метод 3: 6 разів знайти максимум
function methodSixMax(arr) {
  const copy = new Int32Array(arr);
  const NEG = -2147483648;
  let result = NEG;

  for (let r = 0; r < 6; r++) {
    let maxVal = NEG;
    let maxIdx = -1;

    for (let i = 0; i < copy.length; i++) {
      if (copy[i] > maxVal) {
        maxVal = copy[i];
        maxIdx = i;
      }
    }

    result = maxVal;
    copy[maxIdx] = NEG;
  }
  return result;
}

// Вимір часу одного запуску
function measure(fn, arr) {
  const t0 = performance.now();
  const result = fn(arr);
  const t1 = performance.now();
  return { time: t1 - t0, result };
}

// Запуск 3 рази + середнє
function run3(fn, arr) {
  const times = [];
  let lastResult;

  for (let i = 0; i < 3; i++) {
    const { time, result } = measure(fn, arr);
    lastResult = result;
    times.push(time);
  }

  const avg = times.reduce((a, b) => a + b, 0) / 3;
  return { avg, times, result: lastResult };
}

// Масиви розмірів
const sizes = [
  10_000,
  100_000,
  1_000_000,
  10_000_000,
  100_000_000
];

// Основний процес
let results = [];

console.log("=== Запуск тестування алгоритмів ===");

for (const size of sizes) {
  console.log(`\nГенерація масиву ${size.toLocaleString()}...`);
  const base = generateIntArray(size);

  console.log(`Запуск тестів для ${size.toLocaleString()}`);

  const r1 = run3(methodSort, base);
  const r2 = run3(methodTop6, base);
  const r3 = run3(methodSixMax, base);

  results.push({ size, r1, r2, r3 });
}

console.log("\n=== Формування HTML-файлу ===");

// Генерація HTML-таблиці
let html = `
<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<title>Результати практичної №9</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; background: #fafafa; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #333; padding: 8px 12px; text-align: center; }
  th { background: #e3e3e3; font-weight: bold; }
  tr:nth-child(even) { background: #f9f9f9; }
</style>
</head>
<body>
<h2>Результати практичної роботи №9</h2>
<table>
  <tr>
    <th>Розмір масиву</th>
    <th>Спосіб 1</th>
    <th>Спосіб 2</th>
    <th>Спосіб 3</th>
  </tr>
`;

results.forEach(row => {
  const format = (obj) =>
    `${obj.avg.toFixed(2)} ms<br>(${obj.times.map(t => t.toFixed(2)).join(", ")})`;

  html += `
  <tr>
    <td>${row.size.toLocaleString()}</td>
    <td>${format(row.r1)}</td>
    <td>${format(row.r2)}</td>
    <td>${format(row.r3)}</td>
  </tr>
  `;
});

html += `
</table>
</body>
</html>
`;

fs.writeFileSync("results.html", html, "utf8");

console.log("\nГотово! Файл results.html створено.");
console.log("Відкрийте його у браузері для перегляду результатів.");
