<script setup>
import { ref } from 'vue';

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
  <div class="busca-container">
    <label for="movie-search">Pesquisar um filme:</label>
    <input 
      id="movie-search"
      type="text" 
      v-model="query" 
      @input="aoDigitar" 
      placeholder="Digite o título do filme..." 
      class="input-busca"
    />
    
    <div v-if="buscando" class="status">Pesquisando...</div>

    <ul v-if="resultados && resultados.length" class="lista-resultados">
      <li v-for="filme in resultados" :key="filme.id" @click="selecionarFilme(filme.id)">
        <img 
          v-if="filme.poster_url" 
          :src="filme.poster_url" 
          :alt="filme.title" 
          class="miniatura" 
        />
        <div class="info-resultado">
          <strong>{{ filme.title }}</strong>
          <span class="ano" v-if="filme.release_date">{{ filme.release_date.substring(0, 4) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.busca-container {
  position: relative;
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 14px;
}

.input-busca {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  background-color: #fff;
  box-sizing: border-box;
}

.status {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.lista-resultados {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  max-height: 400px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.lista-resultados li {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.lista-resultados li:last-child {
  border-bottom: none;
}

.lista-resultados li:hover {
  background: #f5f5f5;
}

.miniatura {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.info-resultado {
  display: flex;
  flex-direction: column;
}

.info-resultado strong {
  font-size: 14px;
  color: #111;
}

.ano {
  font-size: 12px;
  color: #777;
  margin-top: 4px;
}
</style>