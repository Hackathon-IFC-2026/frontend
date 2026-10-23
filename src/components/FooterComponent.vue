<script setup>
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-top">
        <div class="logo">
          <span class="material-symbols-outlined logo-icon">circle</span>
          <span class="logo-text">Hackathon</span>
        </div>

        <nav class="nav-links">
          <a href="#home" class="nav-item">Home</a>
          <a href="#produtos" class="nav-item">Produtos</a>
          <a href="#sobre" class="nav-item">Sobre</a>
          <a href="#contato" class="nav-item">Contato</a>
        </nav>
      </div>

      <hr class="divider" />

      <div class="footer-bottom">
        <p class="copyright">©2026 Todos os direitos reservados</p>

        <div class="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.footer {
  width: 100%;
  background-color: #1A3721;
  color: #F6E8D0;
  font-family: 'Poppins', sans-serif;
  padding: 32px 32px 24px;
  box-sizing: border-box;
  margin-top: auto;
}

.footer-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: #F6E8D0;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #F6E8D0;
  letter-spacing: -0.3px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.nav-item {
  color: #F6E8D0;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.nav-item:hover {
  opacity: 0.8;
}

.divider {
  border: none;
  border-top: 1px solid #4E7855;
  margin: 20px 0;
  width: 100%;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.copyright {
  font-size: 0.875rem;
  font-weight: 400;
  color: #F6E8D0;
  margin: 0;
}

.social-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #F6E8D0;
  color: #1A3721;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
  flex-shrink: 0;
}

.social-btn:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* Responsividade */
@media (max-width: 768px) {
  .footer {
    padding: 24px 20px;
  }

  .footer-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .nav-links {
    width: 100%;
    gap: 18px;
  }

  .footer-bottom {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>

