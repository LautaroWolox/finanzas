// ======= Modelo de datos y helpers =======
const STORAGE='finanzas_lautaro_v4';
let DB_FILES; // IndexedDB for receipts
let state = JSON.parse(localStorage.getItem(STORAGE) || '{}');
const $ = (sel,root=document)=>root.querySelector(sel);
const fmt = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(Number(n||0));

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
                e.stopPropagation(); // Prevenir que el evento se propague
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
                e.stopPropagation(); // Prevenir que el evento se propague
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
        
        // Crear encabezados de días de la semana
        let weekDaysHTML = '<div class="week-days">';
        weekDays.forEach(day => {
            weekDaysHTML += `<div>${day}</div>`;
        });
        weekDaysHTML += '</div>';

        // Crear grid de días
        const firstDay = new Date(currentSelectedYear, currentSelectedMonth, 1);
        const lastDay = new Date(currentSelectedYear, currentSelectedMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.

        let daysHTML = '<div class="days-grid">';

        // Días del mes anterior
        const prevMonthLastDay = new Date(currentSelectedYear, currentSelectedMonth, 0).getDate();
        for (let i = 0; i < startingDay; i++) {
            const day = prevMonthLastDay - (startingDay - 1 - i);
            daysHTML += `<div class="day-item other-month">${day}</div>`;
        }

        // Días del mes actual
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

        // Días del siguiente mes para completar la grid
        const totalCells = 42; // 6 semanas * 7 días
        const remainingCells = totalCells - (startingDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            daysHTML += `<div class="day-item other-month">${day}</div>`;
        }

        daysHTML += '</div>';
        dayGrid.innerHTML = weekDaysHTML + daysHTML;

        // Agregar event listeners a los días
        dayGrid.querySelectorAll('.day-item:not(.other-month)').forEach(dayElement => {
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevenir que el evento se propague
                const day = parseInt(dayElement.getAttribute('data-day'));
                currentSelectedDay = day;
                
                // Aquí podrías usar el día seleccionado si lo necesitas
                // Por ahora solo actualizamos la selección visual
                dayGrid.querySelectorAll('.day-item').forEach(d => d.classList.remove('selected'));
                dayElement.classList.add('selected');
                
                // Cerrar modal y actualizar
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
    // Navegación de décadas
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

    // Navegación de años
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

    // Navegación de meses
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

    // Borrar mes actual
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

    // Abrir/cerrar modal
    dateContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        calendarModal.classList.toggle('show');
        if (calendarModal.classList.contains('show')) {
            renderYears();
            showView(yearView);
        }
    });

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!dateContainer.contains(e.target) && !calendarModal.contains(e.target)) {
            calendarModal.classList.remove('show');
        }
    });

    // Inicializar
    updateMonthDisplay();
    renderYears();
}

// ======= CALENDARIO PARA FORMULARIOS =======
function initFormCalendar(inputId) {
    const input = document.getElementById(inputId);
    const calendarId = `calendar-${inputId}`;
    
    // Crear el modal del calendario si no existe
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
    const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    
    function renderFormCalendarDays() {
        monthYearDisplay.textContent = `${monthsFull[currentMonth]} ${currentYear}`;
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        let daysHTML = '';
        
        // Días del mes anterior
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = 0; i < startingDay; i++) {
            const day = prevMonthLastDay - (startingDay - 1 - i);
            daysHTML += `<div class="form-day-item other-month">${day}</div>`;
        }
        
        // Días del mes actual
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
        
        // Días del siguiente mes
        const totalCells = 42;
        const remainingCells = totalCells - (startingDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            daysHTML += `<div class="form-day-item other-month">${day}</div>`;
        }
        
        daysGrid.innerHTML = daysHTML;
        
        // Event listeners para los días
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
    
    // Navegación
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
    
    // Abrir/cerrar calendario
    input.addEventListener('click', (e) => {
        e.stopPropagation();
        // Cerrar otros calendarios
        document.querySelectorAll('.form-calendar-modal.show').forEach(modal => {
            if (modal.id !== calendarId) {
                modal.classList.remove('show');
            }
        });
        calendarModal.classList.toggle('show');
        
        // Si hay un valor en el input, mostrar ese mes
        if (input.value) {
            const date = new Date(input.value);
            currentYear = date.getFullYear();
            currentMonth = date.getMonth();
        }
        
        renderFormCalendarDays();
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !calendarModal.contains(e.target)) {
            calendarModal.classList.remove('show');
        }
    });
    
    // Render inicial
    renderFormCalendarDays();
}

