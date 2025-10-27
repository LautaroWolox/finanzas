// Sistema de autenticación
const AUTH_USER = 'luffy';
const AUTH_PASS = '0602';

function initLogin() {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  // Verificar si ya está autenticado
  if (localStorage.getItem('finanzas_authenticated') === 'true') {
    window.location.href = 'index.html';
    return;
  }
  
  // Detectar dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // En móvil, usar autenticación biométrica si está disponible
    document.querySelector('.login-info').style.display = 'block';
    usernameInput.style.display = 'none';
    passwordInput.style.display = 'none';
    
    // Intentar autenticación biométrica
    attemptBiometricAuth();
  } else {
    // En desktop, mostrar campos de usuario/contraseña
    document.querySelector('.login-info').style.display = 'none';
    usernameInput.style.display = 'block';
    passwordInput.style.display = 'block';
  }
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (isMobile) {
      // En móvil, reintentar autenticación biométrica
      attemptBiometricAuth();
    } else {
      // En desktop, verificar credenciales
      const username = usernameInput.value;
      const password = passwordInput.value;
      
      if (username === AUTH_USER && password === AUTH_PASS) {
        localStorage.setItem('finanzas_authenticated', 'true');
        window.location.href = 'index.html';
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    }
  });
}

function attemptBiometricAuth() {
  // Verificar si el navegador soporta WebAuthn (huella digital, reconocimiento facial)
  if (window.PublicKeyCredential) {
    // Aquí iría la implementación de WebAuthn para autenticación biométrica
    // Por simplicidad, en esta demo usamos un método alternativo
    setTimeout(() => {
      if (confirm('¿Deseas acceder usando tu método de autenticación del dispositivo?')) {
        localStorage.setItem('finanzas_authenticated', 'true');
        window.location.href = 'index.html';
      }
    }, 500);
  } else {
    // Fallback para dispositivos sin soporte biométrico
    if (confirm('Para acceder en este dispositivo, confirma tu identidad:')) {
      localStorage.setItem('finanzas_authenticated', 'true');
      window.location.href = 'index.html';
    }
  }
}

// Inicializar login cuando se carga la página
document.addEventListener('DOMContentLoaded', initLogin);