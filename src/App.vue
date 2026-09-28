<script setup>
import { ref, onMounted } from 'vue';

import Header from './components/Header.vue';
import Home from './components/Home.vue';
import Movie from './components/Movie.vue';

const filmes = ref([]);
const filmeSelecionado = ref('');
const detalhesFilme = ref(null);
const erroMensagem = ref('');

async function buscarFilmes() {
  try {
    const resposta = await fetch('http://localhost:3000/movies');
    if (!resposta.ok) throw new Error('Falha ao buscar filmes.');
    filmes.value = await resposta.json();
  } catch (erro) {
    erroMensagem.value = 'Erro ao carregar banco de dados.';
    console.error(erro);
  }
}

async function buscarDetalhes() {
  if (!filmeSelecionado.value) {
    detalhesFilme.value = null;
    return;
  }
  try {
    const resposta = await fetch(`http://localhost:3000/movies/${filmeSelecionado.value}`);
    if (!resposta.ok) throw new Error('Falha ao buscar detalhes.');
    detalhesFilme.value = await resposta.json();
  } catch (erro) {
    console.error(erro);
    alert('Erro ao carregar detalhes.');
  }
}

function onFilmeSelecionado(id) {
  filmeSelecionado.value = id;
  buscarDetalhes();
}

onMounted(() => {
  buscarFilmes();
});
</script>

<template>
  <div class="app-wrapper">
    <Header />

    <div class="container">
      <h1>Acervo</h1>
      
      <Home 
        :filmes="filmes" 
        :erroMensagem="erroMensagem" 
        @selecionar="onFilmeSelecionado" 
      />
      <Movie 
        :detalhes="detalhesFilme" 
        @atualizar="buscarDetalhes"
      />
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.container {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 700px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
  color: #333;
}

h1 {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #1a1a1a;
}
</style>