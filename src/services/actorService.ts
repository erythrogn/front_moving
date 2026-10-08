import { ref } from 'vue';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fotosCache = ref<Record<string | number, string>>({});
const fotosComErro = ref<Record<string | number, boolean>>({});

const atoresPopulares = ref<any[]>([]);
const carregandoPopulares = ref(false);
const temMaisPopulares = ref(true);

export const actorService = {
  get fotosCache() { return fotosCache.value; },
  get fotosComErro() { return fotosComErro.value; },
  get atoresPopulares() { return atoresPopulares.value; },
  get carregandoPopulares() { return carregandoPopulares.value; },
  get temMaisPopulares() { return temMaisPopulares.value; },

  async carregarAtoresPopulares(pagina = 1, limitePorPagina = 12) {
    if (carregandoPopulares.value) return null;
    
    carregandoPopulares.value = true;
    try {
      const resposta = await fetch(`${API}/actors?page=${pagina}&limit=${limitePorPagina}`);
      if (!resposta.ok) throw new Error('Falha ao carregar atores');
      
      const dados = await resposta.json();
      const novosAtores = Array.isArray(dados) ? dados : (dados.data || []);

      if (novosAtores.length < limitePorPagina) {
        temMaisPopulares.value = false;
      }

      if (pagina === 1) {
        atoresPopulares.value = novosAtores;
      } else {
        const idsExistentes = new Set(atoresPopulares.value.map(a => a.id));
        const atoresFiltrados = novosAtores.filter((a: any) => !idsExistentes.has(a.id));
        
        if (atoresFiltrados.length === 0) {
          temMaisPopulares.value = false; 
        } else {
          atoresPopulares.value = [...atoresPopulares.value, ...atoresFiltrados];
        }
      }
      
      atoresPopulares.value.forEach((ator) => this.buscarFoto(ator));
      return atoresPopulares.value;
    } catch (erro) {
      console.error('Erro ao buscar atores populares:', erro);
      return null;
    } finally {
      carregandoPopulares.value = false;
    }
  },

  async selecionarAtor(id: string | number) {
    try {
      const resposta = await fetch(`${API}/actors/${id}`);
      if (!resposta.ok) throw new Error('Falha ao carregar detalhes do ator');
      const dados = await resposta.json();
      
      if (dados && dados.poster_url) {
        fotosCache.value[dados.id] = dados.poster_url;
      }
      return dados;
    } catch (erro) {
      console.error(`Erro ao buscar detalhes do ator ${id}:`, erro);
      return null;
    }
  },

  async buscarFoto(ator: any) {
    if (!ator || !ator.id) return;
    if (ator.poster_url) {
      fotosCache.value[ator.id] = ator.poster_url;
      return;
    }
    if (fotosCache.value[ator.id] !== undefined) return;

    try {
      const resposta = await fetch(`${API}/actors/${ator.id}`);
      if (!resposta.ok) return;
      const dados = await resposta.json();
      if (dados && dados.poster_url) {
        fotosCache.value[ator.id] = dados.poster_url;
      }
    } catch (erro) {
      console.error(`Erro ao buscar foto do ator ${ator.id}:`, erro);
    }
  },

  obterFoto(ator: any) {
    if (!ator || fotosComErro.value[ator.id]) return null;
    return ator.poster_url || fotosCache.value[ator.id] || null;
  },

  tratarErroFoto(id: string | number, evento?: Event) {
    fotosComErro.value[id] = true;
    if (evento?.target) {
      (evento.target as HTMLElement).style.display = 'none';
    }
  }
};
