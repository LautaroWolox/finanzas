// ======= Aplicación Principal =======
let state = {};
let currentSelectedYear = new Date().getFullYear();
let currentSelectedMonth = new Date().getMonth();

// Función helper para seleccionar elementos
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// ======= Inicialización =======
function init() {
  // Verificar autenticación
  if (localStorage.getItem('finanzas_authenticated') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  // Cargar estado
  load();

  // Cargar componentes del menú
  loadMenu();

  // Inicializar funcionalidades
  initEventListeners();

  // Renderizar KPIs y sección inicial
  renderKPIs();
  render('sueldo');
}

function loadMenu() {
  const menuHTML = `
    <aside class="sidebar" id="sidebar">
      <h2><i class="fas fa-chart-pie"></i> Finanzas</h2>
      
      <!-- Selector de mes y año -->
      <div class="month-selector">
        <div class="selector-group">
          <label for="monthSelect">Mes:</label>
          <select id="monthSelect">
            <option value="0">Enero</option>
            <option value="1">Febrero</option>
            <option value="2">Marzo</option>
            <option value="3">Abril</option>
            <option value="4">Mayo</option>
            <option value="5">Junio</option>
            <option value="6">Julio</option>
            <option value="7">Agosto</option>
            <option value="8">Septiembre</option>
            <option value="9">Octubre</option>
            <option value="10">Noviembre</option>
            <option value="11">Diciembre</option>
          </select>
        </div>
        <div class="selector-group">
          <label for="yearSelect">Año:</label>
          <select id="yearSelect">
            <!-- Los años se cargarán dinámicamente -->
          </select>
        </div>
        <div class="current-month-display">
          <span id="mesActualDisplay">Mes actual</span>
        </div>
      </div>
      
      <nav>
        <ul id="menu">
          <li data-section="sueldo" class="active"><i class="fas fa-money-bill-wave"></i> <span>Sueldo</span></li>
          <li data-section="servicios"><i class="fas fa-home"></i> <span>Servicios Hogar</span></li>
          <li data-section="mama"><i class="fas fa-female"></i> <span>Mamá</span></li>
          <li data-section="tarjetas"><i class="fas fa-credit-card"></i> <span>Tarjetas</span></li>
          <li data-section="delivery"><i class="fas fa-hamburger"></i> <span>PedidosYa</span></li>
          <li data-section="transporte"><i class="fas fa-car"></i> <span>Transporte</span></li>
          <li data-section="mascotas"><i class="fas fa-paw"></i> <span>Mascotas</span></li>
          <li data-section="salud"><i class="fas fa-brain"></i> <span>Salud Mental</span></li>
          <li data-section="deportes"><i class="fas fa-dumbbell"></i> <span>Deportes</span></li>
          <li data-section="salidas"><i class="fas fa-film"></i> <span>Salidas</span></li>
          <li data-section="cochera"><i class="fas fa-parking"></i> <span>Cochera</span></li>
          <li data-section="lucy"><i class="fas fa-user"></i> <span>Lucy</span></li>
          <li data-section="cristina"><i class="fas fa-user"></i> <span>Cristina</span></li>
          <li data-section="resumen"><i class="fas fa-chart-bar"></i> <span>Resumen</span></li>
        </ul>
      </nav>
      <div class="sidebar-actions">
        <button id="btnExport"><i class="fas fa-file-export"></i> Exportar JSON</button>
        <button id="btnPDF"><i class="fas fa-file-pdf"></i> Descargar PDF</button>
        <label class="filebtn"><i class="fas fa-file-import"></i> Importar <input id="fileImport" type="file" accept="application/json" /></label>
      </div>
    </aside>
  `;
  
  $('#menu-container').innerHTML = menuHTML;
  initMenu();
}

function initMenu() {
  // Inicializar selector de mes y año
  initializeMonthSelector();
  
  // Navegación del menú
  $$('#menu li').forEach(item => {
    item.addEventListener('click', function() {
      $$('#menu li').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      render(this.dataset.section);
    });
  });

  // Botones de exportación
  $('#btnExport').addEventListener('click', exportJSON);
  $('#btnPDF').addEventListener('click', generatePDF);
  $('#fileImport').addEventListener('change', importJSON);

  // Menú móvil
  $('#mobileMenuBtn').addEventListener('click', function() {
    $('#sidebar').classList.toggle('show');
    $('#mobileOverlay').classList.toggle('show');
  });

  $('#mobileOverlay').addEventListener('click', function() {
    $('#sidebar').classList.remove('show');
    this.classList.remove('show');
  });
}

function initializeMonthSelector() {
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  
  // Establecer mes actual
  monthSelect.value = currentSelectedMonth;
  
  // Llenar años (desde 2020 hasta 2030)
  for (let year = 2020; year <= 2030; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  
  // Establecer año actual
  yearSelect.value = currentSelectedYear;
  
  // Actualizar display del mes actual
  updateMonthDisplay();
  
  // Manejar cambios
  monthSelect.addEventListener('change', function() {
    currentSelectedMonth = parseInt(this.value);
    updateMonthDisplay();
    renderKPIs();
    const activeSection = document.querySelector('#menu li.active');
    if (activeSection) {
      render(activeSection.dataset.section);
    }
  });
  
  yearSelect.addEventListener('change', function() {
    currentSelectedYear = parseInt(this.value);
    updateMonthDisplay();
    renderKPIs();
    const activeSection = document.querySelector('#menu li.active');
    if (activeSection) {
      render(activeSection.dataset.section);
    }
  });
}

function updateMonthDisplay() {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const display = document.getElementById('mesActualDisplay');
  if (display) {
    display.textContent = `${months[currentSelectedMonth]} ${currentSelectedYear}`;
  }
}

function initEventListeners() {
  // Logout
  $('#logoutBtn').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que quieres salir?')) {
      localStorage.removeItem('finanzas_authenticated');
      window.location.href = 'login.html';
    }
  });

  // Cerrar menú al hacer clic en un enlace (móvil)
  $$('#menu li').forEach(item => {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        $('#sidebar').classList.remove('show');
        $('#mobileOverlay').classList.remove('show');
      }
    });
  });
}

