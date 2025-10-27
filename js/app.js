// ======= Modelo de datos y helpers =======
const STORAGE = 'finanzas_lautaro_mobile';
let DB_FILES;
let state = JSON.parse(localStorage.getItem(STORAGE) || '{}');
const $ = (sel, root = document) => root.querySelector(sel);
const fmt = n => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2
}).format(Number(n || 0));

// ======= MANEJO DE MÓVIL =======
function initMobileMenu() {
  const mobileMenuBtn = $('#mobileMenuBtn');
  const sidebar = $('#sidebar');
  const mobileOverlay = $('#mobileOverlay');

  function toggleSidebar() {
    sidebar.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }

  mobileMenuBtn.addEventListener('click', toggleSidebar);
  mobileOverlay.addEventListener('click', toggleSidebar);

  // Cerrar sidebar al hacer clic en un item del menú (en móvil)
  document.querySelectorAll('.sidebar li').forEach(li => {
    li.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleSidebar();
      }
    });
  });

  // Cerrar sidebar al redimensionar a desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ======= SISTEMA DE CALENDARIO COMPLETO CON DÍAS =======
let currentSelectedYear = new Date().getFullYear();
let currentSelectedMonth = new Date().getMonth();
let currentSelectedDay = new Date().getDate();
let currentDecade = Math.floor(currentSelectedYear / 10) * 10;

function monthKey() {
  return `${currentSelectedYear}-${(currentSelectedMonth + 1).toString().padStart(2, '0')}`;
}

