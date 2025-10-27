// ======= Formularios y manejo de archivos =======
function initForms() {
  // Cargar formularios desde componentes
  loadFormComponents();
}

async function loadFormComponents() {
  const forms = [
    'sueldo', 'servicios', 'mama', 'tarjetas', 'delivery', 
    'transporte', 'mascotas', 'salud', 'deportes', 'salidas', 
    'cochera', 'lucy', 'cristina', 'resumen'
  ];
  
  for (const form of forms) {
    try {
      const response = await fetch(`components/forms/${form}.html`);
      if (response.ok) {
        // Guardar el HTML para usarlo cuando se necesite
        window[`${form}FormHTML`] = await response.text();
      }
    } catch (error) {
      console.error(`Error cargando formulario ${form}:`, error);
    }
  }
}

// ======= Manejo de archivos con cámara =======
async function handleFileInput(inputElement, callback) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile && window.showSaveFilePicker) {
    // En móvil, ofrecer opción de cámara o galería
    const options = {
      title: 'Seleccionar comprobante',
      options: [
        {
          description: 'Imágenes y PDF',
          accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf']
          }
        }
      ]
    };
    
    try {
      const handle = await window.showOpenFilePicker(options);
      const file = await handle[0].getFile();
      callback(file);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error seleccionando archivo:', error);
      }
    }
  } else {
    // En desktop o navegadores sin soporte, usar input normal
    inputElement.click();
  }
}

// ======= Render de secciones =======
function render(id) {
  const k = ensureMonth();
  const m = state[k];
  const el = $('#mainSection');
  el.innerHTML = '';

  switch(id) {
    case 'sueldo':
      renderSueldo(m);
      break;
    case 'tarjetas':
      renderTarjetas(m);
      break;
    case 'servicios':
      renderGeneric('🏠 Servicios Hogar', 'servicios', m, ['Luz', 'Gas', 'Agua', 'Internet/Flow', 'ARBA', 'APR']);
      break;
    case 'mama':
      renderGeneric('👩 Mamá', 'mama', m, ['Claro', 'Flow', 'Luz', 'Transferencia']);
      break;
    case 'delivery':
      renderGeneric('🍔 PedidosYa', 'delivery', m, ['PedidosYa']);
      break;
    case 'transporte':
      renderGeneric('🚗 Transporte', 'transporte', m, ['Uber', 'DiDi', 'SUBE']);
      break;
    case 'mascotas':
      renderGeneric('🐶 Mascotas', 'mascotas', m, ['Alimento perros', 'Vet', 'Accesorios']);
      break;
    case 'salud':
      renderGeneric('🧠 Salud Mental', 'salud', m, ['Psicóloga Lautaro', 'Psiquiatra Lautaro', 'Terapia de pareja']);
      break;
    case 'deportes':
      renderGeneric('🏋️ Deportes', 'deportes', m, ['Pádel', 'Gimnasio']);
      break;
    case 'salidas':
      renderGeneric('🎬 Salidas', 'salidas', m, ['Cine', 'Restaurante', 'Bar', 'Evento', 'Otros']);
      break;
    case 'cochera':
      renderGeneric('🅿️ Cochera', 'cochera', m, ['Alquiler']);
      break;
    case 'lucy':
      renderGeneric('👩 Lucy', 'lucy', m, ['Transferencia']);
      break;
    case 'cristina':
      renderGeneric('👩 Cristina', 'cristina', m, ['Transferencia']);
      break;
    case 'resumen':
      renderResumen(m);
      break;
  }
}

