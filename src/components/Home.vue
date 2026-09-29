<script setup>
import { ref } from 'vue';

defineProps({
  filmes: { type: Array, default: () => [] },
  erroMensagem: { type: String, default: '' }
});

const emit = defineEmits(['selecionar']);

const query = ref('');
const resultados = ref([]);
const buscando = ref(false);
let timeout = null;

function aoDigitar() {
  clearTimeout(timeout);
  if (!query.value.trim()) {
    resultados.value = [];
    return;
  }
  
  timeout = setTimeout(async () => {
    buscando.value = true;
    try {
      const resposta = await fetch(`http://localhost:3000/movies/search?q=${encodeURIComponent(query.value)}`);
      if (!resposta.ok) throw new Error('Falha na busca');
      resultados.value = await resposta.json();
    } catch (erro) {
      console.error(erro);
    } finally {
      buscando.value = false;
    }
  }, 500);
}

function selecionarFilme(id) {
  emit('selecionar', id);
  resultados.value = [];
  query.value = '';
}
</script>

<template>
  <section class="busca-container">
    <label for="movie-search">Pesquisar um filme</label>

    <div class="campo-busca">
      <svg class="icone-busca" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>

      <input
        id="movie-search"
        type="text"
        v-model="query"
        @input="aoDigitar"
        placeholder="Digite o título do filme..."
        class="input-busca"
        autocomplete="off"
      />

      <span v-if="buscando" class="status" role="status">Pesquisando...</span>

      <ul v-if="resultados && resultados.length" class="lista-resultados">
        <li v-for="filme in resultados" :key="filme.id">
          <button type="button" class="item-resultado" @click="selecionarFilme(filme.id)">
            <img
              v-if="filme.poster_url"
              :src="filme.poster_url"
              :alt="filme.title"
              class="miniatura"
            />
            <span v-else class="miniatura miniatura-vazia" aria-hidden="true"></span>

            <span class="info-resultado">
              <strong>{{ filme.title }}</strong>
              <span class="ano" v-if="filme.release_date">{{ filme.release_date.substring(0, 4) }}</span>
            </span>
          </button>
        </li>
      </ul>
    </div>

    <p v-if="erroMensagem" class="erro" role="alert">{{ erroMensagem }}</p>
  </section>
</template>

<style scoped>
.busca-container {
  position: relative;
  z-index: 5;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--texto);
  font-size: 14px;
  font-weight: 600;
}

.campo-busca {
  position: relative;
}

.icone-busca {
  position: absolute;
  top: 50%;
  left: 14px;
  color: var(--texto-suave);
  transform: translateY(-50%);
  pointer-events: none;
}

.input-busca {
  box-sizing: border-box;
  width: 100%;
  padding: 13px 120px 13px 42px;
  color: var(--texto);
  font-family: inherit;
  font-size: 15px;
  background-color: var(--superficie);
  border: 1px solid #cfd6e4;
  border-radius: var(--raio-pequeno);
  transition: border-color var(--transicao), box-shadow var(--transicao);
}

.input-busca::placeholder {
  color: #8a94a6;
}

.input-busca:focus {
  outline: none;
  border-color: var(--azul);
  box-shadow: 0 0 0 3px rgba(6, 58, 142, 0.15);
}

.status {
  position: absolute;
  top: 50%;
  right: 14px;
  color: var(--texto-suave);
  font-size: 13px;
  transform: translateY(-50%);
  pointer-events: none;
}

.lista-resultados {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  max-height: 360px;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  list-style: none;
  background-color: var(--superficie);
  border: 1px solid var(--borda);
  border-radius: var(--raio);
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.16);
}

.lista-resultados li {
  margin: 0;
}

.item-resultado {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px;
  color: inherit;
  font: inherit;
  text-align: left;
  background: none;
  border: 0;
  border-radius: var(--raio-pequeno);
  cursor: pointer;
  transition: background-color var(--transicao);
}

.item-resultado:hover,
.item-resultado:focus-visible {
  outline: none;
  background-color: var(--azul-claro);
}

.miniatura {
  flex: none;
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.miniatura-vazia {
  background-color: var(--borda);
  box-shadow: none;
}

.info-resultado {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.info-resultado strong {
  color: var(--texto);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.ano {
  color: var(--texto-suave);
  font-size: 13px;
}

.erro {
  margin: 12px 0 0;
  padding: 10px 12px;
  color: var(--erro);
  font-size: 14px;
  background-color: var(--erro-fundo);
  border: 1px solid #fecdca;
  border-radius: var(--raio-pequeno);
}

@media (max-width: 500px) {
  .input-busca {
    padding-right: 14px;
  }

  .status {
    display: none;
  }
}
</style>