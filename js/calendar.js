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