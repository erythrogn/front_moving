<script setup>
import { ref, onMounted } from 'vue';

import Header from './components/Header.vue';
import Home from './components/Home.vue';
import Search from './components/Search.vue';
import Movie from './components/movie/Movie.vue';
import Actor from './components/actor/Actor.vue';
import User from './components/user/User.vue';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const paginaAtual = ref('home');

const filmes = ref([]);
const carregandoFilmes = ref(true);
const filmeSelecionado = ref('');
const detalhesFilme = ref(null);
const carregandoDetalhes = ref(false);
const erroDetalhes = ref('');
const erroMensagem = ref('');

const atorSelecionadoApp = ref(null);

function mudarPagina(pagina) {
  atorSelecionadoApp.value = null;
  paginaAtual.value = pagina;
}

function onAtorSelecionado(id) {
  atorSelecionadoApp.value = { id };
  paginaAtual.value = 'atores';
}

async function buscarFilmes() {
  carregandoFilmes.value = true;
  erroMensagem.value = '';
  try {
    const resposta = await fetch(`${API}/movies`);
    if (!resposta.ok) throw new Error('Falha ao buscar filmes.');
    filmes.value = await resposta.json();
  } catch (erro) {
    erroMensagem.value = 'Erro ao carregar banco de dados.';
    console.error(erro);
  } finally {
    carregandoFilmes.value = false;
  }
}

async function buscarDetalhes({ silencioso = false } = {}) {
  const id = filmeSelecionado.value;

  if (!id) {
    detalhesFilme.value = null;
    erroDetalhes.value = '';
    carregandoDetalhes.value = false;
    return;
  }

  if (!silencioso) {
    detalhesFilme.value = null;
    erroDetalhes.value = '';
    carregandoDetalhes.value = true;
  }

  try {
    const resposta = await fetch(`${API}/movies/${id}`);
    if (!resposta.ok) throw new Error('Falha ao buscar detalhes.');
    const dados = await resposta.json();

    if (id !== filmeSelecionado.value) return;

    detalhesFilme.value = dados;
    erroDetalhes.value = '';
  } catch (erro) {
    console.error(erro);
    if (id !== filmeSelecionado.value) return;

    if (!silencioso) detalhesFilme.value = null;
    erroDetalhes.value = 'Erro ao carregar os detalhes do filme.';
  } finally {
    if (id === filmeSelecionado.value) carregandoDetalhes.value = false;
  }
}

async function atualizarFilmeEAcervo() {
  await buscarDetalhes({ silencioso: true });
  await buscarFilmes();
}

function onFilmeSelecionado(id) {
  filmeSelecionado.value = id;
  paginaAtual.value = 'filmes';
  buscarDetalhes();
}

onMounted(() => {
  buscarFilmes();
});
</script>

<template>
  <div class="app-wrapper">
    <Header :paginaAtual="paginaAtual" @navegar="mudarPagina" />

    <main class="container" :class="{ 'container-largo': paginaAtual === 'home' }">
      
      <div v-if="paginaAtual === 'home'">
        <h1>Painel Principal</h1>
        
        <Home
          :filmes="filmes"
          :carregando="carregandoFilmes"
          :erroMensagem="erroMensagem"
          @selecionar="onFilmeSelecionado"
          @navegar="mudarPagina"
        />
      </div>

      <div v-else-if="paginaAtual === 'filmes'">
        <h1>Acervo de Filmes</h1>
        
        <Search @selecionar="onFilmeSelecionado" />

        <p v-if="carregandoDetalhes" class="vazio" role="status">
          Carregando filme...
        </p>
        <template v-else>
          <p v-if="erroDetalhes" class="vazio vazio-erro" role="alert">
            {{ erroDetalhes }}
          </p>
          <p v-else-if="!detalhesFilme" class="vazio">
            Pesquise um filme para ver a nota média e avaliar.
          </p>
        </template>

        <Movie
          :detalhes="detalhesFilme"
          @atualizar="atualizarFilmeEAcervo"
          @selecionar-ator="onAtorSelecionado"
        />
      </div>

      <div v-else-if="paginaAtual === 'atores'">
        <h1>Atores</h1>
        <Actor :detalhes="atorSelecionadoApp" @selecionar="onFilmeSelecionado" />
      </div>

      <div v-else-if="paginaAtual === 'perfil'">
        <User @login-sucesso="mudarPagina('home')" />
      </div>

    </main>
  </div>
</template>

<style scoped>
.app-wrapper {
  box-sizing: border-box;
  min-height: 100vh;
  padding-left: 80px;
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

.container-largo {
  width: min(100% - 32px, 1240px);
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

.vazio-erro {
  color: var(--erro);
  background-color: var(--erro-fundo);
  border-color: var(--erro);
}

@media (max-width: 768px) {
  .app-wrapper {
    padding-left: 0;
    padding-bottom: 70px;
  }
}

@media (max-width: 500px) {
  .container {
    width: min(100% - 24px, 880px);
    margin: 16px auto 32px;
    padding: 20px;
  }
  .container-largo {
    width: min(100% - 24px, 880px);
  }

  h1 {
    font-size: 22px;
  }
}
</style>