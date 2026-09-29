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
  
    let resposta = await fetch(`http://localhost:3000/movies/${filmeSelecionado.value}`);
    if (!resposta.ok) throw new Error('Falha ao buscar detalhes.');
    let dados = await resposta.json();


    if (!dados.poster_url || dados.poster_url === "") {
      console.log("Capa ausente. A solicitar atualização automática ao backend...");

      await fetch('http://localhost:3000/movies/import/tmdb', { 
        method: 'POST' 
      });
      const novaResposta = await fetch(`http://localhost:3000/movies/${filmeSelecionado.value}`);
      if (novaResposta.ok) {
        dados = await novaResposta.json();
      }
    }
    detalhesFilme.value = dados;
    
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

    <main class="container">
      <h1>Acervo</h1>

      <Home
        :filmes="filmes"
        :erroMensagem="erroMensagem"
        @selecionar="onFilmeSelecionado"
      />

      <p v-if="!detalhesFilme" class="vazio">
        Pesquise um filme para ver a nota média e avaliar.
      </p>

      <Movie
        :detalhes="detalhesFilme"
        @atualizar="buscarDetalhes"
      />
    </main>
  </div>
</template>

<style>
/* Tokens compartilhados por todos os componentes */
:root {
  --azul: #063a8e;
  --azul-escuro: #04296a;
  --azul-claro: #e8effc;
  --texto: #1b2333;
  --texto-suave: #5b6577;
  --borda: #e3e7ef;
  --fundo: #eef1f6;
  --superficie: #ffffff;
  --estrela: #f5a524;
  --erro: #b42318;
  --erro-fundo: #fef3f2;
  --raio: 12px;
  --raio-pequeno: 8px;
  --transicao: 0.18s ease;
  --sombra: 0 1px 2px rgba(16, 24, 40, 0.06), 0 8px 24px rgba(16, 24, 40, 0.08);
}

body {
  margin: 0;
  background-color: var(--fundo);
}
</style>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  color: var(--texto);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.container {
  box-sizing: border-box;
  width: min(100% - 32px, 880px);
  margin: 32px auto 48px;
  padding: 32px;
  background-color: var(--superficie);
  border: 1px solid var(--borda);
  border-radius: var(--raio);
  box-shadow: var(--sombra);
}

h1 {
  margin: 0 0 24px;
  padding-bottom: 16px;
  color: var(--texto);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
  border-bottom: 1px solid var(--borda);
}

.vazio {
  margin: 32px 0 8px;
  padding: 40px 16px;
  color: var(--texto-suave);
  font-size: 15px;
  text-align: center;
  background-color: var(--fundo);
  border: 1px dashed #cfd6e4;
  border-radius: var(--raio);
}

@media (max-width: 500px) {
  .container {
    width: min(100% - 24px, 880px);
    margin: 16px auto 32px;
    padding: 20px;
  }

  h1 {
    font-size: 22px;
  }
}
</style>