function initCalendar() {
  const dateContainer = document.querySelector('.date-container');
  const calendarModal = document.getElementById('calendarModal');
  const mesActualDisplay = document.getElementById('mesActualDisplay');
  const clearMonthBtn = document.getElementById('clearMonth');

  // Vistas del calendario
  const yearView = document.getElementById('yearView');
  const monthView = document.getElementById('monthView');
  const dayView = document.getElementById('dayView');

  // Elementos de año
  const yearRange = document.getElementById('yearRange');
  const yearGrid = document.getElementById('yearGrid');
  const prevDecadeBtn = document.getElementById('prevDecade');
  const nextDecadeBtn = document.getElementById('nextDecade');

  // Elementos de mes
  const currentYearElement = document.getElementById('currentYear');
  const monthGrid = document.getElementById('monthGrid');
  const prevYearBtn = document.getElementById('prevYear');
  const nextYearBtn = document.getElementById('nextYear');

  // Elementos de día
  const currentMonthYear = document.getElementById('currentMonthYear');
  const dayGrid = document.getElementById('dayGrid');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');

  // Meses en español
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthsFull = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  // Actualizar display del mes actual
  function updateMonthDisplay() {
    mesActualDisplay.textContent = `${monthsFull[currentSelectedMonth]} ${currentSelectedYear}`;
    $('#mesActual').value = monthKey();
  }

  // Mostrar vista específica
  function showView(view) {
    yearView.style.display = 'none';
    monthView.style.display = 'none';
    dayView.style.display = 'none';
    view.style.display = 'block';
  }

  // ======= VISTA DE AÑOS =======
  function renderYears() {
    yearRange.textContent = `${currentDecade}-${currentDecade + 9}`;
    yearGrid.innerHTML = '';

    for (let year = currentDecade; year < currentDecade + 10; year++) {
      const yearElement = document.createElement('div');
      yearElement.className = 'year-item';
      yearElement.textContent = year;

      if (year === currentSelectedYear) {
        yearElement.classList.add('selected');
      }
      if (year === new Date().getFullYear()) {
        yearElement.classList.add('current');
      }

      yearElement.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSelectedYear = year;
        renderMonths();
        showView(monthView);
      });

      yearGrid.appendChild(yearElement);
    }
  }

  // ======= VISTA DE MESES =======
  function renderMonths() {
    currentYearElement.textContent = currentSelectedYear;
    monthGrid.innerHTML = '';

    months.forEach((month, index) => {
      const monthElement = document.createElement('div');
      monthElement.className = 'month-item';
      monthElement.textContent = month;

      if (index === currentSelectedMonth && currentSelectedYear === new Date().getFullYear()) {
        monthElement.classList.add('current');
      }
      if (index === currentSelectedMonth) {
        monthElement.classList.add('selected');
      }

      monthElement.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSelectedMonth = index;
        renderDays();
        showView(dayView);
      });

      monthGrid.appendChild(monthElement);
    });
  }

  // ======= VISTA DE DÍAS =======
  function renderDays() {
    currentMonthYear.textContent = `${monthsFull[currentSelectedMonth]} ${currentSelectedYear}`;

    let weekDaysHTML = '<div class="week-days">';
    weekDays.forEach(day => {
      weekDaysHTML += `<div>${day}</div>`;
    });
    weekDaysHTML += '</div>';

    const firstDay = new Date(currentSelectedYear, currentSelectedMonth, 1);
    const lastDay = new Date(currentSelectedYear, currentSelectedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let daysHTML = '<div class="days-grid">';

    const prevMonthLastDay = new Date(currentSelectedYear, currentSelectedMonth, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthLastDay - (startingDay - 1 - i);
      daysHTML += `<div class="day-item other-month">${day}</div>`;
    }

    const today = new Date();
    const isToday = (day) => {
      return day === today.getDate() &&
        currentSelectedMonth === today.getMonth() &&
        currentSelectedYear === today.getFullYear();
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const isTodayClass = isToday(day) ? 'today' : '';
      const isSelectedClass = day === currentSelectedDay ? 'selected' : '';
      daysHTML += `<div class="day-item ${isTodayClass} ${isSelectedClass}" data-day="${day}">${day}</div>`;
    }

    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
      daysHTML += `<div class="day-item other-month">${day}</div>`;
    }

    daysHTML += '</div>';
    dayGrid.innerHTML = weekDaysHTML + daysHTML;

    dayGrid.querySelectorAll('.day-item:not(.other-month)').forEach(dayElement => {
      dayElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const day = parseInt(dayElement.getAttribute('data-day'));
        currentSelectedDay = day;

        dayGrid.querySelectorAll('.day-item').forEach(d => d.classList.remove('selected'));
        dayElement.classList.add('selected');

        updateMonthDisplay();
        calendarModal.classList.remove('show');
        renderKPIs();
        const activeSection = document.querySelector('.sidebar li.active');
        if (activeSection) {
          render(activeSection.dataset.section);
        }
      });
    });
  }

  // ======= EVENT LISTENERS =======
  prevDecadeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentDecade -= 10;
    renderYears();
  });

  nextDecadeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentDecade += 10;
    renderYears();
  });

  prevYearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSelectedYear--;
    renderMonths();
  });

  nextYearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSelectedYear++;
    renderMonths();
  });

  prevMonthBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSelectedMonth--;
    if (currentSelectedMonth < 0) {
      currentSelectedMonth = 11;
      currentSelectedYear--;
    }
    renderDays();
  });

  nextMonthBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSelectedMonth++;
    if (currentSelectedMonth > 11) {
      currentSelectedMonth = 0;
      currentSelectedYear++;
    }
    renderDays();
  });

  clearMonthBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres borrar todos los datos de este mes?')) {
      const key = monthKey();

      if (state[key]) {
        delete state[key];
        save();
        updateMonthDisplay();
        alert('Datos del mes borrados correctamente.');

        renderKPIs();
        const activeSection = document.querySelector('.sidebar li.active');
        if (activeSection) {
          render(activeSection.dataset.section);
        }
      } else {
        alert('No hay datos para borrar en este mes.');
      }
    }
  });

  dateContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    calendarModal.classList.toggle('show');
    if (calendarModal.classList.contains('show')) {
      renderYears();
      showView(yearView);
    }
  });

  document.addEventListener('click', (e) => {
    if (!dateContainer.contains(e.target) && !calendarModal.contains(e.target)) {
      calendarModal.classList.remove('show');
    }
  });

  updateMonthDisplay();
  renderYears();
}

