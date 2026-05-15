// My-BMI.net - App Logic
// By Alex Thompson · 365 days of tracking

// ========== Tab Switching ==========
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ========== BMI Calculator ==========
function calculateBMI() {
  const height = parseFloat(document.getElementById('bmi-height').value);
  const weight = parseFloat(document.getElementById('bmi-weight').value);

  if (!height || !weight) {
    alert('Please enter both height and weight');
    return;
  }

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  let category, catClass;

  if (bmi < 18.5) { category = 'Underweight'; catClass = 'cat-underweight'; }
  else if (bmi < 25) { category = 'Normal'; catClass = 'cat-normal'; }
  else if (bmi < 30) { category = 'Overweight'; catClass = 'cat-overweight'; }
  else { category = 'Obese'; catClass = 'cat-obese'; }

  const resultBox = document.getElementById('bmi-result');
  resultBox.innerHTML = `
    <h3>Your BMI Result</h3>
    <div class="result-value">${bmi}</div>
    <div class="result-category ${catClass}">${category}</div>
    <p style="margin-top:15px;color:#666;font-size:14px;">
      Height: ${height}cm · Weight: ${weight}kg
    </p>
  `;
  resultBox.classList.add('show');

  // Save to history
  saveRecord({ date: new Date().toISOString().split('T')[0], type: 'BMI', value: bmi, height, weight });
}

// ========== Body Fat Calculator (Navy Method) ==========
function calculateBodyFat() {
  const gender = document.getElementById('bf-gender').value;
  const height = parseFloat(document.getElementById('bf-height').value);
  const neck = parseFloat(document.getElementById('bf-neck').value);
  const waist = parseFloat(document.getElementById('bf-waist').value);
  const hip = parseFloat(document.getElementById('bf-hip').value) || 0;

  if (!height || !neck || !waist) {
    alert('Please fill in all required fields');
    return;
  }

  let bodyFat;
  if (gender === 'male') {
    bodyFat = (495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450).toFixed(1);
  } else {
    bodyFat = (495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450).toFixed(1);
  }

  const resultBox = document.getElementById('bf-result');
  resultBox.innerHTML = `
    <h3>Your Body Fat Percentage</h3>
    <div class="result-value">${bodyFat}%</div>
    <p style="margin-top:15px;color:#666;font-size:14px;">
      ${gender === 'male' ? 'Male' : 'Female'} · ${height}cm
    </p>
  `;
  resultBox.classList.add('show');

  saveRecord({ date: new Date().toISOString().split('T')[0], type: 'Body Fat', value: bodyFat + '%', height, waist, neck });
}

// ========== LocalStorage History ==========
function saveRecord(record) {
  let history = JSON.parse(localStorage.getItem('myBMI_history') || '[]');
  history.unshift(record);
  if (history.length > 100) history = history.slice(0, 100);
  localStorage.setItem('myBMI_history', JSON.stringify(history));
  updateHistoryTable();
  updateChart();
}

function updateHistoryTable() {
  const history = JSON.parse(localStorage.getItem('myBMI_history') || '[]');
  const tbody = document.getElementById('history-body');
  if (!tbody) return;

  tbody.innerHTML = history.slice(0, 20).map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${r.type}</td>
      <td><strong>${r.value}</strong></td>
      <td>${r.height || '-'}</td>
      <td>${r.weight || r.waist || '-'}</td>
    </tr>
  `).join('');
}

// ========== Chart (Simple Canvas) ==========
function updateChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;

  const history = JSON.parse(localStorage.getItem('myBMI_history') || '[]');
  const bmiRecords = history.filter(r => r.type === 'BMI').slice(0, 30).reverse();

  if (bmiRecords.length < 2) {
    canvas.getContext('2d').fillText('Need at least 2 records to show trend', 50, 150);
    return;
  }

  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = 300;

  ctx.clearRect(0, 0, width, height);

  // Draw grid
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = height - 40 - (i * (height - 80) / 5);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 20, y);
    ctx.stroke();
  }

  // Draw line
  const values = bmiRecords.map(r => parseFloat(r.value));
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.1;
  const range = max - min;

  ctx.strokeStyle = '#2c5530';
  ctx.lineWidth = 3;
  ctx.beginPath();

  bmiRecords.forEach((r, i) => {
    const x = 40 + (i / (bmiRecords.length - 1)) * (width - 60);
    const y = height - 40 - ((parseFloat(r.value) - min) / range) * (height - 80);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw points
  ctx.fillStyle = '#4a9b5e';
  bmiRecords.forEach((r, i) => {
    const x = 40 + (i / (bmiRecords.length - 1)) * (width - 60);
    const y = height - 40 - ((parseFloat(r.value) - min) / range) * (height - 80);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ========== Export ==========
function exportJSON() {
  const history = localStorage.getItem('myBMI_history') || '[]';
  const blob = new Blob([history], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-bmi-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV() {
  const history = JSON.parse(localStorage.getItem('myBMI_history') || '[]');
  if (history.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = ['Date', 'Type', 'Value', 'Height', 'Weight/Waist'];
  const rows = history.map(r => [r.date, r.type, r.value, r.height || '', r.weight || r.waist || '']);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-bmi-data.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ========== Sticky Calc (Post Page) ==========
window.addEventListener('scroll', () => {
  const sticky = document.getElementById('sticky-calc');
  if (sticky) {
    if (window.scrollY > 400) sticky.classList.add('active');
    else sticky.classList.remove('active');
  }
});

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
  updateHistoryTable();
  updateChart();
});
