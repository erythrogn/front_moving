<script setup>
import { ref, computed, watch, onMounted, onActivated } from 'vue';
import MediaCard from './MediaCard.vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  filmes: { type: Array, default: () => [] },
  carregando: { type: Boolean, default: false },
  erroMensagem: { type: String, default: '' }
});

const emit = defineEmits(['selecionar', 'navegar']);

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authStore = useAuthStore();

const capasCache = ref({});
const capasCarregando = ref({});
const capasComErro = ref({});
const reviewsCache = ref({});

onMounted(() => {
  authStore.sincronizarSessao();
});

onActivated(() => {
  authStore.sincronizarSessao();
});

function reviewsDoFilme(filme) {
  if (Array.isArray(filme.reviews)) return filme.reviews;
  return reviewsCache.value[filme.id] || [];
}

// Considera os filmes em destaque (top 10), que são os exibidos e os que têm reviews garantidas
const idsFilmesAvaliados = computed(() => {
  const set = new Set();
  if (!authStore.estaAutenticado || !authStore.userId || !top10Filmes.value.length) return set;

  top10Filmes.value.forEach((filme) => {
    if (reviewsDoFilme(filme).some((r) => Number(r.user_id) === authStore.userId)) {
      set.add(filme.id);
    }
  });
  return set;
});

const qtdAvaliacoes = computed(() => idsFilmesAvaliados.value.size);

const top10Filmes = computed(() => {
  if (!props.filmes.length) return [];

  return [...props.filmes]
    .sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0))
    .slice(0, 10);
});

async function buscarDetalhesFilme(filme) {
  if (!filme || !filme.id) return;
  if (filme.poster_url) {
    capasCache.value[filme.id] = filme.poster_url;
  }

  const precisaCapa = !filme.poster_url && capasCache.value[filme.id] === undefined;
  const precisaReviews = !Array.isArray(filme.reviews) && reviewsCache.value[filme.id] === undefined;

  if (!precisaCapa && !precisaReviews) return;
  if (capasCarregando.value[filme.id]) return;

  capasCarregando.value[filme.id] = true;
  try {
    const resposta = await fetch(`${API}/movies/${filme.id}`);
    if (!resposta.ok) return;
    const dados = await resposta.json();
    if (dados && dados.poster_url) {
      capasCache.value[filme.id] = dados.poster_url;
    }
    reviewsCache.value[filme.id] = Array.isArray(dados?.reviews) ? dados.reviews : [];
  } catch (erro) {
    capasComErro.value[filme.id] = true;
  } finally {
    capasCarregando.value[filme.id] = false;
  }
}

function obterCapa(filme) {
  if (!filme || capasComErro.value[filme.id]) return null;
  return filme.poster_url || capasCache.value[filme.id] || null;
}

function tratarErroCapa(id) {
  capasComErro.value[id] = true;
}

watch(
  top10Filmes,
  (lista) => {
    lista.forEach((filme) => buscarDetalhesFilme(filme));
  },
  { immediate: true }
);

function selecionarFilme(id) {
  emit('selecionar', id);
}

function irParaPerfil() {
  emit('navegar', 'perfil');

  const btnPerfilSidebar = document.querySelector('#navbar button[aria-label="Perfil"]');
  if (btnPerfilSidebar) {
    btnPerfilSidebar.click();
  }
}
</script>