// ======= Gestión del estado =======
function load() {
  const saved = localStorage.getItem('finanzas_state');
  state = saved ? JSON.parse(saved) : {};
}

function save() {
  localStorage.setItem('finanzas_state', JSON.stringify(state));
}

function monthKey() {
  return `${currentSelectedYear}-${(currentSelectedMonth + 1).toString().padStart(2, '0')}`;
}

function ensureMonth() {
  const k = monthKey();
  if (!state[k]) {
    state[k] = {};
  }
  return k;
}

// ======= KPIs =======
function renderKPIs() {
  const k = ensureMonth();
  const m = state[k] || {};

  // Sueldo
  const sueldo = (m.sueldo || []).reduce((sum, item) => sum + item.monto, 0);
  $('#kpiSueldo').textContent = fmt(sueldo);

  // Gastos totales
  const gastos = calcularGastosTotales(m);
  $('#kpiGastos').textContent = fmt(gastos);

  // Tarjetas
  const naranja = (m.naranja || []).reduce((sum, item) => sum + item.monto, 0);
  const visa = (m.visa || []).reduce((sum, item) => sum + item.monto, 0);
  const master = (m.master || []).reduce((sum, item) => sum + item.monto, 0);
  const tarjetas = naranja + visa + master;
  $('#kpiTarjetas').textContent = fmt(tarjetas);

  // Balance
  const balance = sueldo - gastos;
  $('#kpiBalance').textContent = fmt(balance);
  $('#kpiBalance').className = `value ${balance >= 0 ? 'positive' : 'negative'}`;
}

function calcularGastosTotales(m) {
  const categorias = [
    'servicios', 'mama', 'naranja', 'visa', 'master', 'delivery', 'transporte',
    'mascotas', 'salud', 'deportes', 'salidas', 'cochera',
    'lucy', 'cristina'
  ];

  return categorias.reduce((total, cat) => {
    return total + (m[cat] || []).reduce((sum, item) => sum + item.monto, 0);
  }, 0);
}

// ======= Funciones de utilidad =======
function fmt(n) {
  const numero = typeof n === 'string' ? parseFloat(n.replace(',', '.')) : Number(n || 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(numero);
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ======= Exportación/Importación =======
function exportJSON() {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `finanzas_${monthKey()}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const importedState = JSON.parse(e.target.result);
      state = importedState;
      save();
      alert('Datos importados correctamente');
      renderKPIs();
      const activeSection = document.querySelector('#menu li.active');
      if (activeSection) {
        render(activeSection.dataset.section);
      }
    } catch (error) {
      alert('Error al importar el archivo: ' + error.message);
    }
  };
  
  reader.readAsText(file);
  event.target.value = '';
}

function generatePDF() {
  alert('Funcionalidad de PDF en desarrollo');
}

// Inicializar aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);