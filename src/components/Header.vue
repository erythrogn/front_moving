<script setup>
defineProps({
  paginaAtual: {
    type: String,
    default: 'home'
  }
});

const emit = defineEmits(['navegar']);

function navegar(pagina) {
  emit('navegar', pagina);
}
</script>

<template>
  <aside class="sidebar-magic" id="navbar">
    <nav class="nav-tree">
      
      <!-- INÍCIO -->
      <button 
        @click="navegar('home')" 
        class="tree-branch" 
        :class="{ active: paginaAtual === 'home' }" 
        aria-label="Início"
      >
        <span class="branch-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </span>
        <span class="branch-text">Início</span>
      </button>

      <!-- FILMES -->
      <button 
        @click="navegar('filmes')" 
        class="tree-branch" 
        :class="{ active: paginaAtual === 'filmes' }" 
        aria-label="Filmes"
      >
        <span class="branch-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
        </span>
        <span class="branch-text">Filmes</span>
      </button>

      <!-- ATORES -->
      <button 
        @click="navegar('atores')" 
        class="tree-branch" 
        :class="{ active: paginaAtual === 'atores' }" 
        aria-label="Atores"
      >
        <span class="branch-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </span>
        <span class="branch-text">Atores</span>
      </button>

      <!-- PERFIL -->
      <button 
        @click="navegar('perfil')" 
        class="tree-branch" 
        :class="{ active: paginaAtual === 'perfil' }" 
        aria-label="Perfil"
      >
        <span class="branch-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <span class="branch-text">Perfil</span>
      </button>

    </nav>
  </aside>
</template>

<style scoped>
.sidebar-magic {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 80px;
  background-color: var(--azul); 
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid var(--azul-escuro);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35); 
  transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.6s ease, box-shadow 0.6s ease;
}

.sidebar-magic:hover {
  width: 260px;
  background-color: var(--azul-escuro); 
  box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
}

.nav-tree {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.tree-branch {
  appearance: none;
  border: none;
  outline: none;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 54px;
  width: 100%;
  position: relative;
  cursor: pointer;
  padding: 0 28px;
  box-sizing: border-box;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.tree-branch::before {
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

.tree-branch:hover::before,
.tree-branch.active::before {
  transform: scaleY(1);
}

.tree-branch:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.branch-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.72); 
  flex-shrink: 0;
  transition: color 0.3s linear, transform 0.3s linear, filter 0.3s linear;
}

.tree-branch:hover .branch-icon,
.tree-branch.active .branch-icon {
  color: #fff;
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.branch-text {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72); 
  margin-left: 1.8rem;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-15px);
  transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), color 0.4s;
}

.sidebar-magic:hover .branch-text {
  opacity: 1;
  transform: translateX(0);
}

.tree-branch:hover .branch-text,
.tree-branch.active .branch-text {
  color: #fff; 
}

.tree-branch:nth-child(1) .branch-text { transition-delay: 0.05s; }
.tree-branch:nth-child(2) .branch-text { transition-delay: 0.10s; }
.tree-branch:nth-child(3) .branch-text { transition-delay: 0.15s; }
.tree-branch:nth-child(4) .branch-text { transition-delay: 0.20s; }

.sidebar-magic:not(:hover) .branch-text {
  transition-delay: 0s;
  transition-duration: 0.2s;
}

@media screen and (max-width: 768px) {
  .sidebar-magic {
    top: auto;
    bottom: 0;
    width: 100%;
    height: 70px;
    border-right: none;
    border-top: 1px solid var(--azul-escuro);
    flex-direction: row;
    align-items: center;
    box-shadow: 0 -4px 16px rgba(4, 41, 106, 0.2);
  }
  
  .sidebar-magic:hover {
    width: 100%;
    background-color: var(--azul);
  }
  
  .nav-tree {
    flex-direction: row;
    justify-content: space-around;
  }
  
  .tree-branch {
    flex-direction: column;
    justify-content: center;
    padding: 0;
  }
  
  .tree-branch::before {
    top: 0;
    left: 20%;
    height: 3px;
    width: 60%;
    transform: scaleX(0);
  }
  
  .tree-branch:hover::before,
  .tree-branch.active::before {
    transform: scaleX(1);
  }
  
  .branch-text {
    display: none;
  }
}
</style>