<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['detalhes']);
const emit = defineEmits(['atualizar']);

const notaSelecionada = ref('');
const usuarioId = ref(''); 
const enviando = ref(false);

const media = computed(() => Number(props.detalhes?.average_rating || 0));
const totalAvaliacoes = computed(() => props.detalhes?.reviews ? props.detalhes.reviews.length : 0);

// Notas de 5 a 1, com a largura de cada barra proporcional ao total de votos
const distribuicao = computed(() => {
  const contagem = props.detalhes?.rating_count;
  if (!contagem) return [];

  const itens = Object.entries(contagem).map(([nota, total]) => ({
    nota: Number(nota),
    total: Number(total)
  }));
  const soma = itens.reduce((acc, i) => acc + i.total, 0) || 1;

  return itens
    .sort((a, b) => b.nota - a.nota)
    .map((i) => ({ ...i, pct: (i.total / soma) * 100 }));
});

async function avaliarFilme() {
  if (!notaSelecionada.value || !usuarioId.value) return;
  enviando.value = true;

  try {
    const resposta = await fetch('http://localhost:3000/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movie_id: props.detalhes.id,
        user_id: parseInt(usuarioId.value), 
        rating: parseInt(notaSelecionada.value)
      })
    });

    if (!resposta.ok) throw new Error('Falha ao registrar avaliação.');

    alert('Avaliação enviada com sucesso!');
    notaSelecionada.value = '';
    usuarioId.value = ''; 
    emit('atualizar');
  } catch (erro) {
    alert('Erro ao enviar avaliação. Verifique a rota da sua API em Go.');
    console.error(erro);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <article v-if="detalhes" class="movie-details">
    <div class="movie-hero">
      <img 
        v-if="detalhes.poster_url" 
        :src="detalhes.poster_url" 
        :alt="detalhes.title" 
        class="capa-filme"
        @error="(e) => e.target.style.display = 'none'"
      />

      <div class="movie-info">
        <h2>{{ detalhes.title }}</h2>

        <div class="resumo-nota">
          <span class="nota-numero">{{ media.toFixed(1) }}</span>
          <div>
            <div
              class="estrelas"
              :style="{ '--preenchido': (media / 5) * 100 + '%' }"
              role="img"
              :aria-label="`Média ${media.toFixed(1)} de 5 estrelas`"
            >★★★★★</div>
            <p class="total-avaliacoes">
              {{ totalAvaliacoes }} {{ totalAvaliacoes === 1 ? 'avaliação' : 'avaliações' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="avaliar-section">
      <h3>Avaliar este filme</h3>
      <div class="form-avaliar">
        <input 
          type="number" 
          v-model="usuarioId" 
          placeholder="ID" 
          aria-label="ID do usuário"
          min="1"
          :disabled="enviando"
        />

        <select v-model="notaSelecionada" aria-label="Nota" :disabled="enviando">
          <option value="">Dar uma nota...</option>
          <option value="5">5 Estrelas - Excelente</option>
          <option value="4">4 Estrelas - Muito Bom</option>
          <option value="3">3 Estrelas - Bom</option>
          <option value="2">2 Estrelas - Ruim</option>
          <option value="1">1 Estrela - Péssimo</option>
        </select>

        <button @click="avaliarFilme" :disabled="!notaSelecionada || !usuarioId || enviando">
          {{ enviando ? 'Enviando...' : 'Enviar Avaliação' }}
        </button>
      </div>
    </div>

    <div v-if="distribuicao.length" class="distribuicao">
      <h3>Distribuição de Notas</h3>
      <ul>
        <li v-for="item in distribuicao" :key="item.nota" class="barra-linha">
          <span class="barra-rotulo">{{ item.nota }} ★</span>
          <div class="barra-trilho">
            <div class="barra-preenchimento" :style="{ width: item.pct + '%' }"></div>
          </div>
          <span class="barra-total">{{ item.total }}</span>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.movie-details {
  padding-top: 8px;
}

.movie-hero {
  display: flex;
  align-items: flex-start;
  gap: 28px;
}

.capa-filme {
  flex: none;
  display: block;
  width: 220px;
  height: auto;
  border-radius: var(--raio-pequeno);
  box-shadow: 0 6px 20px rgba(16, 24, 40, 0.22);
  transition: transform var(--transicao), box-shadow var(--transicao);
}

.capa-filme:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.28);
}

.movie-info {
  flex: 1;
  min-width: 0;
}

h2 {
  margin: 0 0 16px;
  color: var(--texto);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

h3 {
  margin: 0 0 12px;
  color: var(--texto);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

p {
  margin: 0;
}

/* Nota média */
.resumo-nota {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nota-numero {
  color: var(--texto);
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.estrelas {
  position: relative;
  display: inline-block;
  color: #d3d8e3;
  font-size: 22px;
  letter-spacing: 2px;
  line-height: 1;
  white-space: nowrap;
}

.estrelas::before {
  content: "★★★★★";
  position: absolute;
  top: 0;
  left: 0;
  width: var(--preenchido, 0%);
  overflow: hidden;
  color: var(--estrela);
}

.total-avaliacoes {
  margin-top: 4px;
  color: var(--texto-suave);
  font-size: 14px;
}

/* Seções */
.avaliar-section,
.distribuicao {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--borda);
}

/* Formulário */
.form-avaliar {
  display: flex;
  gap: 10px;
}

.form-avaliar > * {
  box-sizing: border-box;
  padding: 10px 12px;
  color: var(--texto);
  font-family: inherit;
  font-size: 14px;
  background-color: var(--superficie);
  border: 1px solid #cfd6e4;
  border-radius: var(--raio-pequeno);
  transition: border-color var(--transicao), box-shadow var(--transicao), background-color var(--transicao);
}

.form-avaliar input {
  width: 90px;
}

.form-avaliar select {
  flex: 1;
  cursor: pointer;
}

.form-avaliar input:focus,
.form-avaliar select:focus {
  outline: none;
  border-color: var(--azul);
  box-shadow: 0 0 0 3px rgba(6, 58, 142, 0.15);
}

.form-avaliar input:disabled,
.form-avaliar select:disabled {
  color: #a0a7b5;
  background-color: #f5f6f9;
  cursor: not-allowed;
}

.form-avaliar button {
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  background-color: var(--azul);
  border-color: var(--azul);
  cursor: pointer;
  transition: background-color var(--transicao), transform 0.1s ease;
}

.form-avaliar button:hover:not(:disabled) {
  background-color: var(--azul-escuro);
}

.form-avaliar button:active:not(:disabled) {
  transform: scale(0.97);
}

.form-avaliar button:focus-visible {
  outline: 2px solid var(--azul);
  outline-offset: 2px;
}

.form-avaliar button:disabled {
  color: #a0a7b5;
  background-color: #f5f6f9;
  border-color: var(--borda);
  cursor: not-allowed;
}

/* Distribuição de notas */
.distribuicao ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.barra-linha {
  display: grid;
  grid-template-columns: 36px 1fr 32px;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 14px;
}

.barra-rotulo {
  color: var(--texto);
  font-weight: 600;
  white-space: nowrap;
}

.barra-trilho {
  height: 10px;
  overflow: hidden;
  background-color: var(--fundo);
  border-radius: 999px;
}

.barra-preenchimento {
  height: 100%;
  background-color: var(--estrela);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.barra-total {
  color: var(--texto-suave);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .movie-hero {
    flex-direction: column;
    gap: 20px;
  }

  .capa-filme {
    width: 100%;
    max-width: 220px;
  }

  h2 {
    font-size: 24px;
  }
}

@media (max-width: 500px) {
  .form-avaliar {
    flex-direction: column;
  }

  .form-avaliar > * {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .capa-filme,
  .barra-preenchimento {
    transition: none;
  }
}
</style>