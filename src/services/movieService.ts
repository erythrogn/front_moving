import { ref } from 'vue';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const capasCache = ref<Record<string | number, string>>({});
const capasComErro = ref<Record<string | number, boolean>>({});

export const movieService = {
  get capasCache() { return capasCache.value; },
  get capasComErro() { return capasComErro.value; },

  async buscarCapa(filme: any) {
    if (!filme || !filme.id) return;
    if (filme.poster_url) {
      capasCache.value[filme.id] = filme.poster_url;
      return;
    }
    if (capasCache.value[filme.id] !== undefined) return;

    try {
      const resposta = await fetch(`${API}/movies/${filme.id}`);
      if (!resposta.ok) return;
      const dados = await resposta.json();
      if (dados && dados.poster_url) {
        capasCache.value[filme.id] = dados.poster_url;
      }
    } catch (erro) {
      console.error(`Erro ao buscar capa do filme ${filme.id}:`, erro);
    }
  },

  obterCapa(filme: any) {
    if (!filme || capasComErro.value[filme.id]) return null;
    return filme.poster_url || capasCache.value[filme.id] || null;
  },

  tratarErroCapa(id: string | number, evento?: Event) {
    capasComErro.value[id] = true;
    if (evento?.target) {
      (evento.target as HTMLElement).style.display = 'none';
    }
  },

  async enviarAvaliacao(params: { movieId: string | number; userId: string | number; rating: number; token: string; jaAvaliou: boolean; }) {
    const { movieId, userId, rating, token, jaAvaliou } = params;
    const url = jaAvaliou
      ? `${API}/reviews/users/${parseInt(userId as string, 10)}/movies/${movieId}`
      : `${API}/reviews`;

    const metodo = jaAvaliou ? 'PUT' : 'POST';

    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        movie_id: movieId,
        user_id: parseInt(userId as string, 10),
        rating: rating
      })
    });

    if (resposta.status === 401) {
      const error = new Error('A sua sessão expirou. Inicie sessão novamente na aba Perfil.');
      (error as any).status = 401;
      throw error;
    }

    if (!resposta.ok) {
      const erroApi = await resposta.json().catch(() => ({}));
      throw new Error(erroApi.erro || erroApi.error || 'Falha ao registar avaliação.');
    }

    return jaAvaliou;
  },

  async buscarFilmesAvaliadosPorUsuario(userId: string | number, token: string) {
    try {
      const resposta = await fetch(`${API}/reviews/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!resposta.ok) return [];

      const avaliacoesData = await resposta.json();
      
      if (!Array.isArray(avaliacoesData)) return [];

      // Buscar detalhes de cada filme avaliado
      const filmesDetalhados = await Promise.all(
        avaliacoesData.map(async (avaliacao) => {
          try {
            const resFilme = await fetch(`${API}/movies/${avaliacao.movie_id}`);
            if (!resFilme.ok) return null;
            const filme = await resFilme.json();
            
            return {
              id: filme.id,
              title: filme.title,
              poster_url: filme.poster_url,
              rating: Number(avaliacao.rating) || 0,
              data: avaliacao.updated_at || avaliacao.created_at || ''
            };
          } catch (e) {
            console.error(`Erro ao buscar detalhes do filme ${avaliacao.movie_id}`, e);
            return null;
          }
        })
      );

      // Filtrar filmes nulos e ordenar por data
      const minhasAvaliacoes = filmesDetalhados.filter(f => f !== null);
      
      minhasAvaliacoes.sort((a, b) => {
        if (a.data && b.data) return new Date(b.data).getTime() - new Date(a.data).getTime();
        return 0;
      });
      
      return minhasAvaliacoes;
    } catch (erro) {
      console.error('Erro ao carregar avaliações do perfil:', erro);
      return [];
    }
  }
};