function renderSueldo(m) {
  const formHTML = sueldoFormHTML || `
    <div class="form-container">
      <h2><i class="fas fa-money-bill-wave"></i> Sueldo</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="sueldoFecha">Fecha:</label>
          <input type="date" id="sueldoFecha" class="date-input">
        </div>
        <div class="form-group">
          <label for="sueldoMonto">Monto:</label>
          <input type="number" id="sueldoMonto" placeholder="Ingrese monto">
        </div>
        <div class="form-group">
          <label for="sueldoComprobante">Comprobante:</label>
          <div class="file-input-container">
            <input type="file" id="sueldoComprobante" accept="image/*,.pdf" style="display:none">
            <button type="button" id="sueldoFileBtn" class="file-btn">
              <i class="fas fa-camera"></i> Subir comprobante
            </button>
            <span id="sueldoFileName">No seleccionado</span>
          </div>
        </div>
        <div class="form-group full-width">
          <label for="sueldoNotas">Notas:</label>
          <textarea id="sueldoNotas" placeholder="Notas adicionales"></textarea>
        </div>
        <div class="form-actions full-width">
          <button type="button" id="saveSueldo" class="btn-primary">
            <i class="fas fa-save"></i> Guardar Sueldo
          </button>
        </div>
      </div>
    </div>
  `;
  
  $('#mainSection').innerHTML = formHTML;
  
  // Inicializar calendario para fecha
  initFormCalendar('sueldoFecha');
  
  // Manejar archivo con cámara en móvil
  $('#sueldoFileBtn').addEventListener('click', () => {
    handleFileInput($('#sueldoComprobante'), (file) => {
      $('#sueldoFileName').textContent = file.name;
      // Aquí puedes procesar el archivo según sea necesario
    });
  });
  
  // También manejar cambio normal del input
  $('#sueldoComprobante').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      $('#sueldoFileName').textContent = e.target.files[0].name;
    }
  });
  
  // Guardar sueldo
  $('#saveSueldo').addEventListener('click', () => {
    const k = ensureMonth();
    const fecha = $('#sueldoFecha').value;
    const monto = parseFloat($('#sueldoMonto').value);
    
    if (!fecha || isNaN(monto)) {
      alert('Por favor complete fecha y monto');
      return;
    }
    
    if (!state[k].sueldo) state[k].sueldo = [];
    state[k].sueldo.push({
      fecha,
      monto,
      notas: $('#sueldoNotas').value,
      comprobante: $('#sueldoComprobante').files[0]?.name || ''
    });
    
    save();
    alert('Sueldo guardado correctamente');
    renderKPIs();
    clearForm('sueldo');
  });
}

function renderTarjetas(m) {
  const formHTML = tarjetasFormHTML || `
    <div class="form-container">
      <h2><i class="fas fa-credit-card"></i> Tarjetas</h2>
      <div class="form-tabs">
        <button class="tab-btn active" data-tab="naranja">Naranja</button>
        <button class="tab-btn" data-tab="visa">Visa</button>
        <button class="tab-btn" data-tab="master">Master</button>
      </div>
      
      <div id="naranjaTab" class="tab-content active">
        ${renderTarjetaForm('naranja', m)}
      </div>
      <div id="visaTab" class="tab-content">
        ${renderTarjetaForm('visa', m)}
      </div>
      <div id="masterTab" class="tab-content">
        ${renderTarjetaForm('master', m)}
      </div>
    </div>
  `;
  
  $('#mainSection').innerHTML = formHTML;
  
  // Manejar tabs
  $('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('.tab-btn').forEach(b => b.classList.remove('active'));
      $('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      $(`#${btn.dataset.tab}Tab`).classList.add('active');
    });
  });
}

function renderTarjetaForm(tarjeta, m) {
  return `
    <div class="form-grid">
      <div class="form-group">
        <label for="${tarjeta}Fecha">Fecha:</label>
        <input type="date" id="${tarjeta}Fecha" class="date-input">
      </div>
      <div class="form-group">
        <label for="${tarjeta}Monto">Monto:</label>
        <input type="number" id="${tarjeta}Monto" placeholder="Ingrese monto">
      </div>
      <div class="form-group">
        <label for="${tarjeta}Descripcion">Descripción:</label>
        <input type="text" id="${tarjeta}Descripcion" placeholder="Descripción del gasto">
      </div>
      <div class="form-group">
        <label for="${tarjeta}Comprobante">Comprobante:</label>
        <div class="file-input-container">
          <input type="file" id="${tarjeta}Comprobante" accept="image/*,.pdf" style="display:none">
          <button type="button" id="${tarjeta}FileBtn" class="file-btn">
            <i class="fas fa-camera"></i> Subir comprobante
          </button>
          <span id="${tarjeta}FileName">No seleccionado</span>
        </div>
      </div>
      <div class="form-group full-width">
        <label for="${tarjeta}Notas">Notas:</label>
        <textarea id="${tarjeta}Notas" placeholder="Notas adicionales"></textarea>
      </div>
      <div class="form-actions full-width">
        <button type="button" id="save${tarjeta.charAt(0).toUpperCase() + tarjeta.slice(1)}" class="btn-primary">
          <i class="fas fa-save"></i> Guardar ${tarjeta}
        </button>
      </div>
    </div>
    
    <div class="records-section">
      <h3>Registros de ${tarjeta}</h3>
      <div id="${tarjeta}Records" class="records-list">
        ${renderTarjetaRecords(tarjeta, m)}
      </div>
    </div>
  `;
}

