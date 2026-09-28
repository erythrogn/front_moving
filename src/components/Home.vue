<script setup>
defineProps(['filmes', 'erroMensagem']);
defineEmits(['selecionar']);
</script>

<template>
  <div class="form-group">
    <label for="movie-select">Selecione um filme:</label>
    
    <select id="movie-select" @change="$emit('selecionar', $event.target.value)">
      <option value="">
        {{ erroMensagem ? erroMensagem : (filmes.length ? 'Escolha um filme' : 'Carregando filmes...') }}
      </option>
      
      <option v-for="filme in filmes" :key="filme.ID || filme.id" :value="filme.ID || filme.id">
        {{ filme.Title || filme.title }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 14px;
}

select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  background-color: #fff;
  cursor: pointer;
}
</style>