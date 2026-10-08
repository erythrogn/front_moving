<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  imagem: { type: String, default: null },
  carregandoImagem: { type: Boolean, default: false },
  nota: { type: [Number, String], default: null },
  posicao: { type: Number, default: null },
  avaliado: { type: Boolean, default: false },
  centralizado: { type: Boolean, default: false },
  textoSemCapa: { type: String, default: 'Sem Pôster' }
});

const emit = defineEmits(['selecionar', 'erro-imagem']);

const imagemComErro = ref(false);

watch(
  () => props.imagem,
  () => {
    imagemComErro.value = false;
  }
);

const exibirImagem = computed(() => props.imagem && !imagemComErro.value);

function aoFalharImagem(evento) {
  imagemComErro.value = true;
  emit('erro-imagem', evento);
}

function formatarNota(valorNota) {
  const valor = Number(valorNota || 0);
  return valor > 0 ? valor.toFixed(1) : 'S/N';
}
</script>

<template>
  <button
    type="button"
    class="media-card"
    :class="{ 'is-centralizado': centralizado }"
    :title="titulo"
    :aria-label="`Ver detalhes de ${titulo}`"
    @click="emit('selecionar')"
  >
    <!-- Badge de Posição (usado no Top 10 da Home) -->
    <span
      v-if="posicao !== null"
      class="posicao-badge"
      :class="{ 'top-3': posicao <= 3 }"
    >
      #{{ posicao }}
    </span>

    <!-- Tag de Filme Avaliado (usado na Home) -->
    <span v-if="avaliado" class="tag-avaliado">
      Avaliado
    </span>

    <!-- Capa / Foto -->
    <div class="capa-wrapper">
      <img
        v-if="exibirImagem"
        :src="imagem"
        :alt="titulo"
        loading="lazy"
        class="capa-img"
        @error="aoFalharImagem"
      />
      <div
        v-else
        class="capa-img capa-vazia"
        :class="{ shimmer: carregandoImagem }"
        aria-hidden="true"
      >
        <span v-if="!carregandoImagem" class="sem-capa-texto">
          {{ textoSemCapa }}
        </span>
      </div>
    </div>

    <!-- Informações do Card -->
    <div class="info-card">
      <strong class="titulo-card">{{ titulo }}</strong>
      <span v-if="subtitulo" class="subtitulo-card">{{ subtitulo }}</span>

      <div v-if="nota !== null" class="rodape-card">
        <span class="nota">
          <svg class="icone-estrela" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {{ formatarNota(nota) }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.media-card {
  appearance: none;
  border: 1px solid var(--azul-escuro);
  outline: none;
  font-family: inherit;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  background-color: var(--azul);
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  transition: background-color 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease;
  contain: layout paint;
  will-change: transform;
}

.media-card.is-centralizado {
  padding: 16px;
  gap: 12px;
  align-items: center;
  text-align: center;
  box-shadow: 5px 0 20px rgba(4, 41, 106, 0.25);
}

.media-card:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 25px rgba(4, 41, 106, 0.8);
  transform: translateY(-4px);
}

.media-card::before {
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
  z-index: 3;
  transition: transform 0.3s ease-out;
}

.media-card:hover {
  background-color: var(--azul-escuro);
  box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
  transform: translateY(-4px);
}

.media-card:hover::before {
  transform: scaleY(1);
}

.posicao-badge {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 36px;
  padding: 0 6px;
  background-color: rgba(4, 41, 106, 0.85);
  backdrop-filter: blur(8px);
  border-left: 1px solid var(--azul-escuro);
  border-bottom: 1px solid var(--azul-escuro);
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
  z-index: 2;
  transition: color 0.3s linear, background-color 0.4s ease;
}

.posicao-badge.top-3 {
  background-color: #fff;
  color: var(--azul-escuro);
  border-left-color: #fff;
  border-bottom-color: #fff;
  box-shadow: 0 0 14px rgba(255, 255, 255, 0.45);
}

.tag-avaliado {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background-color: rgba(4, 41, 106, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  z-index: 2;
}

.capa-wrapper {
  position: relative;
  isolation: isolate;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-bottom: 1px solid var(--azul-escuro);
  background-color: rgba(0, 0, 0, 0.2);
}

.media-card.is-centralizado .capa-wrapper {
  border: 1px solid var(--azul-escuro);
}

.capa-wrapper::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 45%;
  background: linear-gradient(to top, rgba(4, 41, 106, 0.85), transparent);
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.4s ease;
}

.media-card:hover .capa-wrapper::after {
  opacity: 0.6;
}

.capa-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 40%,
    rgba(255, 255, 255, 0.18) 50%,
    transparent 60%
  );
  transform: translateX(-120%);
  z-index: 2;
  pointer-events: none;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.media-card:hover .capa-wrapper::before {
  transform: translateX(120%);
}

.capa-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), filter 0.3s linear;
}

.media-card:hover .capa-img {
  transform: scale(1.06);
  filter: brightness(1.08);
}

.capa-vazia {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.04) 0 10px,
    transparent 10px 20px
  );
}

.sem-capa-texto {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.info-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  gap: 12px;
  padding: 14px 16px 16px;
  width: 100%;
  box-sizing: border-box;
}

.media-card.is-centralizado .info-card {
  padding: 0;
  gap: 6px;
  align-items: center;
}

.titulo-card {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1.45;
  transition: color 0.3s ease, transform 0.3s ease;
}

.media-card:not(.is-centralizado) .titulo-card {
  min-height: 2.8em;
}

.media-card:hover .titulo-card {
  color: #fff;
}

.media-card:not(.is-centralizado):hover .titulo-card {
  transform: translateX(4px);
}

.subtitulo-card {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.rodape-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.nota {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.35));
}

.icone-estrela {
  width: 14px;
  height: 14px;
  fill: currentColor;
  transition: transform 0.3s ease;
}

.media-card:hover .icone-estrela {
  transform: rotate(72deg) scale(1.15);
}

@media screen and (max-width: 768px) {
  .info-card {
    padding: 12px;
  }

  .titulo-card {
    font-size: 0.68rem;
    letter-spacing: 0.06em;
  }

  .media-card:hover {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .media-card,
  .capa-img,
  .capa-wrapper::before,
  .capa-wrapper::after,
  .icone-estrela
  .shimmer {
    transition: none !important;
    animation: none !important;
  }
}
</style>