function renderTarjetaRecords(tarjeta, m) {
  if (!m[tarjeta] || m[tarjeta].length === 0) {
    return '<p class="no-records">No hay registros para esta tarjeta</p>';
  }
  
  return m[tarjeta].map((item, index) => `
    <div class="record-item">
      <div class="record-info">
        <span class="record-date">${item.fecha}</span>
        <span class="record-desc">${item.descripcion || 'Sin descripción'}</span>
        <span class="record-amount">$${item.monto}</span>
      </div>
      <div class="record-actions">
        <button class="btn-icon danger" onclick="deleteTarjetaRecord('${tarjeta}', ${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function deleteTarjetaRecord(tarjeta, index) {
  if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
    const k = ensureMonth();
    state[k][tarjeta].splice(index, 1);
    save();
    render('tarjetas');
    renderKPIs();
  }
}

function renderGeneric(title, key, m, categories) {
  const formHTML = window[`${key}FormHTML`] || `
    <div class="form-container">
      <h2><i class="fas fa-${getIcon(key)}"></i> ${title}</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="${key}Fecha">Fecha:</label>
          <input type="date" id="${key}Fecha" class="date-input">
        </div>
        <div class="form-group">
          <label for="${key}Monto">Monto:</label>
          <input type="number" id="${key}Monto" placeholder="Ingrese monto">
        </div>
        <div class="form-group">
          <label for="${key}Categoria">Categoría:</label>
          <select id="${key}Categoria">
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="${key}Comprobante">Comprobante:</label>
          <div class="file-input-container">
            <input type="file" id="${key}Comprobante" accept="image/*,.pdf" style="display:none">
            <button type="button" id="${key}FileBtn" class="file-btn">
              <i class="fas fa-camera"></i> Subir comprobante
            </button>
            <span id="${key}FileName">No seleccionado</span>
          </div>
        </div>
        <div class="form-group full-width">
          <label for="${key}Notas">Notas:</label>
          <textarea id="${key}Notas" placeholder="Notas adicionales"></textarea>
        </div>
        <div class="form-actions full-width">
          <button type="button" id="save${key.charAt(0).toUpperCase() + key.slice(1)}" class="btn-primary">
            <i class="fas fa-save"></i> Guardar
          </button>
        </div>
      </div>
      
      <div class="records-section">
        <h3>Registros</h3>
        <div id="${key}Records" class="records-list">
          ${renderGenericRecords(key, m)}
        </div>
      </div>
    </div>
  `;
  
  $('#mainSection').innerHTML = formHTML;
  
  // Inicializar funcionalidad
  initFormCalendar(`${key}Fecha`);
  
  $(`#${key}FileBtn`).addEventListener('click', () => {
    handleFileInput($(`#${key}Comprobante`), (file) => {
      $(`#${key}FileName`).textContent = file.name;
    });
  });
  
  $(`#${key}Comprobante`).addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      $(`#${key}FileName`).textContent = e.target.files[0].name;
    }
  });
  
  $(`#save${key.charAt(0).toUpperCase() + key.slice(1)}`).addEventListener('click', () => {
    saveGenericRecord(key, categories);
  });
}

function saveGenericRecord(key, categories) {
  const k = ensureMonth();
  const fecha = $(`#${key}Fecha`).value;
  const monto = parseFloat($(`#${key}Monto`).value);
  const categoria = $(`#${key}Categoria`).value;
  
  if (!fecha || isNaN(monto)) {
    alert('Por favor complete fecha y monto');
    return;
  }
  
  if (!state[k][key]) state[k][key] = [];
  state[k][key].push({
    fecha,
    monto,
    categoria,
    notas: $(`#${key}Notas`).value,
    comprobante: $(`#${key}Comprobante`).files[0]?.name || ''
  });
  
  save();
  alert('Registro guardado correctamente');
  renderKPIs();
  render(key);
}

