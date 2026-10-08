<script setup>
import { computed } from 'vue';

const props = defineProps({
  ratingCount: {
    type: Object,
    default: () => ({})
  }
});

const distribuicao = computed(() => {
  const contagem = props.ratingCount;
  if (!contagem || Object.keys(contagem).length === 0) return [];

  const itens = Object.entries(contagem).map(([nota, total]) => ({
    nota: Number(nota),
    total: Number(total)
  }));
  const soma = itens.reduce((acc, i) => acc + i.total, 0) || 1;

  return itens
    .sort((a, b) => b.nota - a.nota)
    .map((i) => ({ ...i, pct: (i.total / soma) * 100 }));
});
</script>

<template>
  <div v-if="distribuicao.length" class="distribuicao">
    <h3>Distribuição de Notas</h3>
    <ul>
      <li v-for="item in distribuicao" :key="item.nota" class="barra-linha">
        <span class="barra-rotulo">
          {{ item.nota }}
          <svg viewBox="0 0 24 24" class="icone-estrela-pequeno" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </span>
        <div class="barra-trilho">
          <div class="barra-preenchimento" :style="{ width: item.pct + '%' }"></div>
        </div>
        <span class="barra-total">{{ item.total }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.distribuicao {
  padding-top: 24px;
  border-top: 1px solid var(--azul-escuro);
}
.distribuicao ul {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style-type: none;
}
.barra-linha {
  display: grid;
  grid-template-columns: 48px 1fr 40px;
  align-items: center;
  gap: 1rem;
}
.barra-rotulo,
.barra-total {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--azul-escuro);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
}
.barra-total {
  justify-content: flex-end;
  text-align: right;
}
.barra-trilho {
  height: 12px;
  background-color: var(--azul);
  border: 1px solid var(--azul-escuro);
  overflow: hidden;
}
.barra-preenchimento {
  height: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}
.icone-estrela-pequeno {
  width: 12px;
  height: 12px;
  fill: currentColor;
}
</style>
