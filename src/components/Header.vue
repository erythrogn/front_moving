<script setup>
function avisoSeries() {
  alert('O banco de dados de séries será integrado em breve!');
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-conteudo">
      <div class="logo">Filmando</div>
      <nav class="nav-links" aria-label="Principal">
        <a href="Movie.vue" class="active" aria-current="page">Filmes</a>
    <a href="Actor.vue">Atores</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: var(--azul);
  box-shadow: 0 2px 12px rgba(4, 41, 106, 0.35);
}

.navbar-conteudo {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100% - 32px, 880px);
  height: 60px;
  margin: 0 auto;
}

.logo {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.nav-links {
  display: flex;
  gap: 4px;
  height: 100%;
}

.nav-links a {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 14px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: color var(--transicao), border-color var(--transicao);
}

.nav-links a:hover {
  color: #fff;
}

.nav-links a.active {
  color: #fff;
  font-weight: 600;
  border-bottom-color: var(--estrela);
}

.nav-links a:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -4px;
}

@media (max-width: 500px) {
  .navbar-conteudo {
    width: min(100% - 24px, 880px);
    height: 54px;
  }

  .logo {
    font-size: 20px;
  }
}
</style>