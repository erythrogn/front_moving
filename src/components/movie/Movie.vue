<script setup>
import { ref, computed, watch } from 'vue';
import MediaCard from '../MediaCard.vue';
import MovieRatingBars from './MovieRatingBars.vue';
import { useAuthStore } from '../../stores/auth';
import { movieService } from '../../services/movieService';

const props = defineProps(['detalhes']);
const emit = defineEmits(['atualizar', 'selecionar-ator']);

const authStore = useAuthStore();
const notaSelecionada = ref('');
const enviando = ref(false);

const media = computed(() => Number(props.detalhes?.average_rating || 0));
const totalAvaliacoes = computed(() => props.detalhes?.reviews ? props.detalhes.reviews.length : 0);

const anoLancamento = computed(() => {
  const data = props.detalhes?.release_date || props.detalhes?.year;
  return data ? String(data).substring(0, 4) : 'Não informado';
});

const direcao = computed(() => props.detalhes?.director || 'Não informado');

watch(
  () => props.detalhes,
  (filme) => {
    if (filme) movieService.buscarCapa(filme);
  },
  { immediate: true }
);

const jaAvaliou = computed(() => {
  const userId = authStore.userId;
  if (!userId || !props.detalhes?.reviews) return false;
  return props.detalhes.reviews.some((r) => Number(r.user_id) === Number(userId));
});

async function avaliarFilme() {
  if (!notaSelecionada.value) return;

  if (!authStore.userId || !authStore.token) {
    alert('Precisa de iniciar sessão na aba Perfil para avaliar um filme.');
    return;
  }

  enviando.value = true;
  try {
    const atualizou = await movieService.enviarAvaliacao({
      movieId: props.detalhes.id,
      userId: authStore.userId,
      rating: parseInt(notaSelecionada.value, 10),
      token: authStore.token,
      jaAvaliou: jaAvaliou.value
    });
    alert(atualizou ? 'Avaliação atualizada com sucesso!' : 'Avaliação enviada com sucesso!');
    notaSelecionada.value = '';
    emit('atualizar');
  } catch (erro) {
    if (erro.status === 401) {
      authStore.limparSessao();
      alert(erro.message);
    } else {
      alert(erro.message || 'Erro ao enviar avaliação.');
      console.error(erro);
    }
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <article v-if="detalhes" class="movie-details">
    <div class="movie-hero">
      <img 
        v-if="movieService.obterCapa(detalhes)" 
        :src="movieService.obterCapa(detalhes)" 
        :alt="detalhes.title" 
        class="capa-filme"
        @error="(e) => movieService.tratarErroCapa(detalhes.id, e)"
      />
      <span v-else class="capa-filme capa-vazia" aria-hidden="true"></span>

      <div class="movie-info">
        <h2>{{ detalhes.title }}</h2>
        <div class="resumo-nota">
          <span class="nota-numero">{{ media.toFixed(1) }}</span>
          <div>
            <div class="estrelas-barra" role="img" :aria-label="`Média ${media.toFixed(1)} de 5 estrelas`">
              <div class="estrelas-fundo">
                <svg v-for="n in 5" :key="`bg-${n}`" viewBox="0 0 24 24" class="icone-estrela">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="estrelas-preenchido" :style="{ width: (media / 5) * 100 + '%' }">
                <svg v-for="n in 5" :key="`fill-${n}`" viewBox="0 0 24 24" class="icone-estrela">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <p class="total-avaliacoes">{{ totalAvaliacoes }} {{ totalAvaliacoes === 1 ? 'avaliação' : 'avaliações' }}</p>
          </div>
          <div class="metadados-filme">  
            <p>Direção: <strong>{{ direcao }}</strong></p>
            <p>Ano de Lançamento: <strong>{{ anoLancamento }}</strong></p>
          </div>
        </div>
      </div>
    </div>

    <div class="avaliar-section">
      <h3>{{ jaAvaliou ? 'Atualizar a sua avaliação' : 'Avaliar este filme' }}</h3>
      <div class="form-avaliar">
        <select v-model="notaSelecionada" aria-label="Nota" :disabled="enviando">
          <option value="">Dar uma nota...</option>
          <option value="5">5 Estrelas - Excelente</option>
          <option value="4">4 Estrelas - Muito Bom</option>
          <option value="3">3 Estrelas - Bom</option>
          <option value="2">2 Estrelas - Ruim</option>
          <option value="1">1 Estrela - Péssimo</option>
        </select>
        <button type="button" @click="avaliarFilme" :disabled="!notaSelecionada || enviando">
          {{ enviando ? 'Enviando...' : (jaAvaliou ? 'Atualizar Avaliação' : 'Enviar Avaliação') }}
        </button>
      </div>
    </div>

    <MovieRatingBars :rating-count="detalhes.rating_count" />

    <div v-if="detalhes.cast && detalhes.cast.length" class="elenco-section">
      <h3>Elenco Principal</h3>
      <ul class="grade-elenco">
        <li v-for="ator in detalhes.cast.slice(0, 10)" :key="ator.id">
          <MediaCard
            :titulo="ator.name"
            :subtitulo="ator.character || ''"
            :imagem="ator.poster_url"
            texto-sem-capa="Sem Foto"
            centralizado
            @selecionar="emit('selecionar-ator', ator.id)"
          />
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
  .movie-details {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .movie-hero {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    gap: 2.5rem;
    padding: 32px;
    background-color: var(--azul);
    backdrop-filter: blur(24px);
    border: 1px solid var(--azul-escuro);
    box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
    transition: background-color 0.6s ease, box-shadow 0.6s ease;
  }

  .movie-hero::before {
    content: "";
    position: absolute;
    left: 0;
    top: 15%;
    height: 70%;
    width: 3px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .movie-hero:hover {
    background-color: var(--azul-escuro);
    box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
  }

  .capa-filme {
    width: 200px;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--azul-escuro);
    box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
    transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), filter 0.3s linear;
  }

  .movie-hero:hover .capa-filme {
    transform: scale(1.03);
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.25));
  }

  .capa-vazia {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .movie-info {
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

  .metadados-filme strong {
    color: #fff;
  }

  .resumo-nota {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }

  .nota-numero {
    color: #fff;
    font-size: 2.5rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    line-height: 1;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }

  .estrelas-barra {
    position: relative;
    display: inline-flex;
  }

  .estrelas-fundo {
    display: flex;
    gap: 6px;
    color: rgba(255, 255, 255, 0.25);
  }

  .estrelas-preenchido {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    display: flex;
    gap: 6px;
    color: #fff;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }

  .icone-estrela {
    width: 18px;
    height: 18px;
    fill: currentColor;
    flex-shrink: 0;
  }

  .total-avaliacoes {
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.72);
  }

  .avaliar-section,
  .elenco-section {
    padding-top: 24px;
    border-top: 1px solid var(--azul-escuro);
  }

  .form-avaliar {
    display: flex;
    gap: 1.5rem;
  }

  .grade-elenco {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1.25rem;
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  @media screen and (max-width: 768px) {
    .movie-hero {
      flex-direction: column;
      padding: 24px 20px;
    }

    .capa-filme {
      width: 160px;
    }

    .form-avaliar {
      flex-direction: column;
    }
  }
</style>