// ======= CALENDARIO PARA FORMULARIOS =======
function initFormCalendar(inputId) {
  const input = document.getElementById(inputId);
  const calendarId = `calendar-${inputId}`;

  if (!document.getElementById(calendarId)) {
    const calendarHTML = `
            <div class="form-calendar-modal" id="${calendarId}">
                <div class="form-calendar-view">
                    <div class="form-calendar-header">
                        <button class="form-calendar-nav prev-month"><i class="fas fa-chevron-left"></i></button>
                        <span class="form-calendar-month-year">Enero 2025</span>
                        <button class="form-calendar-nav next-month"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="form-day-grid">
                        <div class="form-week-days">
                            <div>D</div><div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div>
                        </div>
                        <div class="form-days-grid" id="days-${calendarId}"></div>
                    </div>
                </div>
            </div>
        `;

    const container = document.createElement('div');
    container.className = 'form-calendar-container';
    container.innerHTML = calendarHTML;

    input.parentNode.insertBefore(container, input.nextSibling);
    container.insertBefore(input, container.firstChild);
  }

  const calendarModal = document.getElementById(calendarId);
  const monthYearDisplay = calendarModal.querySelector('.form-calendar-month-year');
  const daysGrid = document.getElementById(`days-${calendarId}`);
  const prevMonthBtn = calendarModal.querySelector('.prev-month');
  const nextMonthBtn = calendarModal.querySelector('.next-month');

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  const monthsFull = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  function renderFormCalendarDays() {
    monthYearDisplay.textContent = `${monthsFull[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let daysHTML = '';

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthLastDay - (startingDay - 1 - i);
      daysHTML += `<div class="form-day-item other-month">${day}</div>`;
    }

    const today = new Date();
    const isToday = (day) => {
      return day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
    };

    const currentValue = input.value ? new Date(input.value) : null;

    for (let day = 1; day <= daysInMonth; day++) {
      const isTodayClass = isToday(day) ? 'today' : '';
      const isSelectedClass = currentValue &&
        day === currentValue.getDate() &&
        currentMonth === currentValue.getMonth() &&
        currentYear === currentValue.getFullYear() ? 'selected' : '';
      daysHTML += `<div class="form-day-item ${isTodayClass} ${isSelectedClass}" data-day="${day}">${day}</div>`;
    }

    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
      daysHTML += `<div class="form-day-item other-month">${day}</div>`;
    }

    daysGrid.innerHTML = daysHTML;

    daysGrid.querySelectorAll('.form-day-item:not(.other-month)').forEach(dayElement => {
      dayElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const day = parseInt(dayElement.getAttribute('data-day'));
        const selectedDate = new Date(currentYear, currentMonth, day);
        input.value = selectedDate.toISOString().split('T')[0];

        daysGrid.querySelectorAll('.form-day-item').forEach(d => d.classList.remove('selected'));
        dayElement.classList.add('selected');

        calendarModal.classList.remove('show');
      });
    });
  }

  prevMonthBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderFormCalendarDays();
  });

  nextMonthBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderFormCalendarDays();
  });

  input.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.form-calendar-modal.show').forEach(modal => {
      if (modal.id !== calendarId) {
        modal.classList.remove('show');
      }
    });
    calendarModal.classList.toggle('show');

    if (input.value) {
      const date = new Date(input.value);
      currentYear = date.getFullYear();
      currentMonth = date.getMonth();
    }

    renderFormCalendarDays();
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !calendarModal.contains(e.target)) {
      calendarModal.classList.remove('show');
    }
  });

  renderFormCalendarDays();
}

// ======= FIN SISTEMA DE CALENDARIO =======

function ensureMonth() {
  const k = monthKey();
  if (!state[k]) state[k] = {
    sueldo: 0,
    servicios: [],
    mama: [],
    delivery: [],
    transporte: [],
    mascotas: [],
    salud: [],
    deportes: [],
    salidas: [],
    cochera: [],
    lucy: [],
    cristina: [],
    tarjetas: {
      ciudad: { limite: 0, utilizado: 0, movimientos: [] },
      naranja: { limite: 0, utilizado: 0, movimientos: [] }
    }
  };
  return k;
}

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(state));
  renderKPIs();
}

// ======= IndexedDB para comprobantes =======
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('finanzas_recibos', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idb() {
  if (DB_FILES) return DB_FILES;
  DB_FILES = await idbOpen();
  return DB_FILES;
}

async function storeFile(file) {
  if (!file) return null;
  const buf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  const rec = { id: crypto.randomUUID(), name: file.name, type: file.type, data: base64, ts: Date.now() };
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put(rec);
    tx.oncomplete = () => resolve(rec.id);
    tx.onerror = () => reject(tx.error);
  });
}

async function getFileMeta(id) {
  if (!id) return null;
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const req = tx.objectStore('files').get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function downloadFile(id) {
  const rec = await getFileMeta(id);
  if (!rec) return alert('Archivo no encontrado');
  const bytes = Uint8Array.from(atob(rec.data), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: rec.type || 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = rec.name;
  a.click();
}

// ======= Init =======
(function init() {
  initMobileMenu();
  initCalendar();

  document.querySelectorAll('.sidebar li').forEach(li => li.addEventListener('click', () => {
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active'));
    li.classList.add('active');
    render(li.dataset.section);
  }));

  $('#btnExport').onclick = exportAll;
  $('#fileImport').onchange = importAll;
  $('#btnPDF').onclick = downloadPDF;

  render('sueldo');
  renderKPIs();
})();

// ======= KPIs =======
function renderKPIs() {
  const k = ensureMonth(), m = state[k];
  const sueldo = m.sueldo || 0;
  const gastosKeys = ['servicios', 'mama', 'delivery', 'transporte', 'mascotas', 'salud', 'deportes', 'salidas', 'cochera', 'lucy', 'cristina'];
  const gastos = gastosKeys.reduce((acc, key) => acc + m[key].reduce((a, b) => a + Number(b.monto), 0), 0);
  const tarjetasUsado = (m.tarjetas.ciudad.utilizado || 0) + (m.tarjetas.naranja.utilizado || 0);
  $('#kpiSueldo').textContent = fmt(sueldo);
  $('#kpiGastos').textContent = fmt(gastos);
  $('#kpiTarjetas').textContent = fmt(tarjetasUsado);
  $('#kpiBalance').textContent = fmt(sueldo - gastos - tarjetasUsado);
}

// ======= Render de secciones =======
function render(id) {
  const k = ensureMonth();
  const m = state[k];
  const el = $('#mainSection');
  el.innerHTML = '';

  if (id === 'sueldo') {
    el.innerHTML = `
      <div class="card">
        <h2><i class="fas fa-money-bill-wave"></i> Sueldo del mes</h2>
        <form id="formSueldo">
          <label><i class="fas fa-dollar-sign"></i> Monto</label>
          <input type="number" id="sueldoMonto" value="${m.sueldo || ''}" placeholder="4000000" inputmode="numeric"/>
          <button><i class="fas fa-save"></i> Guardar</button>
        </form>
      </div>`;
    $('#formSueldo').onsubmit = (e) => {
      e.preventDefault();
      m.sueldo = Number($('#sueldoMonto').value || 0);
      save();
      alert('Sueldo guardado.');
    };
    return;
  }

  if (id === 'tarjetas') return renderTarjetas(m);
  if (id === 'servicios') return renderGeneric('🏠 Servicios Hogar', 'servicios', m, ['Luz', 'Gas', 'Agua', 'Internet/Flow', 'ARBA', 'APR']);
  if (id === 'mama') return renderGeneric('👩 Mamá', 'mama', m, ['Claro', 'Flow', 'Luz', 'Transferencia']);
  if (id === 'delivery') return renderGeneric('🍔 PedidosYa', 'delivery', m, ['PedidosYa']);
  if (id === 'transporte') return renderGeneric('🚗 Transporte', 'transporte', m, ['Uber', 'DiDi', 'SUBE']);
  if (id === 'mascotas') return renderGeneric('🐶 Mascotas', 'mascotas', m, ['Alimento perros', 'Vet', 'Accesorios']);
  if (id === 'salud') return renderGeneric('🧠 Salud Mental', 'salud', m, ['Psicóloga Lautaro', 'Psiquiatra Lautaro', 'Terapia de pareja']);
  if (id === 'deportes') return renderGeneric('🏋️ Deportes', 'deportes', m, ['Pádel', 'Gimnasio']);
  if (id === 'salidas') return renderGeneric('🎬 Salidas', 'salidas', m, ['Cine', 'Restaurante', 'Bar', 'Evento', 'Otro']);
  if (id === 'cochera') return renderGeneric('🅿️ Pago Cochera', 'cochera', m, ['Cochera Mensual']);
  if (id === 'lucy') return renderGeneric('👩 Pago Lucy', 'lucy', m, ['Pago Lucy']);
  if (id === 'cristina') return renderGeneric('👩 Pago Cristina', 'cristina', m, ['Pago Cristina']);
  if (id === 'resumen') return renderResumen(m);
}

// ======= Generic section (left form + right table) =======
function renderGeneric(titulo, key, m, opciones) {
  const el = $('#mainSection');
  const formHTML = `
  <div class="grid2">
    <div class="card">
      <h2>${titulo}</h2>
      <form id="form-${key}">
        <label><i class="fas fa-tag"></i> Categoría</label>
        <select id="cat-${key}">${opciones.map(o => `<option>${o}</option>`).join('')}</select>
        <label><i class="fas fa-align-left"></i> Descripción</label>
        <input id="desc-${key}" placeholder="Detalle" />
        <label><i class="fas fa-dollar-sign"></i> Monto</label>
        <input type="number" id="monto-${key}" inputmode="decimal" />
        <label><i class="fas fa-calendar"></i> Fecha</label>
        <input type="date" id="fecha-${key}" class="form-calendar-input" />
        <label><i class="fas fa-credit-card"></i> Método de pago</label>
        <select id="pago-${key}">
          <option>Efectivo/Débito</option>
          <option>Tarjeta Banco Ciudad</option>
          <option>Tarjeta Naranja X</option>
          <option>Transferencia</option>
        </select>
        <label><i class="fas fa-file-upload"></i> Comprobante (PDF/Imagen)</label>
        <input type="file" id="file-${key}" accept="application/pdf,image/*" />
        <button><i class="fas fa-plus"></i> Agregar</button>
      </form>
    </div>
    <div class="card">
      <h2><i class="fas fa-list"></i> Registros</h2>
      <div id="tabla-${key}"></div>
    </div>
  </div>`;
  el.innerHTML = formHTML;

  setTimeout(() => {
    initFormCalendar(`fecha-${key}`);
  }, 100);

  $(`#form-${key}`).onsubmit = async (e) => {
    e.preventDefault();
    const cat = $(`#cat-${key}`).value;
    const desc = $(`#desc-${key}`).value.trim();
    const monto = Number($(`#monto-${key}`).value || 0);
    const fecha = $(`#fecha-${key}`).value;
    const pago = $(`#pago-${key}`).value;
    const file = $(`#file-${key}`).files[0];

    if (!desc || !monto || !fecha) return alert('Completá descripción, monto y fecha.');

    const fileId = file ? await storeFile(file) : null;
    const item = {
      id: crypto.randomUUID(),
      cat,
      desc,
      monto,
      fecha,
      pago,
      fileId
    };

    m[key].push(item);

    if (pago.includes('Ciudad')) m.tarjetas.ciudad.utilizado += monto;
    if (pago.includes('Naranja')) m.tarjetas.naranja.utilizado += monto;

    save();
    drawTable(key, m[key]);

    $(`#desc-${key}`).value = '';
    $(`#monto-${key}`).value = '';
    $(`#file-${key}`).value = '';
    $(`#desc-${key}`).focus();
  };

  drawTable(key, m[key]);
}