// ======= FIN SISTEMA DE CALENDARIO =======

function ensureMonth(){
  const k=monthKey();
  if(!state[k]) state[k]={
    sueldo:0,
    servicios:[], 
    mama:[],
    delivery:[], 
    transporte:[], 
    mascotas:[], 
    salud:[], 
    deportes:[],
    salidas:[],
    cochera:[],
    lucy:[],
    cristina:[],
    tarjetas:{
      ciudad:{limite:0, utilizado:0, movimientos:[]},
      naranja:{limite:0, utilizado:0, movimientos:[]}
    }
  };
  return k;
}

function save(){ 
  localStorage.setItem(STORAGE, JSON.stringify(state)); 
  renderKPIs(); 
}

// ======= IndexedDB para comprobantes =======
function idbOpen(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open('finanzas_recibos',1);
    req.onupgradeneeded = ()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains('files')) db.createObjectStore('files',{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function idb(){ 
  if(DB_FILES) return DB_FILES; 
  DB_FILES = await idbOpen(); 
  return DB_FILES; 
}

async function storeFile(file){
  if(!file) return null;
  const buf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  const rec = {id: crypto.randomUUID(), name:file.name, type:file.type, data:base64, ts:Date.now()};
  const db = await idb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction('files','readwrite');
    tx.objectStore('files').put(rec);
    tx.oncomplete=()=>resolve(rec.id);
    tx.onerror=()=>reject(tx.error);
  });
}

