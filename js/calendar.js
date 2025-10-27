// ======= Sistema de Calendario =======
let currentDecade = Math.floor(new Date().getFullYear() / 10) * 10;
let calendarSelectedYear = new Date().getFullYear();
let calendarSelectedMonth = new Date().getMonth();

function initCalendar() {
  // El calendario se inicializa cuando se hace clic en el botón
  const dateContainer = document.querySelector('.date-container');
  if (dateContainer) {
    dateContainer.style.cursor = 'pointer';
    dateContainer.addEventListener('click', openCalendarModal);
  }
}

function openCalendarModal() {
  const modal = document.getElementById('calendarModal');
  if (!modal) return;
  
  modal.style.display = 'block';
  showYearView();
}

function closeCalendarModal() {
  const modal = document.getElementById('calendarModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function showYearView() {
  document.getElementById('yearView').style.display = 'block';
  document.getElementById('monthView').style.display = 'none';
  document.getElementById('dayView').style.display = 'none';
  
  renderYearView();
  
  // Configurar navegación de década
  document.getElementById('prevDecade').onclick = () => {
    currentDecade -= 10;
    renderYearView();
  };
  
  document.getElementById('nextDecade').onclick = () => {
    currentDecade += 10;
    renderYearView();
  };
}

function renderYearView() {
  const yearRange = document.getElementById('yearRange');
  const yearGrid = document.getElementById('yearGrid');
  
  yearRange.textContent = `${currentDecade}-${currentDecade + 9}`;
  
  let html = '';
  for (let i = 0; i < 10; i++) {
    const year = currentDecade + i;
    const isCurrentYear = year === new Date().getFullYear();
    html += `<div class="year-item ${isCurrentYear ? 'current' : ''}" onclick="selectYear(${year})">${year}</div>`;
  }
  
  yearGrid.innerHTML = html;
}

function selectYear(year) {
  calendarSelectedYear = year;
  showMonthView();
}

function showMonthView() {
  document.getElementById('yearView').style.display = 'none';
  document.getElementById('monthView').style.display = 'block';
  document.getElementById('dayView').style.display = 'none';
  
  renderMonthView();
  
  // Configurar navegación de año
  document.getElementById('prevYear').onclick = () => {
    calendarSelectedYear--;
    renderMonthView();
  };
  
  document.getElementById('nextYear').onclick = () => {
    calendarSelectedYear++;
    renderMonthView();
  };
}

function renderMonthView() {
  const currentYear = document.getElementById('currentYear');
  const monthGrid = document.getElementById('monthGrid');
  
  currentYear.textContent = calendarSelectedYear;
  
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const currentMonth = new Date().getMonth();
  const currentYearNow = new Date().getFullYear();
  
  let html = '';
  months.forEach((month, index) => {
    const isCurrent = index === currentMonth && calendarSelectedYear === currentYearNow;
    html += `<div class="month-item ${isCurrent ? 'current' : ''}" onclick="selectMonth(${index})">${month}</div>`;
  });
  
  monthGrid.innerHTML = html;
}

function selectMonth(month) {
  calendarSelectedMonth = month;
  showDayView();
}

function showDayView() {
  document.getElementById('yearView').style.display = 'none';
  document.getElementById('monthView').style.display = 'none';
  document.getElementById('dayView').style.display = 'block';
  
  renderDayView();
  
  // Configurar navegación de mes
  document.getElementById('prevMonth').onclick = () => {
    calendarSelectedMonth--;
    if (calendarSelectedMonth < 0) {
      calendarSelectedMonth = 11;
      calendarSelectedYear--;
    }
    renderDayView();
  };
  
  document.getElementById('nextMonth').onclick = () => {
    calendarSelectedMonth++;
    if (calendarSelectedMonth > 11) {
      calendarSelectedMonth = 0;
      calendarSelectedYear++;
    }
    renderDayView();
  };
  
  // Configurar botón de borrar mes
  document.getElementById('clearMonth').onclick = clearCurrentMonth;
}

function renderDayView() {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const currentMonthYear = document.getElementById('currentMonthYear');
  currentMonthYear.textContent = `${months[calendarSelectedMonth]} ${calendarSelectedYear}`;
  
  const dayGrid = document.getElementById('dayGrid');
  
  // Calcular días del mes
  const firstDay = new Date(calendarSelectedYear, calendarSelectedMonth, 1);
  const lastDay = new Date(calendarSelectedYear, calendarSelectedMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  let html = '<div class="day-header">Dom</div><div class="day-header">Lun</div><div class="day-header">Mar</div><div class="day-header">Mié</div><div class="day-header">Jue</div><div class="day-header">Vie</div><div class="day-header">Sáb</div>';
  
  // Agregar días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div class="day-item empty"></div>';
  }
  
  // Agregar días del mes
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today.getDate() && 
                    calendarSelectedMonth === today.getMonth() && 
                    calendarSelectedYear === today.getFullYear();
    
    html += `<div class="day-item ${isToday ? 'current' : ''}" onclick="selectDay(${day})">${day}</div>`;
  }
  
  dayGrid.innerHTML = html;
}

function selectDay(day) {
  // Actualizar el mes y año seleccionado en la aplicación
  currentSelectedYear = calendarSelectedYear;
  currentSelectedMonth = calendarSelectedMonth;
  
  // Actualizar los selectores
  document.getElementById('monthSelect').value = currentSelectedMonth;
  document.getElementById('yearSelect').value = currentSelectedYear;
  
  // Actualizar display
  updateMonthDisplay();
  
  // Actualizar KPIs y sección actual
  renderKPIs();
  const activeSection = document.querySelector('#menu li.active');
  if (activeSection) {
    render(activeSection.dataset.section);
  }
  
  // Cerrar modal
  closeCalendarModal();
}

function clearCurrentMonth() {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthName = months[calendarSelectedMonth];
  
  if (confirm(`¿Estás seguro de que quieres borrar todos los datos de ${monthName} ${calendarSelectedYear}?`)) {
    const k = `${calendarSelectedYear}-${(calendarSelectedMonth + 1).toString().padStart(2, '0')}`;
    
    if (state[k]) {
      delete state[k];
      save();
      alert('Datos del mes borrados correctamente');
      
      // Si es el mes actual, actualizar vista
      if (calendarSelectedYear === currentSelectedYear && calendarSelectedMonth === currentSelectedMonth) {
        renderKPIs();
        const activeSection = document.querySelector('#menu li.active');
        if (activeSection) {
          render(activeSection.dataset.section);
        }
      }
    } else {
      alert('No hay datos para este mes');
    }
    
    closeCalendarModal();
  }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
  const modal = document.getElementById('calendarModal');
  if (event.target === modal) {
    closeCalendarModal();
  }
}

// Inicializar calendario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco para asegurarse de que todo esté cargado
  setTimeout(initCalendar, 100);
});