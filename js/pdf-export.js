// ======= Exportación a PDF =======
function generatePDF() {
  const k = ensureMonth();
  const m = state[k];
  
  // Crear documento PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Resumen Financiero Mensual', 20, 30);
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Mes: ${$('#mesActualDisplay').textContent}`, 20, 45);
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, 20, 55);
  
  let yPosition = 80;
  
  // Ingresos
  doc.setFontSize(16);
  doc.text('INGRESOS', 20, yPosition);
  yPosition += 10;
  
  const ingresos = (m.sueldo || []).reduce((sum, item) => sum + item.monto, 0);
  doc.setFontSize(12);
  doc.text(`Sueldo: $${ingresos.toLocaleString()}`, 30, yPosition);
  yPosition += 20;
  
  // Gastos
  doc.setFontSize(16);
  doc.text('GASTOS', 20, yPosition);
  yPosition += 10;
  
  const categorias = [
    { key: 'servicios', name: 'Servicios Hogar' },
    { key: 'mama', name: 'Mamá' },
    { key: 'tarjetas', name: 'Tarjetas' },
    { key: 'delivery', name: 'PedidosYa' },
    { key: 'transporte', name: 'Transporte' },
    { key: 'mascotas', name: 'Mascotas' },
    { key: 'salud', name: 'Salud Mental' },
    { key: 'deportes', name: 'Deportes' },
    { key: 'salidas', name: 'Salidas' },
    { key: 'cochera', name: 'Cochera' },
    { key: 'lucy', name: 'Lucy' },
    { key: 'cristina', name: 'Cristina' }
  ];
  
  let totalGastos = 0;
  
  categorias.forEach(cat => {
    const gasto = (m[cat.key] || []).reduce((sum, item) => sum + item.monto, 0);
    totalGastos += gasto;
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(10);
    doc.text(`${cat.name}: $${gasto.toLocaleString()}`, 30, yPosition);
    yPosition += 8;
  });
  
  yPosition += 10;
  
  // Totales
  doc.setFontSize(16);
  doc.text('TOTALES', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.text(`Total Ingresos: $${ingresos.toLocaleString()}`, 30, yPosition);
  yPosition += 8;
  doc.text(`Total Gastos: $${totalGastos.toLocaleString()}`, 30, yPosition);
  yPosition += 8;
  
  const balance = ingresos - totalGastos;
  doc.text(`Balance: $${balance.toLocaleString()}`, 30, yPosition);
  yPosition += 8;
  doc.text(`Estado: ${balance >= 0 ? 'POSITIVO' : 'NEGATIVO'}`, 30, yPosition);
  
  // Guardar PDF
  doc.save(`finanzas_${k}.pdf`);
}

function exportJSON() {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `finanzas_backup_${new Date().toISOString().split('T')[0]}.json`;
  
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
      Object.assign(state, importedState);
      save();
      alert('Datos importados correctamente');
      renderKPIs();
      const activeSection = document.querySelector('.sidebar li.active');
      if (activeSection) {
        render(activeSection.dataset.section);
      }
    } catch (error) {
      alert('Error importando datos: ' + error.message);
    }
  };
  reader.readAsText(file);
}