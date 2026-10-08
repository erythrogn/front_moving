<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  endpoint: { type: String, default: '/movies/search' },
  placeholder: { type: String, default: 'Pesquise o título do filme...' }
});

const emit = defineEmits(['selecionar']);

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const query = ref('');
const resultados = ref([]);
const buscando = ref(false);
const erroMensagem = ref('');
const containerRef = ref(null);

let timeout = null;
let abortController = null;

function obterTitulo(item) {
  return item.title || item.name || '';
}

function obterSubtitulo(item) {
  if (item.release_date) return String(item.release_date).substring(0, 4);
  if (item.known_for_department) return item.known_for_department;
  return '';
}

function aoDigitar() {
  clearTimeout(timeout);
  erroMensagem.value = '';

  if (abortController) {
    abortController.abort();
  }

  if (!query.value.trim()) {
    resultados.value = [];
    buscando.value = false;
    return;
  }

  timeout = setTimeout(async () => {
    buscando.value = true;
    erroMensagem.value = '';
    abortController = new AbortController();

    try {
      const resposta = await fetch(
        `${API}${props.endpoint}?q=${encodeURIComponent(query.value.trim())}`,
        { signal: abortController.signal }
      );
      if (!resposta.ok) throw new Error('Falha na busca');
      const dados = await resposta.json();
      resultados.value = Array.isArray(dados) ? dados : (dados.data || []);

      if (resultados.value.length === 0) {
        erroMensagem.value = 'Nenhum resultado encontrado.';
      }
    } catch (erro) {
      if (erro.name === 'AbortError') return;
      resultados.value = [];
      erroMensagem.value = 'Nenhum resultado encontrado.';
    } finally {
      if (!abortController.signal.aborted) {
        buscando.value = false;
      }
    }
  }, 400);
}

function selecionarItem(id) {
  emit('selecionar', id);
  resultados.value = [];
  erroMensagem.value = '';
  query.value = '';
}

function fecharResultados(evento) {
  if (containerRef.value && !containerRef.value.contains(evento.target)) {
    resultados.value = [];
  }
}

onMounted(() => {
  document.addEventListener('click', fecharResultados);
});

onUnmounted(() => {
  document.removeEventListener('click', fecharResultados);
  clearTimeout(timeout);
  if (abortController) abortController.abort();
});
</script>

<template>
  <section ref="containerRef" class="busca-container">
    <div class="campo-busca">
      <svg v-if="!buscando" class="icone-busca" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <div v-else class="icone-busca spinner-pequeno"></div>

      <input
        type="text"
        v-model="query"
        @input="aoDigitar"
        @keydown.esc="resultados = []"
        :placeholder="placeholder"
        class="input-busca"
      />

      <ul v-if="resultados.length" class="lista-resultados">
        <li v-for="item in resultados" :key="item.id">
          <button type="button" class="item-resultado" @click="selecionarItem(item.id)">
            <img
              v-if="item.poster_url"
              :src="item.poster_url"
              :alt="obterTitulo(item)"
              class="miniatura"
            />
            <span v-else class="miniatura miniatura-vazia" aria-hidden="true"></span>

            <span class="info-resultado">
              <strong>{{ obterTitulo(item) }}</strong>
              <span class="subtitulo-busca" v-if="obterSubtitulo(item)">
                {{ obterSubtitulo(item) }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </div>
    <p v-if="erroMensagem" class="erro">{{ erroMensagem }}</p>
  </section>
</template>

<style scoped>
.busca-container {
  position: relative;
  z-index: 100;
  margin-bottom: 2rem;
}

.campo-busca {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  background-color: var(--azul);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--azul-escuro);
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
  transition: background-color 0.6s ease, box-shadow 0.6s ease;
}

.campo-busca::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #fff;
  transform: scaleY(0);
  transform-origin: center;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease-out;
}

.campo-busca:hover,
.campo-busca:focus-within {
  background-color: var(--azul-escuro);
  box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
}

.campo-busca:hover::before,
.campo-busca:focus-within::before {
  transform: scaleY(1);
}

.icone-busca {
  position: absolute;
  left: 24px;
  color: rgba(255, 255, 255, 0.72);
  pointer-events: none;
  transition: color 0.3s linear, transform 0.3s linear, filter 0.3s linear;
}

.campo-busca:hover .icone-busca,
.campo-busca:focus-within .icone-busca {
  color: #fff;
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.input-busca {
  appearance: none;
  border: none;
  outline: none;
  font-family: inherit;
  height: 54px;
  width: 100%;
  padding: 0 28px 0 64px;
  box-sizing: border-box;
  background-color: transparent;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.input-busca::placeholder {
  color: rgba(255, 255, 255, 0.72);
}

.lista-resultados {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 4px 0 0;
  padding: 0;
  max-height: 380px;
  overflow-y: auto;
  list-style-type: none;
  background-color: var(--azul);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--azul-escuro);
  box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
  z-index: 999;
}

.item-resultado {
  appearance: none;
  border: none;
  border-bottom: 1px solid var(--azul-escuro);
  outline: none;
  font-family: inherit;
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  padding: 12px 28px;
  box-sizing: border-box;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s ease;
}

.item-resultado::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #fff;
  transform: scaleY(0);
  transform-origin: center;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease-out;
}

.item-resultado:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.item-resultado:hover::before {
  transform: scaleY(1);
}

.miniatura {
  width: 40px;
  height: 60px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--azul-escuro);
  transition: transform 0.3s linear, filter 0.3s linear;
}

.item-resultado:hover .miniatura {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.miniatura-vazia {
  background-color: rgba(255, 255, 255, 0.08);
}

.info-resultado {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-resultado strong {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: color 0.4s, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.item-resultado:hover .info-resultado strong {
  color: #fff;
  transform: translateX(6px);
}

.subtitulo-busca {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
</style>