import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export interface TokenPayload {
  user_id: number | string;
  email?: string;
  first_name?: string;
  exp?: number;
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const dadosToken = ref<TokenPayload | null>(null);
  const perfilCache = ref<{ first_name?: string; email?: string }>({});

  function descodificarToken(jwt: string): TokenPayload | null {
    try {
      if (!jwt || typeof jwt !== 'string') return null;

      const partes = jwt.split('.');
      const payloadBase64 = partes[1];
      if (partes.length !== 3 || !payloadBase64) return null;

      let payload = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      payload += '='.repeat((4 - (payload.length % 4)) % 4);

      const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
      const dados = JSON.parse(new TextDecoder().decode(bytes));

      if (!dados || typeof dados !== 'object') return null;
      if (dados.user_id === undefined || dados.user_id === null || dados.user_id === '') {
        return null;
      }

      return dados as TokenPayload;
    } catch (erro) {
      console.error('Falha de segurança: Token adulterado ou inválido.', erro);
      return null;
    }
  }

  function limparSessao() {
    token.value = null;
    dadosToken.value = null;
    perfilCache.value = {};
    localStorage.removeItem('token');
    localStorage.removeItem('perfil_cache');
  }

  function sincronizarSessao(): boolean {
    try {
      const tokenSalvo = localStorage.getItem('token');
      if (!tokenSalvo || typeof tokenSalvo !== 'string') {
        limparSessao();
        return false;
      }

      const decodificado = descodificarToken(tokenSalvo);
      // Verifica se o token é válido e se não está expirado
      if (!decodificado || !decodificado.exp || decodificado.exp * 1000 < Date.now()) {
        limparSessao();
        return false;
      }

      token.value = tokenSalvo;
      dadosToken.value = decodificado;

      const cacheSalvo = JSON.parse(localStorage.getItem('perfil_cache') || '{}');
      perfilCache.value = cacheSalvo && typeof cacheSalvo === 'object' ? cacheSalvo : {};
      return true;
    } catch {
      limparSessao();
      return false;
    }
  }

  function salvarLogin(novoToken: string) {
    localStorage.setItem('token', novoToken);
    localStorage.removeItem('perfil_cache');
    sincronizarSessao();
  }

  function atualizarCachePerfil(dados: { first_name: string; email: string }) {
    perfilCache.value = {
      first_name: dados.first_name,
      email: dados.email
    };
    localStorage.setItem('perfil_cache', JSON.stringify(perfilCache.value));
  }

  const estaAutenticado = computed(() => Boolean(token.value && dadosToken.value));

  const userId = computed(() => {
    if (!dadosToken.value) return null;
    return Number(dadosToken.value.user_id);
  });

  const emailUsuario = computed(() => {
    if (!dadosToken.value) return '';
    return perfilCache.value.email || dadosToken.value.email || '';
  });

  const primeiroNome = computed(() => {
    if (!dadosToken.value) return '';
    return (
      perfilCache.value.first_name ||
      dadosToken.value.first_name ||
      (emailUsuario.value ? emailUsuario.value.split('@')[0] : '')
    );
  });

  const nomeExibicao = computed(() => {
    if (!estaAutenticado.value) return 'Visitante';
    return primeiroNome.value || 'Utilizador';
  });

  function obterCabecalhosAutenticados(): Record<string, string> | null {
    if (!sincronizarSessao() || !token.value) {
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.value}`
    };
  }

  // Inicializa ao carregar a store e escuta alterações de outras abas
  sincronizarSessao();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (evento) => {
      if (evento.key === 'token' || evento.key === 'perfil_cache' || evento.key === null) {
        sincronizarSessao();
      }
    });
  }

  return {
    token,
    dadosToken,
    estaAutenticado,
    userId,
    emailUsuario,
    primeiroNome,
    nomeExibicao,
    sincronizarSessao,
    salvarLogin,
    atualizarCachePerfil,
    limparSessao,
    obterCabecalhosAutenticados
  };
});