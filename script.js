// ==============================
// Construction Date Calculator
// ==============================

const MIN_DATE = new Date(2026, 1, 20); // 2026-02-20
const MAX_DATE = new Date(2026, 3, 30); // 2026-04-30
const WEEKDAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

// DOM Elements
const balanceDateInput = document.getElementById('balance-date');
const moveinDateInput = document.getElementById('movein-date');
const sameDateCheck = document.getElementById('same-date-check');
const statusMessage = document.getElementById('status-message');
const legendSection = document.getElementById('legend-section');

// State
let balanceDate = null;
let moveinDate = null;

// ==============================
// Date Utilities
// ==============================
function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// ==============================
// Construction logic
// ==============================
function getConstructionInfo(date) {
  if (!balanceDate || !moveinDate) return { simple: false, full: false };

  // 잔금일이 입주일보다 늦으면 계산하지 않음
  if (balanceDate > moveinDate) return { simple: false, full: false };

  const SIMPLE_MIN_DATE = new Date(2026, 1, 18); // 2026-02-18
  
  let simple = false;
  let full = false;

  // 간단시공 구간 계산: [입주일 - 5일] ~ [잔금일 - 1일]
  // 단, 시작일은 2월 18일 이후여야 함
  let simpleStart = addDays(moveinDate, -5);
  const simpleEnd = addDays(balanceDate, -1);

  // 2월 18일 이전이면 2월 18일로 clamp
  if (simpleStart < SIMPLE_MIN_DATE) {
    simpleStart = SIMPLE_MIN_DATE;
  }

  // 유효한 구간인 경우 (시작일 <= 종료일)
  if (simpleStart <= simpleEnd) {
    if (date >= simpleStart && date <= simpleEnd) {
      simple = true;
    }
  }

  // 모든시공: 잔금일 이후 (잔금일 포함? 아니면 다음날? 기획 확인 필요. 기존엔 다음날이었으나 예시: "3월 24일 잔금이면... 3월 24일부터는 모든시공")
  // 요청사항: "3월 24일 잔금이면 ... 3월 24일부터는 모든시공" -> 잔금일 당일부터 모든시공 가능으로 변경됨!
  // 기존 로직(잔금일 다음날)을 "잔금일 당일"로 수정
  const fullStart = balanceDate; 
  if (date >= fullStart) {
    full = true;
  }

  return { simple, full };
}

// ==============================
// Calendar Rendering
// ==============================
function renderCalendar(year, month, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'];

  // Month title
  const title = document.createElement('div');
  title.className = 'month-title';
  title.textContent = `${year}년 ${monthNames[month]}`;
  container.appendChild(title);

  // Weekday headers
  const weekdayHeader = document.createElement('div');
  weekdayHeader.className = 'weekday-header';
  WEEKDAYS_KR.forEach(day => {
    const span = document.createElement('span');
    span.textContent = day;
    weekdayHeader.appendChild(span);
  });
  container.appendChild(weekdayHeader);

  // Days grid
  const daysGrid = document.createElement('div');
  daysGrid.className = 'days-grid';

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Empty cells for days before start
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell empty';
    daysGrid.appendChild(emptyCell);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.textContent = d;

    const currentDate = new Date(year, month, d);
    const dayOfWeek = currentDate.getDay();

    // Weekend coloring
    if (dayOfWeek === 0) cell.classList.add('sunday');
    if (dayOfWeek === 6) cell.classList.add('saturday');

    // Out of range check (for visual dimming only)
    if (currentDate < MIN_DATE || currentDate > MAX_DATE) {
      cell.classList.add('out-of-range');
    }

    // Construction highlighting (applies regardless of input range)
    const info = getConstructionInfo(currentDate);
    if (info.simple && info.full) {
      cell.classList.add('both-day');
    } else if (info.simple) {
      cell.classList.add('simple-day');
    } else if (info.full) {
      cell.classList.add('full-day');
    }

    // Today marker
    if (isSameDay(currentDate, today)) {
      cell.classList.add('today');
    }

    // Balance date marker
    if (isSameDay(currentDate, balanceDate)) {
      cell.classList.add('balance-day');
    }

    // Move-in date marker
    if (isSameDay(currentDate, moveinDate)) {
      cell.classList.add('movein-day');
    }

    daysGrid.appendChild(cell);
  }

  container.appendChild(daysGrid);
}