async function getFileMeta(id){
  if(!id) return null;
  const db=await idb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('files','readonly');
    const req=tx.objectStore('files').get(id);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function downloadFile(id){
  const rec = await getFileMeta(id); 
  if(!rec) return alert('Archivo no encontrado');
  const bytes = Uint8Array.from(atob(rec.data), c=>c.charCodeAt(0));
  const blob = new Blob([bytes], {type: rec.type||'application/octet-stream'});
  const a = document.createElement('a');
  a.href=URL.createObjectURL(blob); 
  a.download=rec.name; 
  a.click();
}

// ======= Init =======
(function init(){
  // Inicializar calendario primero
  initCalendar();
  
  // menú
  document.querySelectorAll('.sidebar li').forEach(li=>li.addEventListener('click',()=>{
    document.querySelectorAll('.sidebar li').forEach(el=>el.classList.remove('active'));
    li.classList.add('active'); 
    render(li.dataset.section);
  }));
  
  // export / import
  $('#btnExport').onclick = exportAll;
  $('#fileImport').onchange = importAll;
  $('#btnPDF').onclick = downloadPDF;
  
  render('sueldo');
  renderKPIs();
})();

// ======= KPIs =======
function renderKPIs(){
  const k=ensureMonth(), m=state[k];
  const sueldo=m.sueldo||0;
  const gastosKeys = ['servicios', 'mama', 'delivery', 'transporte', 'mascotas', 'salud', 'deportes', 'salidas', 'cochera', 'lucy', 'cristina'];
  const gastos = gastosKeys.reduce((acc,key)=>acc + m[key].reduce((a,b)=>a+Number(b.monto),0),0);
  const tarjetasUsado = (m.tarjetas.ciudad.utilizado||0) + (m.tarjetas.naranja.utilizado||0);
  $('#kpiSueldo').textContent = fmt(sueldo);
  $('#kpiGastos').textContent = fmt(gastos);
  $('#kpiTarjetas').textContent = fmt(tarjetasUsado);
  $('#kpiBalance').textContent = fmt(sueldo - gastos - tarjetasUsado);
}

// ======= Render de secciones =======
function render(id){
  const k=ensureMonth(); 
  const m=state[k];
  const el = $('#mainSection'); 
  el.innerHTML='';
  
  if(id==='sueldo'){
    el.innerHTML = `
      <div class="card">
        <h2><i class="fas fa-money-bill-wave"></i> Sueldo del mes</h2>
        <form id="formSueldo">
          <label><i class="fas fa-dollar-sign"></i> Monto</label>
          <input type="number" id="sueldoMonto" value="${m.sueldo||''}" placeholder="4000000"/>
          <button><i class="fas fa-save"></i> Guardar</button>
        </form>
      </div>`;
    $('#formSueldo').onsubmit=(e)=>{
      e.preventDefault(); 
      m.sueldo=Number($('#sueldoMonto').value||0); 
      save(); 
      alert('Sueldo guardado.');
    };
    return;
  }
  
  if(id==='tarjetas') return renderTarjetas(m);
  if(id==='servicios') return renderGeneric('🏠 Servicios Hogar','servicios', m, ['Luz','Gas','Agua','Internet/Flow','ARBA','APR']);
  if(id==='mama') return renderGeneric('👩 Mamá','mama', m, ['Claro','Flow','Luz','Transferencia']);
  if(id==='delivery') return renderGeneric('🍔 PedidosYa','delivery', m, ['PedidosYa']);
  if(id==='transporte') return renderGeneric('🚗 Transporte','transporte', m, ['Uber','DiDi','SUBE']);
  if(id==='mascotas') return renderGeneric('🐶 Mascotas','mascotas', m, ['Alimento perros','Vet','Accesorios']);
  if(id==='salud') return renderGeneric('🧠 Salud Mental','salud', m, ['Psicóloga Lautaro','Psiquiatra Lautaro','Terapia de pareja']);
  if(id==='deportes') return renderGeneric('🏋️ Deportes','deportes', m, ['Pádel','Gimnasio']);
  if(id==='salidas') return renderGeneric('🎬 Salidas','salidas', m, ['Cine','Restaurante','Bar','Evento','Otro']);
  if(id==='cochera') return renderGeneric('🅿️ Pago Cochera','cochera', m, ['Cochera Mensual']);
  if(id==='lucy') return renderGeneric('👩 Pago Lucy','lucy', m, ['Pago Lucy']);
  if(id==='cristina') return renderGeneric('👩 Pago Cristina','cristina', m, ['Pago Cristina']);
  if(id==='resumen') return renderResumen(m);
}

// ======= Generic section (left form + right table) =======
function renderGeneric(titulo,key,m,opciones){
  const el=$('#mainSection');
  const formHTML = `
  <div class="grid2">
    <div class="card">
      <h2>${titulo}</h2>
      <form id="form-${key}">
        <label><i class="fas fa-tag"></i> Categoría</label>
        <select id="cat-${key}">${opciones.map(o=>`<option>${o}</option>`).join('')}</select>
        <label><i class="fas fa-align-left"></i> Descripción</label>
        <input id="desc-${key}" placeholder="Detalle"/>
        <label><i class="fas fa-dollar-sign"></i> Monto</label>
        <input type="number" id="monto-${key}" />
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
        <input type="file" id="file-${key}" accept="application/pdf,image/*"/>
        <button><i class="fas fa-plus"></i> Agregar</button>
      </form>
    </div>
    <div class="card">
      <h2><i class="fas fa-list"></i> Registros</h2>
      <div id="tabla-${key}"></div>
    </div>
  </div>`;
  el.innerHTML = formHTML;
  
  // Inicializar calendario para este formulario
  setTimeout(() => {
    initFormCalendar(`fecha-${key}`);
  }, 100);
  
  // submit
  $(`#form-${key}`).onsubmit = async (e)=>{
    e.preventDefault();
    const cat=$(`#cat-${key}`).value; 
    const desc=$(`#desc-${key}`).value.trim();
    const monto=Number($(`#monto-${key}`).value||0); 
    const fecha=$(`#fecha-${key}`).value;
    const pago=$(`#pago-${key}`).value;
    const file=$(`#file-${key}`).files[0];
    
    if(!desc || !monto || !fecha) return alert('Completá descripción, monto y fecha.');
    
    const fileId = file? await storeFile(file): null;
    const item={
      id:crypto.randomUUID(), 
      cat, 
      desc, 
      monto, 
      fecha,
      pago, 
      fileId
    };
    
    m[key].push(item);
    
    // Ajuste tarjetas si corresponde
    if(pago.includes('Ciudad')) m.tarjetas.ciudad.utilizado += monto;
    if(pago.includes('Naranja')) m.tarjetas.naranja.utilizado += monto;
    
    save(); 
    drawTable(key,m[key]);
    
    // reset rápido para seguir cargando
    $(`#desc-${key}`).value=''; 
    $(`#monto-${key}`).value=''; 
    $(`#file-${key}`).value='';
    $(`#desc-${key}`).focus();
  };
  
  drawTable(key,m[key]);
}

// ======= Tabla generica =======
function drawTable(key,items){
  const cont = $(`#tabla-${key}`);
  if(!items || items.length===0){ 
    cont.innerHTML='<p style="color:var(--muted)"><i class="fas fa-inbox"></i> Sin registros.</p>'; 
    return; 
  }
  
  // Ordenar por fecha (más reciente primero)
  const sortedItems = [...items].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  
  cont.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th><i class="fas fa-tag"></i> Cat</th>
            <th><i class="fas fa-align-left"></i> Desc</th>
            <th><i class="fas fa-credit-card"></i> Pago</th>
            <th><i class="fas fa-dollar-sign"></i> Monto</th>
            <th><i class="fas fa-calendar"></i> Fecha</th>
            <th><i class="fas fa-file"></i> Recibo</th>
            <th><i class="fas fa-cog"></i> Acción</th>
          </tr>
        </thead>
        <tbody>
          ${sortedItems.map(it=>`
            <tr>
              <td><span class="pill">${it.cat}</span></td>
              <td>${it.desc}</td>
              <td>${it.pago}</td>
              <td>${fmt(it.monto)}</td>
              <td>${it.fecha}</td>
              <td>
                ${it.fileId ? 
                  `<button class="ghost" onclick="downloadFile('${it.fileId}')">
                    <i class="fas fa-download"></i> Descargar
                  </button>` : 
                  '—'
                }
              </td>
              <td>
                <button class="danger" onclick="deleteItem('${key}','${it.id}')">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function deleteItem(key,id){
  const k=ensureMonth(); 
  const m=state[k];
  const idx = m[key].findIndex(x=>x.id===id); 
  if(idx<0) return;
  
  // revert tarjetas
  const it = m[key][idx];
  if(it.pago?.includes('Ciudad')) m.tarjetas.ciudad.utilizado -= Number(it.monto||0);
  if(it.pago?.includes('Naranja')) m.tarjetas.naranja.utilizado -= Number(it.monto||0);
  
  m[key].splice(idx,1); 
  save(); 
  drawTable(key,m[key]);
}

// ======= Tarjetas =======
function renderTarjetas(m){
  const el=$('#mainSection');
  el.innerHTML = `
  <div class="grid2">
    <div class="card">
      <h2><i class="fas fa-credit-card"></i> Banco Ciudad</h2>
      <form id="form-ciudad">
        <label><i class="fas fa-chart-line"></i> Límite</label>
        <input type="number" id="lim-ciudad" value="${m.tarjetas.ciudad.limite||0}"/>
        <label><i class="fas fa-exchange-alt"></i> Operación</label>
        <select id="op-ciudad">
          <option>Consumo</option>
          <option>Pago</option>
        </select>
        <label><i class="fas fa-dollar-sign"></i> Monto</label>
        <input type="number" id="monto-ciudad"/>
        <button><i class="fas fa-save"></i> Guardar</button>
      </form>
      <p><b>Utilizado:</b> ${fmt(m.tarjetas.ciudad.utilizado||0)} | <b>Disponible:</b> ${fmt((m.tarjetas.ciudad.limite||0)-(m.tarjetas.ciudad.utilizado||0))}</p>
    </div>
    <div class="card">
      <h2><i class="fas fa-credit-card"></i> Naranja X</h2>
      <form id="form-naranja">
        <label><i class="fas fa-chart-line"></i> Límite</label>
        <input type="number" id="lim-naranja" value="${m.tarjetas.naranja.limite||0}"/>
        <label><i class="fas fa-exchange-alt"></i> Operación</label>
        <select id="op-naranja">
          <option>Consumo</option>
          <option>Pago</option>
        </select>
        <label><i class="fas fa-dollar-sign"></i> Monto</label>
        <input type="number" id="monto-naranja"/>
        <button><i class="fas fa-save"></i> Guardar</button>
      </form>
      <p><b>Utilizado:</b> ${fmt(m.tarjetas.naranja.utilizado||0)} | <b>Disponible:</b> ${fmt((m.tarjetas.naranja.limite||0)-(m.tarjetas.naranja.utilizado||0))}</p>
    </div>
  </div>
  <div class="card">
    <h2><i class="fas fa-list"></i> Movimientos</h2>
    <div id="tabla-tarjetas"></div>
  </div>`;

  // handlers
  $('#form-ciudad').onsubmit=(e)=>{
    e.preventDefault();
    m.tarjetas.ciudad.limite = Number($('#lim-ciudad').value||0);
    const op=$('#op-ciudad').value; 
    const monto=Number($('#monto-ciudad').value||0);
    
    if(monto>0){ 
      if(op==='Consumo') {
        m.tarjetas.ciudad.utilizado += monto; 
      } else {
        m.tarjetas.ciudad.utilizado = Math.max(0, m.tarjetas.ciudad.utilizado - monto);
      }
      m.tarjetas.ciudad.movimientos.push({
        id:crypto.randomUUID(), 
        tarjeta:'Ciudad', 
        op, 
        monto, 
        fecha:new Date().toISOString().slice(0,10)
      });
    }
    save(); 
    render('tarjetas');
  };
  
  $('#form-naranja').onsubmit=(e)=>{
    e.preventDefault();
    m.tarjetas.naranja.limite = Number($('#lim-naranja').value||0);
    const op=$('#op-naranja').value; 
    const monto=Number($('#monto-naranja').value||0);
    
    if(monto>0){ 
      if(op==='Consumo') {
        m.tarjetas.naranja.utilizado += monto; 
      } else {
        m.tarjetas.naranja.utilizado = Math.max(0, m.tarjetas.naranja.utilizado - monto);
      }
      m.tarjetas.naranja.movimientos.push({
        id:crypto.randomUUID(), 
        tarjeta:'Naranja X', 
        op, 
        monto, 
        fecha:new Date().toISOString().slice(0,10)
      });
    }
    save(); 
    render('tarjetas');
  };
  
  drawMovs(m);
}

function drawMovs(m){
  const items=[...m.tarjetas.ciudad.movimientos, ...m.tarjetas.naranja.movimientos].sort((a,b)=>new Date(b.fecha) - new Date(a.fecha));
  const cont = $('#tabla-tarjetas');
  
  if(items.length===0){ 
    cont.innerHTML='<p style="color:var(--muted)"><i class="fas fa-inbox"></i> Sin movimientos.</p>'; 
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
          ${items.map(i=>`
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
function renderResumen(m){
  const byCat = [
    'servicios', 'mama', 'delivery', 'transporte', 
    'mascotas', 'salud', 'deportes', 'salidas', 'cochera', 'lucy', 'cristina'
  ].map(key=>[key, m[key].reduce((a,b)=>a+Number(b.monto),0)]);
  
  const gastos = byCat.reduce((a,[,v])=>a+v,0);
  const tarjetasUsado = (m.tarjetas.ciudad.utilizado||0) + (m.tarjetas.naranja.utilizado||0);
  
  $('#mainSection').innerHTML = `
    <div class="card">
      <h2><i class="fas fa-chart-bar"></i> Balance del mes</h2>
      <p><i class="fas fa-money-bill-wave"></i> Ingresos (sueldo): <b>${fmt(m.sueldo||0)}</b></p>
      <p><i class="fas fa-receipt"></i> Gastos: <b>${fmt(gastos)}</b></p>
      <p><i class="fas fa-credit-card"></i> Tarjetas (utilizado): <b>${fmt(tarjetasUsado)}</b></p>
      <p style="font-size:20px;margin-top:8px">
        <i class="fas fa-balance-scale"></i> Resultado: <b>${fmt((m.sueldo||0)-gastos-tarjetasUsado)}</b>
      </p>
    </div>
    <div class="card">
      <h2><i class="fas fa-chart-pie"></i> Gastos por categoría</h2>
      ${byCat.map(([k,v])=>`
        <div class="pill" style="margin:4px;display:inline-block">
          <i class="fas fa-folder"></i> ${k}: <b>${fmt(v)}</b>
        </div>
      `).join('') || '<p><i class="fas fa-inbox"></i> Sin gastos</p>'}
    </div>
    <div class="card">
      <h2><i class="fas fa-history"></i> Últimos Gastos</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th><i class="fas fa-tag"></i> Categoría</th>
              <th><i class="fas fa-align-left"></i> Descripción</th>
              <th><i class="fas fa-dollar-sign"></i> Monto</th>
              <th><i class="fas fa-calendar"></i> Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${[
              ...m.servicios.map(s=>({...s, categoria:'Servicios'})),
              ...m.mama.map(s=>({...s, categoria:'Mamá'})),
              ...m.delivery.map(s=>({...s, categoria:'Delivery'})),
              ...m.transporte.map(s=>({...s, categoria:'Transporte'})),
              ...m.mascotas.map(s=>({...s, categoria:'Mascotas'})),
              ...m.salud.map(s=>({...s, categoria:'Salud'})),
              ...m.deportes.map(s=>({...s, categoria:'Deportes'})),
              ...m.salidas.map(s=>({...s, categoria:'Salidas'})),
              ...m.cochera.map(s=>({...s, categoria:'Cochera'})),
              ...m.lucy.map(s=>({...s, categoria:'Lucy'})),
              ...m.cristina.map(s=>({...s, categoria:'Cristina'}))
            ]
            .sort((a,b)=>new Date(b.fecha) - new Date(a.fecha))
            .slice(0,10)
            .map(g=>`
              <tr>
                <td><span class="pill">${g.categoria}</span></td>
                <td>${g.desc}</td>
                <td>${fmt(g.monto)}</td>
                <td>${g.fecha}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ======= Export/Import (incluye recibos IDB) =======
async function exportAll(){
  const db = await idb();
  const tx = db.transaction('files','readonly');
  const req = tx.objectStore('files').getAll();
  
  req.onsuccess = ()=>{
    const dump = { state, files: req.result };
    const blob = new Blob([JSON.stringify(dump)],{type:'application/json'});
    const a = document.createElement('a'); 
    a.href=URL.createObjectURL(blob); 
    a.download=`finanzas_${new Date().toISOString().slice(0,10)}.json`; 
    a.click();
  };
}

async function importAll(e){
  const f=e.target.files?.[0]; 
  if(!f) return;
  
  const txt=await f.text(); 
  const dump=JSON.parse(txt);
  state = dump.state || {}; 
  save();
  
  const db=await idb();
  await new Promise((resolve)=>{
    const tx=db.transaction('files','readwrite'); 
    const store=tx.objectStore('files');
    (dump.files||[]).forEach(rec=>store.put(rec));
    tx.oncomplete=resolve;
  });
  
  alert('Importación completa'); 
  render('resumen');
}

// ======= PDF (multipágina, texto) =======
function escapePDF(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildReportLines() {
  const k = ensureMonth(),
    m = state[k];
  const lines = [];
  lines.push(`REPORTE MENSUAL — ${k}`);
  lines.push('');
  lines.push(`Sueldo: ${fmt(m.sueldo || 0)}`);
  const keys = ['servicios', 'mama', 'delivery', 'transporte', 'mascotas', 'salud', 'deportes', 'salidas', 'cochera', 'lucy', 'cristina'];
  let totalG = 0;
  keys.forEach(key => {
    const subtotal = m[key].reduce((a, b) => a + Number(b.monto), 0);
    totalG += subtotal;
    lines.push(`- ${key.toUpperCase()}: ${fmt(subtotal)}`);
  });
  const tUsado = (m.tarjetas.ciudad.utilizado || 0) + (m.tarjetas.naranja.utilizado || 0);
  lines.push(`Tarjetas (utilizado): ${fmt(tUsado)}`);
  lines.push(`Balance: ${fmt((m.sueldo || 0) - totalG - tUsado)}`);
  lines.push('');
  keys.forEach(key => {
    lines.push(`=== Detalle ${key} ===`);
    if (m[key].length === 0) lines.push('  (sin registros)');
    m[key].forEach(it => lines.push(`  ${it.fecha} | ${it.cat} | ${it.pago} | ${fmt(it.monto)} | ${it.desc}`));
    lines.push('');
  });
  lines.push('=== Tarjetas ===');
  ['ciudad', 'naranja'].forEach(t => {
    const card = m.tarjetas[t];
    lines.push(
      `  ${t === 'ciudad' ? 'Banco Ciudad' : 'Naranja X'} — Límite ${fmt(card.limite || 0)} — Utilizado ${fmt(card.utilizado || 0)} — Disponible ${fmt(
        (card.limite || 0) - (card.utilizado || 0),
      )}`,
    );
    if (card.movimientos.length === 0) lines.push('    (sin movimientos)');
    card.movimientos.forEach(mv => lines.push(`    ${mv.fecha} | ${mv.op} | ${fmt(mv.monto)}`));
  });
  return lines;
}

function downloadPDF() {
  const lines = buildReportLines();

  const pageWidth = 595,
    pageHeight = 842;
  const margin = 50,
    lineH = 14,
    startY = pageHeight - margin;
  const maxLines = Math.floor((pageHeight - 2 * margin) / lineH);
  const pages = [];
  for (let i = 0; i < lines.length; i += maxLines) pages.push(lines.slice(i, i + maxLines));

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  const addObj = s => {
    offsets.push(pdf.length);
    pdf += s;
  };

  // 3: Font
  addObj('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  const pageNums = [];
  const contentNums = [];
  let next = 4;

  for (const pageLines of pages) {
    const ops =
      'BT\n' + '/F1 12 Tf\n' + `${margin} ${startY} Td\n` + `${lineH} TL\n` + pageLines.map(l => `(${escapePDF(l)}) Tj T*`).join('\n') + '\nET';
    const content = `${next} 0 obj\n<< /Length ${ops.length} >>\nstream\n${ops}\nendstream\nendobj\n`;
    addObj(content);
    contentNums.push(next);
    next++;
    const pageObj = `${next} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${
      contentNums[contentNums.length - 1]
    } 0 R >>\nendobj\n`;
    addObj(pageObj);
    pageNums.push(next);
    next++;
  }

  // 2: Pages
  const kids = pageNums.map(n => `${n} 0 R`).join(' ');
  addObj(`2 0 obj\n<< /Type /Pages /Kids [ ${kids} ] /Count ${pageNums.length} >>\nendobj\n`);

  // 1: Catalog
  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // xref
  const xrefStart = pdf.length;
  const totalObjs = 1 + offsets.length; // include object 0
  let xref = `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  pdf += xref + trailer;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `reporte_${monthKey()}.pdf`;
  a.click();
}