function renderGenericRecords(key, m) {
  if (!m[key] || m[key].length === 0) {
    return '<p class="no-records">No hay registros</p>';
  }
  
  return m[key].map((item, index) => `
    <div class="record-item">
      <div class="record-info">
        <span class="record-date">${item.fecha}</span>
        <span class="record-category">${item.categoria}</span>
        <span class="record-desc">${item.notas || ''}</span>
        <span class="record-amount">$${item.monto}</span>
      </div>
      <div class="record-actions">
        <button class="btn-icon danger" onclick="deleteGenericRecord('${key}', ${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function deleteGenericRecord(key, index) {
  if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
    const k = ensureMonth();
    state[k][key].splice(index, 1);
    save();
    render(key);
    renderKPIs();
  }
}

function renderResumen(m) {
  const formHTML = resumenFormHTML || `
    <div class="form-container">
      <h2><i class="fas fa-chart-bar"></i> Resumen Mensual</h2>
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Ingresos</h3>
          <div class="summary-amount" id="summaryIngresos">$0</div>
        </div>
        <div class="summary-card">
          <h3>Gastos</h3>
          <div class="summary-amount" id="summaryGastos">$0</div>
        </div>
        <div class="summary-card">
          <h3>Balance</h3>
          <div class="summary-amount" id="summaryBalance">$0</div>
        </div>
      </div>
      
      <div class="charts-section">
        <h3>Distribución de Gastos</h3>
        <canvas id="expensesChart" width="400" height="200"></canvas>
      </div>
      
      <div class="export-section">
        <h3>Exportar Datos</h3>
        <div class="export-actions">
          <button id="exportJSON" class="btn-secondary">
            <i class="fas fa-file-export"></i> Exportar JSON
          </button>
          <button id="exportPDF" class="btn-primary">
            <i class="fas fa-file-pdf"></i> Generar PDF
          </button>
        </div>
      </div>
    </div>
  `;
  
  $('#mainSection').innerHTML = formHTML;
  
  // Calcular y mostrar resumen
  updateResumen(m);
  
  // Configurar exportación
  $('#exportJSON').addEventListener('click', exportJSON);
  $('#exportPDF').addEventListener('click', generatePDF);
}

function updateResumen(m) {
  // Calcular ingresos (sueldo)
  const ingresos = (m.sueldo || []).reduce((sum, item) => sum + item.monto, 0);
  
  // Calcular gastos por categoría
  const gastoCategorias = {
    servicios: (m.servicios || []).reduce((sum, item) => sum + item.monto, 0),
    mama: (m.mama || []).reduce((sum, item) => sum + item.monto, 0),
    tarjetas: (m.tarjetas || []).reduce((sum, item) => sum + item.monto, 0),
    delivery: (m.delivery || []).reduce((sum, item) => sum + item.monto, 0),
    transporte: (m.transporte || []).reduce((sum, item) => sum + item.monto, 0),
    mascotas: (m.mascotas || []).reduce((sum, item) => sum + item.monto, 0),
    salud: (m.salud || []).reduce((sum, item) => sum + item.monto, 0),
    deportes: (m.deportes || []).reduce((sum, item) => sum + item.monto, 0),
    salidas: (m.salidas || []).reduce((sum, item) => sum + item.monto, 0),
    cochera: (m.cochera || []).reduce((sum, item) => sum + item.monto, 0),
    lucy: (m.lucy || []).reduce((sum, item) => sum + item.monto, 0),
    cristina: (m.cristina || []).reduce((sum, item) => sum + item.monto, 0)
  };
  
  const gastosTotal = Object.values(gastoCategorias).reduce((sum, gasto) => sum + gasto, 0);
  const balance = ingresos - gastosTotal;
  
  // Actualizar displays
  $('#summaryIngresos').textContent = `$${ingresos.toLocaleString()}`;
  $('#summaryGastos').textContent = `$${gastosTotal.toLocaleString()}`;
  $('#summaryBalance').textContent = `$${balance.toLocaleString()}`;
  $('#summaryBalance').className = `summary-amount ${balance >= 0 ? 'positive' : 'negative'}`;
  
  // Renderizar gráfico si existe
  renderExpensesChart(gastoCategorias);
}

function renderExpensesChart(gastoCategorias) {
  const canvas = $('#expensesChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const categorias = Object.keys(gastoCategorias).filter(cat => gastoCategorias[cat] > 0);
  const montos = categorias.map(cat => gastoCategorias[cat]);
  
  // Colores para el gráfico
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'];
  
  // Dibujar gráfico simple
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (categorias.length === 0) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('No hay datos para mostrar', canvas.width / 2, canvas.height / 2);
    return;
  }
  
  const total = montos.reduce((sum, monto) => sum + monto, 0);
  let startAngle = 0;
  
  for (let i = 0; i < categorias.length; i++) {
    const sliceAngle = (montos[i] / total) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 3, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    
    startAngle += sliceAngle;
  }
}

function getIcon(key) {
  const icons = {
    sueldo: 'money-bill-wave',
    servicios: 'home',
    mama: 'female',
    tarjetas: 'credit-card',
    delivery: 'hamburger',
    transporte: 'car',
    mascotas: 'paw',
    salud: 'brain',
    deportes: 'dumbbell',
    salidas: 'film',
    cochera: 'parking',
    lucy: 'user',
    cristina: 'user',
    resumen: 'chart-bar'
  };
  return icons[key] || 'file-invoice-dollar';
}

function clearForm(key) {
  $(`#${key}Fecha`).value = '';
  $(`#${key}Monto`).value = '';
  $(`#${key}Notas`).value = '';
  $(`#${key}FileName`).textContent = 'No seleccionado';
  if ($(`#${key}Comprobante`)) $(`#${key}Comprobante`).value = '';
}