function renderAllCalendars() {
  renderCalendar(2026, 1, 'cal-2026-02'); // February
  renderCalendar(2026, 2, 'cal-2026-03'); // March
  renderCalendar(2026, 3, 'cal-2026-04'); // April
}

// ==============================
// Status Message
// ==============================
function updateStatus() {
  if (!balanceDate && !moveinDate) {
    statusMessage.className = 'status-message';
    legendSection.className = 'legend-section';
    return;
  }

  if (balanceDate && moveinDate) {
    // Validate: 잔금일이 입주일보다 늦을 수 없음
    if (balanceDate > moveinDate) {
      statusMessage.className = 'status-message show warning';
      statusMessage.textContent = '⚠️ 잔금일은 입주일보다 늦을 수 없습니다. 날짜를 다시 확인해주세요.';
      legendSection.className = 'legend-section';
      return;
    }

    const sameDay = isSameDay(balanceDate, moveinDate);
    legendSection.className = 'legend-section show';

    if (balanceDate > moveinDate) {
      statusMessage.className = 'status-message show warning';
      statusMessage.textContent = '⚠️ 잔금일은 입주일보다 늦을 수 없습니다. 날짜를 다시 확인해주세요.';
      legendSection.className = 'legend-section';
      return;
    }

    // 간단시공 가능 여부 체크
    // 구간: [입주일 - 5] ~ [잔금일 - 1]
    // 2/18 clamping 고려
    const SIMPLE_MIN_DATE = new Date(2026, 1, 18);
    let simpleStart = addDays(moveinDate, -5);
    if (simpleStart < SIMPLE_MIN_DATE) simpleStart = SIMPLE_MIN_DATE;
    
    const simpleEnd = addDays(balanceDate, -1);
    const canDoSimple = simpleStart <= simpleEnd;

    legendSection.className = 'legend-section show';

    if (canDoSimple) {
      const sameDay = isSameDay(balanceDate, moveinDate);
      if (sameDay) {
        statusMessage.className = 'status-message show info';
        statusMessage.textContent = '✅ 잔금일과 입주일이 동일합니다. 입주일 5일 전부터 간단 시공이 가능합니다.';
      } else {
        const gap = Math.round((simpleEnd - simpleStart) / (1000 * 60 * 60 * 24)) + 1;
        statusMessage.className = 'status-message show info';
        statusMessage.textContent = `✅ 잔금일과 입주일 간격이 있어 ${gap}일간 간단 시공이 가능합니다.`;
      }
    } else {
      statusMessage.className = 'status-message show warning';
      statusMessage.textContent = '⚠️ 잔금일과 입주일 간격이 너무 멀어 간단 시공이 불가능합니다. (최소 5일 전 확보 필요)';
    }
  } else {
    statusMessage.className = 'status-message show info';
    statusMessage.textContent = '📅 잔금일과 입주일을 모두 입력해주세요.';
    legendSection.className = 'legend-section';
  }
}

// ==============================
// Event Handlers
// ==============================
function onDateChange() {
  balanceDate = parseDate(balanceDateInput.value);
  moveinDate = parseDate(moveinDateInput.value);

  // If same-date checkbox is checked, sync
  if (sameDateCheck.checked && balanceDateInput.value) {
    moveinDateInput.value = balanceDateInput.value;
    moveinDate = parseDate(moveinDateInput.value);
  }

  updateStatus();
  renderAllCalendars();
}

balanceDateInput.addEventListener('change', () => {
  if (sameDateCheck.checked) {
    moveinDateInput.value = balanceDateInput.value;
  }
  onDateChange();
});

moveinDateInput.addEventListener('change', () => {
  if (sameDateCheck.checked) {
    balanceDateInput.value = moveinDateInput.value;
  }
  onDateChange();
});

sameDateCheck.addEventListener('change', () => {
  if (sameDateCheck.checked) {
    if (balanceDateInput.value) {
      moveinDateInput.value = balanceDateInput.value;
    } else if (moveinDateInput.value) {
      balanceDateInput.value = moveinDateInput.value;
    }
    moveinDateInput.disabled = true;
  } else {
    moveinDateInput.disabled = false;
  }
  onDateChange();
});

// ==============================
// Initial Render
// ==============================
renderAllCalendars();
