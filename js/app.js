// ======= Aplicación Principal =======
let state = {};

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

  // Cargar componentes
  loadMenu();
  loadCalendar();

  // Inicializar funcionalidades
  initCalendar();
  initForms();
  initEventListeners();

  // Renderizar KPIs y sección inicial
  renderKPIs();
  render('sueldo');
}

function loadMenu() {
  fetch('components/menu.html')
    .then(response => response.text())
    .then(html => {
      $('#menu-container').innerHTML = html;
      initMenu();
    })
    .catch(error => {
      console.error('Error cargando menú:', error);
      // Fallback si no puede cargar el componente
      $('#menu-container').innerHTML = `
        <aside class="sidebar" id="sidebar">
          <h2><i class="fas fa-chart-pie"></i> Finanzas</h2>
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
      initMenu();
    });
}

function loadCalendar() {
  fetch('components/calendar.html')
    .then(response => response.text())
    .then(html => {
      $('#calendar-container').innerHTML = html;
    })
    .catch(error => {
      console.error('Error cargando calendario:', error);
    });
}

function initMenu() {
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
  const m = state[k];

  // Sueldo
  const sueldo = (m.sueldo || []).reduce((sum, item) => sum + item.monto, 0);
  $('#kpiSueldo').textContent = `$${sueldo.toLocaleString()}`;

  // Gastos totales
  const gastos = calcularGastosTotales(m);
  $('#kpiGastos').textContent = `$${gastos.toLocaleString()}`;

  // Tarjetas
  const tarjetas = (m.tarjetas || []).reduce((sum, item) => sum + item.monto, 0);
  $('#kpiTarjetas').textContent = `$${tarjetas.toLocaleString()}`;

  // Balance
  const balance = sueldo - gastos;
  $('#kpiBalance').textContent = `$${balance.toLocaleString()}`;
  $('#kpiBalance').className = `value ${balance >= 0 ? 'positive' : 'negative'}`;
}

function calcularGastosTotales(m) {
  const categorias = [
    'servicios', 'mama', 'tarjetas', 'delivery', 'transporte',
    'mascotas', 'salud', 'deportes', 'salidas', 'cochera',
    'lucy', 'cristina'
  ];

  return categorias.reduce((total, cat) => {
    return total + (m[cat] || []).reduce((sum, item) => sum + item.monto, 0);
  }, 0);
}

// Inicializar aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);