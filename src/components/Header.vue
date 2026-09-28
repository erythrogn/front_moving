<script setup>
function avisoSeries() {
  alert('O banco de dados de séries será integrado em breve!');
}
</script>

<template>
  <header class="navbar">
    <div class="logo">Filmando</div>
    <nav class="nav-links">
      <a href="#" class="active">Filmes</a>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1a1a1a;
  padding: 15px 40px;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.logo {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
}

.nav-links a {
  color: #ccc;
  text-decoration: none;
  margin-left: 20px;
  font-size: 16px;
  transition: color 0.3s;
}

.nav-links a:hover, .nav-links a.active {
  color: #fff;
  font-weight: bold;
}
</style>