<template>
  <section class="dashboard-container">
    <div 
      class="user-summary clicavel" 
      @click="irParaPerfil"
    >
      <div class="user-info">
        <h2>Olá, {{ authStore.nomeExibicao }}</h2>
        <div v-if="authStore.estaAutenticado" class="logado-cta">
          <p>
            Já avaliou <strong>{{ qtdAvaliacoes }}</strong> 
            {{ qtdAvaliacoes === 1 ? 'filme' : 'filmes' }} no catálogo em destaque.
          </p>
          <button type="button" class="btn-acao" @click.stop="irParaPerfil">
            Ver Perfil
          </button>
        </div>
        <div v-else class="visitante-cta">
          <p>Inicie sessão para registar e acompanhar as suas avaliações.</p>
          <button type="button" class="btn-acao" @click.stop="irParaPerfil">
            Acessar Conta
          </button>
        </div>
      </div>
    </div>

    <p v-if="erroMensagem" class="erro" role="alert">{{ erroMensagem }}</p>

    <!-- Listagem do Top 10 -->
    <div class="top-movies">
      <div class="section-header">
        <h3>Top 10 Filmes da Semana</h3>
        <span v-if="top10Filmes.length > 0" class="contador-acervo">
          Mostrando {{ top10Filmes.length }} títulos
        </span>
      </div>
      
      <!-- Skeleton Loader -->
      <ul v-if="carregando" class="grid-filmes" aria-busy="true">
        <li v-for="n in 10" :key="n" class="cartao-skeleton">
          <div class="capa-skeleton shimmer"></div>
          <div class="info-skeleton">
            <span class="linha-skeleton shimmer"></span>
            <span class="linha-skeleton curta shimmer"></span>
          </div>
        </li>
      </ul>

      <p v-else-if="top10Filmes.length === 0 && !erroMensagem" class="vazio-filmes">
        Nenhum filme cadastrado no momento.
      </p>

      <ul v-else-if="top10Filmes.length" class="grid-filmes">
        <li v-for="(filme, index) in top10Filmes" :key="filme.id">
          <MediaCard
            :titulo="filme.title"
            :imagem="obterCapa(filme)"
            :carregando-imagem="Boolean(capasCarregando[filme.id])"
            :nota="filme.average_rating"
            :posicao="index + 1"
            :avaliado="idsFilmesAvaliados.has(filme.id)"
            @selecionar="selecionarFilme(filme.id)"
            @erro-imagem="tratarErroCapa(filme.id)"
          />
        </li>
      </ul>
    </div>
    
  </section>
</template>
<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.user-summary {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 36px;
  background-color: var(--azul);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--azul-escuro);
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
  overflow: hidden;
  transition: background-color 0.6s ease, box-shadow 0.6s ease, transform 0.3s ease;
}

.user-summary.clicavel {
  cursor: pointer;
  user-select: none;
}

.user-summary::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.user-summary:hover {
  background-color: var(--azul-escuro);
  box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
}

.user-info {
  width: 100%;
}

.user-info h2 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.user-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  transition: color 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.user-summary:hover .user-info p {
  color: #fff;
}

.user-info strong {
  color: #fff;
  font-weight: 600;
}

.visitante-cta,
.logado-cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
}

.btn-acao {
  appearance: none;
  display: inline-block;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 8px 16px;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.user-summary:hover .btn-acao,
.btn-acao:hover,
.btn-acao:focus-visible {
  background-color: #fff;
  color: var(--azul-escuro);
  border-color: #fff;
  outline: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.top-movies h3 {
  position: relative;
  margin: 0;
  padding: 4px 0 4px 18px;
  color: var(--azul-escuro);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.top-movies h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: var(--azul);
  box-shadow: 0 0 10px rgba(4, 41, 106, 0.35);
}

.contador-acervo {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--azul-escuro);
  opacity: 0.75;
}

.grid-filmes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 28px;
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.vazio-filmes {
  margin: 0;
  padding: 40px 16px;
  color: var(--azul-escuro);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-align: center;
  text-transform: uppercase;
  background-color: var(--fundo);
  border: 1px dashed var(--azul-escuro);
}

/* Skeleton Loader */
.cartao-skeleton {
  border: 1px solid var(--azul-escuro);
  background-color: var(--azul);
  overflow: hidden;
}

.capa-skeleton {
  width: 100%;
  aspect-ratio: 2 / 3;
}

.info-skeleton {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.linha-skeleton {
  height: 10px;
  width: 85%;
  display: block;
}

.linha-skeleton.curta {
  width: 40%;
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: loadingShimmer 1.5s infinite;
}

.erro {
  position: relative;
  padding: 18px 24px;
  background-color: var(--azul);
  border: 1px solid var(--azul-escuro);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
}

.erro::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

@media screen and (min-width: 1280px) {
  .grid-filmes {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 32px;
  }
}

@media screen and (max-width: 768px) {
  .grid-filmes {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .user-summary {
    padding: 24px 20px;
  }
}
</style>