// ======= Tabla generica =======
function drawTable(key, items) {
  const cont = $(`#tabla-${key}`);
  if (!items || items.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px"><i class="fas fa-inbox"></i> Sin registros.</p>';
    return;
  }

  const sortedItems = [...items].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  cont.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th><i class="fas fa-tag"></i> Cat</th>
            <th><i class="fas fa-align-left"></i> Desc</th>
            <th><i class="fas fa-dollar-sign"></i> Monto</th>
            <th><i class="fas fa-calendar"></i> Fecha</th>
            <th><i class="fas fa-cog"></i> Acción</th>
          </tr>
        </thead>
        <tbody>
          ${sortedItems.map(it => `
            <tr>
              <td><span class="pill">${it.cat}</span></td>
              <td>${it.desc}</td>
              <td>${fmt(it.monto)}</td>
              <td>${it.fecha}</td>
              <td>
                <button class="danger" onclick="deleteItem('${key}','${it.id}')" style="padding:8px 12px;font-size:0.8rem">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function deleteItem(key, id) {
  const k = ensureMonth();
  const m = state[k];
  const idx = m[key].findIndex(x => x.id === id);
  if (idx < 0) return;

  const it = m[key][idx];
  if (it.pago?.includes('Ciudad')) m.tarjetas.ciudad.utilizado -= Number(it.monto || 0);
  if (it.pago?.includes('Naranja')) m.tarjetas.naranja.utilizado -= Number(it.monto || 0);

  m[key].splice(idx, 1);
  save();
  drawTable(key, m[key]);
}

// ======= Tarjetas =======
function renderTarjetas(m) {
  const el = $('#mainSection');
  el.innerHTML = `
  <div class="grid2">
    <div class="card">
      <h2><i class="fas fa-credit-card"></i> Banco Ciudad</h2>
      <form id="form-ciudad">
        <label><i class="fas fa-chart-line"></i> Límite</label>
        <input type="number" id="lim-ciudad" value="${m.tarjetas.ciudad.limite || 0}" inputmode="decimal"/>
        <label><i class="fas fa-exchange-alt"></i> Operación</label>
        <select id="op-ciudad">
          <option>Consumo</option>
          <option>Pago</option>
        </select>
        <label><i class="fas fa-dollar-sign"></i> Monto</label>
        <input type="number" id="monto-ciudad" inputmode="decimal"/>
        <button><i class="fas fa-save"></i> Guardar</button>
      </form>
      <p style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;text-align:center"><b>Utilizado:</b> ${fmt(m.tarjetas.ciudad.utilizado || 0)}<br><b>Disponible:</b> ${fmt((m.tarjetas.ciudad.limite || 0) - (m.tarjetas.ciudad.utilizado || 0))}</p>
    </div>
    <div class="card">
      <h2><i class="fas fa-credit-card"></i> Naranja X</h2>
      <form id="form-naranja">
        <label><i class="fas fa-chart-line"></i> Límite</label>
        <input type="number" id="lim-naranja" value="${m.tarjetas.naranja.limite || 0}" inputmode="decimal"/>
        <label><i class="fas fa-exchange-alt"></i> Operación</label>
        <select id="op-naranja">
          <option>Consumo</option>
          <option>Pago</option>
        </select>
        <label><i class="fas fa-dollar-sign"></i> Monto</label>
        <input type="number" id="monto-naranja" inputmode="decimal"/>
        <button><i class="fas fa-save"></i> Guardar</button>
      </form>
      <p style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;text-align:center"><b>Utilizado:</b> ${fmt(m.tarjetas.naranja.utilizado || 0)}<br><b>Disponible:</b> ${fmt((m.tarjetas.naranja.limite || 0) - (m.tarjetas.naranja.utilizado || 0))}</p>
    </div>
  </div>
  <div class="card">
    <h2><i class="fas fa-list"></i> Movimientos</h2>
    <div id="tabla-tarjetas"></div>
  </div>`;

  $('#form-ciudad').onsubmit = (e) => {
    e.preventDefault();
    m.tarjetas.ciudad.limite = Number($('#lim-ciudad').value || 0);
    const op = $('#op-ciudad').value;
    const monto = Number($('#monto-ciudad').value || 0);

    if (monto > 0) {
      if (op === 'Consumo') {
        m.tarjetas.ciudad.utilizado += monto;
      } else {
        m.tarjetas.ciudad.utilizado = Math.max(0, m.tarjetas.ciudad.utilizado - monto);
      }
      m.tarjetas.ciudad.movimientos.push({
        id: crypto.randomUUID(),
        tarjeta: 'Ciudad',
        op,
        monto,
        fecha: new Date().toISOString().slice(0, 10)
      });
    }
    save();
    render('tarjetas');
  };

  $('#form-naranja').onsubmit = (e) => {
    e.preventDefault();
    m.tarjetas.naranja.limite = Number($('#lim-naranja').value || 0);
    const op = $('#op-naranja').value;
    const monto = Number($('#monto-naranja').value || 0);

    if (monto > 0) {
      if (op === 'Consumo') {
        m.tarjetas.naranja.utilizado += monto;
      } else {
        m.tarjetas.naranja.utilizado = Math.max(0, m.tarjetas.naranja.utilizado - monto);
      }
      m.tarjetas.naranja.movimientos.push({
        id: crypto.randomUUID(),
        tarjeta: 'Naranja X',
        op,
        monto,
        fecha: new Date().toISOString().slice(0, 10)
      });
    }
    save();
    render('tarjetas');
  };

  drawMovs(m);
}

function drawMovs(m) {
  const items = [...m.tarjetas.ciudad.movimientos, ...m.tarjetas.naranja.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const cont = $('#tabla-tarjetas');

  if (items.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px"><i class="fas fa-inbox"></i> Sin movimientos.</p>';
    return;
  }

  cont.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th><i class="fas fa-credit-card"></i> Tarjeta</th>
            <th><i class="fas fa-exchange-alt"></i> Operación</th>
            <th><i class="fas fa-dollar-sign"></i> Monto</th>
            <th><i class="fas fa-calendar"></i> Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td>${i.tarjeta}</td>
              <td>${i.op}</td>
              <td>${fmt(i.monto)}</td>
              <td>${i.fecha}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ======= Resumen =======
function renderResumen(m) {
  const byCat = [
    'servicios', 'mama', 'delivery', 'transporte',
    'mascotas', 'salud', 'deportes', 'salidas', 'cochera', 'lucy', 'cristina'
  ].map(key => [key, m[key].reduce((a, b) => a + Number(b.monto), 0)]);

  const gastos = byCat.reduce((a, [, v]) => a + v, 0);
  const tarjetasUsado = (m.tarjetas.ciudad.utilizado || 0) + (m.tarjetas.naranja.utilizado || 0);

  $('#mainSection').innerHTML = `
    <div class="card">
      <h2><i class="fas fa-chart-bar"></i> Balance del mes</h2>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8fafc;border-radius:8px">
          <span><i class="fas fa-money-bill-wave"></i> Ingresos:</span>
          <b>${fmt(m.sueldo || 0)}</b>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8fafc;border-radius:8px">
          <span><i class="fas fa-receipt"></i> Gastos:</span>
          <b>${fmt(gastos)}</b>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8fafc;border-radius:8px">
          <span><i class="fas fa-credit-card"></i> Tarjetas:</span>
          <b>${fmt(tarjetasUsado)}</b>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:${(m.sueldo || 0) - gastos - tarjetasUsado >= 0 ? '#dcfce7' : '#fee2e2'};border-radius:8px;border:2px solid ${(m.sueldo || 0) - gastos - tarjetasUsado >= 0 ? '#22c55e' : '#ef4444'}">
          <span><i class="fas fa-balance-scale"></i> Resultado:</span>
          <b style="color:${(m.sueldo || 0) - gastos - tarjetasUsado >= 0 ? '#22c55e' : '#ef4444'};font-size:1.2rem">${fmt((m.sueldo || 0) - gastos - tarjetasUsado)}</b>
        </div>
      </div>
    </div>
    <div class="card">
      <h2><i class="fas fa-chart-pie"></i> Gastos por categoría</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
        ${byCat.filter(([, v]) => v > 0).map(([k, v]) => `
          <div class="pill" style="margin:4px">
            <i class="fas fa-folder"></i> ${k}: <b>${fmt(v)}</b>
          </div>
        `).join('') || '<p style="color:var(--muted);text-align:center;width:100%"><i class="fas fa-inbox"></i> Sin gastos</p>'}
      </div>
    </div>`;
}

// ======= Export/Import =======
async function exportAll() {
  const db = await idb();
  const tx = db.transaction('files', 'readonly');
  const req = tx.objectStore('files').getAll();

  req.onsuccess = () => {
    const dump = { state, files: req.result };
    const blob = new Blob([JSON.stringify(dump)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `finanzas_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
}

async function importAll(e) {
  const f = e.target.files?.[0];
  if (!f) return;

  const txt = await f.text();
  const dump = JSON.parse(txt);
  state = dump.state || {};
  save();

  const db = await idb();
  await new Promise((resolve) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    (dump.files || []).forEach(rec => store.put(rec));
    tx.oncomplete = resolve;
  });

  alert('Importación completa');
  render('resumen');
}

function downloadPDF() {
  alert('Función PDF en desarrollo para móvil');
}