<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import MediaCard from '../MediaCard.vue';
import Search from '../Search.vue';
import { actorService } from '../../services/actorService';

const props = defineProps(['detalhes']);
const emit = defineEmits(['selecionar']);

const atorSelecionado = ref(null);
const carregandoDetalhes = ref(false);

const paginaAtual = ref(1);
const limitePorPagina = 12;

const mostrarBiografiaCompleta = ref(false);
const visualizandoFilmes = ref(false);
const limiteBio = 250;

const biografiaExibida = computed(() => {
  const bio = atorSelecionado.value?.biography;
  if (!bio) return '';
  if (mostrarBiografiaCompleta.value || bio.length <= limiteBio) return bio;
  return bio.substring(0, limiteBio) + '...';
});

const precisaExpandirBio = computed(() => {
  const bio = atorSelecionado.value?.biography;
  return bio && bio.length > limiteBio;
});

function alternarBiografia() {
  mostrarBiografiaCompleta.value = !mostrarBiografiaCompleta.value;
}

function abrirFilmes() {
  visualizandoFilmes.value = true;
}

function voltarParaAtor() {
  visualizandoFilmes.value = false;
}

function subtituloFilme(filme) {
  if (!filme) return '';
  const ano = filme.release_date ? String(filme.release_date).substring(0, 4) : '';
  if (ano && filme.character) return `${ano} • ${filme.character}`;
  return ano || filme.character || '';
}

watch(
  () => atorSelecionado.value,
  () => {
    mostrarBiografiaCompleta.value = false;
    visualizandoFilmes.value = false;
  }
);

onMounted(async () => {
  const populares = await actorService.carregarAtoresPopulares(1, limitePorPagina);
  if (populares && populares.length > 0 && !atorSelecionado.value) {
    const indiceAleatorio = Math.floor(Math.random() * populares.length);
    selecionarAtor(populares[indiceAleatorio].id);
  }
});

watch(
  () => props.detalhes,
  (novoAtor) => {
    if (novoAtor) {
      atorSelecionado.value = novoAtor;
      actorService.buscarFoto(novoAtor);
      if (novoAtor.id && !novoAtor.movies) selecionarAtor(novoAtor.id);
    }
  },
  { immediate: true }
);

function carregarMais() {
  if (actorService.temMaisPopulares) {
    paginaAtual.value++;
    actorService.carregarAtoresPopulares(paginaAtual.value, limitePorPagina);
  }
}

async function selecionarAtor(id) {
  carregandoDetalhes.value = true;
  const dados = await actorService.selecionarAtor(id);
  if (dados) {
    atorSelecionado.value = dados;
  }
  carregandoDetalhes.value = false;
}
</script>

<template>
  <div class="actor-page">
    <Search
      endpoint="/actors/search"
      placeholder="Pesquise o nome do ator..."
      @selecionar="selecionarAtor"
    />

    <article v-if="atorSelecionado" class="actor-details">
      <div v-if="!visualizandoFilmes" class="actor-hero">
        <div v-if="carregandoDetalhes" class="overlay-carregando">
          <div class="spinner"></div>
        </div>

        <img
          v-if="actorService.obterFoto(atorSelecionado)"
          :src="actorService.obterFoto(atorSelecionado)"
          :key="atorSelecionado.id"
          :alt="atorSelecionado.name"
          class="foto-ator"
          @error="(e) => actorService.tratarErroFoto(atorSelecionado.id, e)"
        />
        <span v-else class="foto-ator foto-vazia" aria-hidden="true"></span>

        <div class="actor-info">
          <h2>{{ atorSelecionado.name }}</h2>

          <div class="resumo-dados">
            <p v-if="atorSelecionado.known_for_department">
              Área: {{ atorSelecionado.known_for_department }}
            </p>
            <p v-if="atorSelecionado.birthday">
              Data de Nascimento: {{ atorSelecionado.birthday }}
            </p>
            <p v-if="atorSelecionado.place_of_birth">
              Local de Origem: {{ atorSelecionado.place_of_birth }}
            </p>
          </div>

          <div v-if="atorSelecionado.biography" class="biografia">
            <p>{{ biografiaExibida }}</p>
            <button v-if="precisaExpandirBio" type="button" class="btn-link btn-expandir" @click="alternarBiografia">
              {{ mostrarBiografiaCompleta ? 'Ver menos' : 'Ler mais' }}
            </button>
          </div>

          <div v-if="atorSelecionado.movies && atorSelecionado.movies.length" class="acoes-ator">
             <button type="button" class="btn-carregar" @click="abrirFilmes">
                Ver Filmografia ({{ atorSelecionado.movies.length }})
             </button>
          </div>
        </div>
      </div>

      <div v-else class="filmes-ator-view">
        <div class="filmes-header">
          <button type="button" class="btn-voltar" @click="voltarParaAtor">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar ao perfil
          </button>
          <h3>Filmografia de {{ atorSelecionado.name }}</h3>
        </div>

        <ul class="grade-atores">
          <li v-for="filme in atorSelecionado.movies" :key="filme.id">
            <MediaCard
              :titulo="filme.title"
              :subtitulo="subtituloFilme(filme)"
              :imagem="filme.poster_url"
              centralizado
              @selecionar="emit('selecionar', filme.id)"
            />
          </li>
        </ul>
      </div>
    </article>

    <div v-show="!visualizandoFilmes" class="populares-section">
      <h3>Atores Populares</h3>
      
      <p v-if="!actorService.carregandoPopulares && actorService.atoresPopulares.length === 0" class="vazio-msg">
        Nenhum ator encontrado no momento.
      </p>

      <ul class="grade-atores" v-if="actorService.atoresPopulares.length || actorService.carregandoPopulares">
        <li v-for="ator in actorService.atoresPopulares" :key="ator.id">
          <MediaCard
            :titulo="ator.name"
            :imagem="actorService.obterFoto(ator)"
            texto-sem-capa="Sem Foto"
            centralizado
            @selecionar="selecionarAtor(ator.id)"
            @erro-imagem="(e) => actorService.tratarErroFoto(ator.id, e)"
          />
        </li>
        
        <template v-if="actorService.carregandoPopulares">
          <li v-for="n in (paginaAtual === 1 ? 6 : 3)" :key="`skel-${n}`" class="skeleton-card">
            <div class="card-foto shimmer"></div>
            <div class="linha-skeleton shimmer"></div>
          </li>
        </template>
      </ul>

      <div class="acoes-paginacao" v-if="actorService.temMaisPopulares && actorService.atoresPopulares.length > 0">
        <button 
          type="button" 
          class="btn-carregar" 
          @click="carregarMais" 
          :disabled="actorService.carregandoPopulares"
        >
          {{ actorService.carregandoPopulares ? 'Carregando...' : 'Mostrar Mais Atores' }}
        </button>
      </div>
      <p v-else-if="!actorService.temMaisPopulares && actorService.atoresPopulares.length > 0" class="fim-lista">
        Todos os atores foram carregados.
      </p>
    </div>
  </div>
