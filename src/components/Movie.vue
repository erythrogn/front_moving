<script setup>
import { ref } from 'vue';

const props = defineProps(['detalhes']);
const emit = defineEmits(['atualizar']);

const notaSelecionada = ref('');
const usuarioId = ref(''); 
const enviando = ref(false);

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
  <div v-if="detalhes" class="movie-details">
    <img 
      v-if="detalhes.poster_url" 
      :src="detalhes.poster_url" 
      :alt="detalhes.title" 
      class="capa-filme"
      @error="(e) => e.target.style.display = 'none'"
    />
    <h2>{{ detalhes.title }}</h2>
 
    <p><strong>Média de Notas:</strong> <span>{{ Number(detalhes.average_rating || 0).toFixed(1) }}</span></p>
    <p><strong>Avaliações Totais:</strong> <span>{{ detalhes.reviews ? detalhes.reviews.length : 0 }}</span></p>

    <div class="avaliar-section">
      <h3>Avaliar este filme</h3>
      <div class="form-avaliar">
        <input 
          type="number" 
          v-model="usuarioId" 
          placeholder="ID" 
          min="1"
          :disabled="enviando"
        />

        <select v-model="notaSelecionada" :disabled="enviando">
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

    <div v-if="detalhes.rating_count" class="distribuicao">
      <h3>Distribuição de Notas</h3>
      <ul>
        <li v-for="(total, nota) in detalhes.rating_count" :key="nota">
          Estrelas {{ nota }}: {{ total }} avaliação(ões)
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.movie-details {
  padding-top: 10px;
}

.capa-filme {
  width: 100%;
  max-width: 250px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: block;
}

.avaliar-section, .distribuicao {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

h2 { margin: 0 0 15px 0; color: #111; font-size: 22px; }
h3 { margin: 0 0 10px 0; color: #111; font-size: 16px; }
p, li { margin: 0 0 8px 0; color: #555; font-size: 14px; }

.form-avaliar { 
  display: flex; 
  gap: 10px; 
  margin-top: 15px;
}

.form-avaliar > * {
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
}

.form-avaliar input { width: 90px; }
.form-avaliar select { flex: 1; }

.form-avaliar button {
  background-color: #111;
  color: #fff;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-avaliar button:hover:not(:disabled) { 
  background-color: #333; 
}

.form-avaliar button:disabled { 
  background-color: #f5f5f5; 
  color: #a0a0a0; 
  border: 1px solid #eee;
  cursor: not-allowed; 
}

.distribuicao ul { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
}

@media (max-width: 500px) {
  .form-avaliar { flex-direction: column; }
  .form-avaliar > * { width: 100%; box-sizing: border-box; }
}
</style>