</template>

<style scoped>
.actor-page {
  display: flex;
  flex-direction: column;
}

.foto-vazia {
  background-color: rgba(255, 255, 255, 0.08);
}

.actor-details {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.actor-hero {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 2.5rem;
  padding: 32px;
  background-color: var(--azul);
  backdrop-filter: blur(24px);
  border: 1px solid var(--azul-escuro);
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
  transition:
    background-color 0.6s ease,
    box-shadow 0.6s ease;
  overflow: hidden;
}

.actor-hero::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.actor-hero:hover {
  background-color: var(--azul-escuro);
  box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
}

.overlay-carregando {
  position: absolute;
  inset: 0;
  background-color: rgba(4, 41, 106, 0.7);
  backdrop-filter: blur(6px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.foto-ator {
  width: 200px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--azul-escuro);
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
  transition:
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1),
    filter 0.3s linear;
}

.actor-hero:hover .foto-ator {
  transform: scale(1.03);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.25));
}

.actor-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

h2 {
  margin: 0;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.3;
}

p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  line-height: 1.8;
}

.resumo-dados {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.biografia {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.biografia p {
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  text-transform: none;
  line-height: 1.7;
}

.btn-expandir {
  margin-top: 8px;
  font-size: 0.7rem;
  color: var(--azul-escuro);
}

.btn-expandir:hover {
  color: #fff;
}

.acoes-ator {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.filmes-ator-view {
  background-color: transparent;
}

.filmes-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--azul-escuro);
}

.filmes-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.filmes-header h3::before {
  display: none;
}

.btn-voltar {
  appearance: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 10px 18px;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-voltar:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-color: #fff;
}

.populares-section {
  padding-top: 24px;
  border-top: 1px solid var(--azul-escuro);
  margin-top: 2.5rem;
}

.grade-atores {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--azul);
  border: 1px solid var(--azul-escuro);
  box-shadow: 5px 0 20px rgba(4, 41, 106, 0.25);
  pointer-events: none;
}

.card-foto {
  width: 100%;
  aspect-ratio: 2 / 3;
  border: 1px solid var(--azul-escuro);
}

.linha-skeleton {
  height: 10px;
  width: 70%;
  margin-top: 4px;
}

.acoes-paginacao {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}

.btn-carregar {
  appearance: none;
  background-color: var(--azul);
  color: #fff;
  border: 1px solid var(--azul-escuro);
  padding: 14px 28px;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 5px 0 20px rgba(4, 41, 106, 0.25);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.2s ease;
}

.btn-carregar:hover:not(:disabled) {
  background-color: var(--azul-escuro);
  box-shadow: 10px 0 30px rgba(4, 41, 106, 0.4);
  transform: translateY(-2px);
}

.btn-carregar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.fim-lista,
.vazio-msg {
  text-align: center;
  margin-top: 32px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media screen and (max-width: 768px) {
  .actor-hero {
    flex-direction: column;
    padding: 24px 20px;
  }

  .foto-ator {
    width: 160px;
  }
}
</style>

