<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { movieService } from '../../services/movieService';

const emit = defineEmits(['logout']);
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authStore = useAuthStore();

const editando = ref(false);
const confirmandoExclusao = ref(false);
const senhaExclusao = ref('');
const carregando = ref(false);
const mensagem = ref({ texto: '', tipo: '' });
const avaliacoes = ref([]);
const mostrarTodasAvaliacoes = ref(false);

const formulario = ref({ first_name: '', email: '', password: '', confirmar_senha: '' });

const avaliacoesExibidas = computed(() => {
  return mostrarTodasAvaliacoes.value ? avaliacoes.value : avaliacoes.value.slice(0, 5);
});

onMounted(async () => {
  if (authStore.userId && authStore.token) {
    avaliacoes.value = await movieService.buscarFilmesAvaliadosPorUsuario(authStore.userId, authStore.token);
  }
});

function renderEstrelas(nota) {
  const notaSegura = Math.min(5, Math.max(0, Number(nota) || 0));
  return '★'.repeat(notaSegura) + '☆'.repeat(5 - notaSegura);
}

function alternarEdicao() {
  editando.value = !editando.value;
  confirmandoExclusao.value = false;
  senhaExclusao.value = '';
  mensagem.value = { texto: '', tipo: '' };

  if (editando.value) {
    formulario.value = { first_name: authStore.primeiroNome, email: authStore.emailUsuario, password: '', confirmar_senha: '' };
  }
}

async function atualizarConta() {
  const headers = authStore.obterCabecalhosAutenticados();
  if (!headers) return;

  const novoNome = formulario.value.first_name.trim();
  const novoEmail = formulario.value.email.trim();
  const novaSenha = formulario.value.password;
  
  if (novaSenha && novaSenha !== formulario.value.confirmar_senha) {
    mensagem.value = { texto: 'A confirmação de senha não coincide.', tipo: 'erro' };
    return;
  }

  carregando.value = true;
  mensagem.value = { texto: '', tipo: '' };

  try {
    const resposta = await fetch(`${API}/users/${authStore.userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ first_name: novoNome || authStore.primeiroNome, email: novoEmail || authStore.emailUsuario, password: novaSenha || '' })
    });

    if (resposta.status === 401) return fazerLogout('Sua sessão expirou.', 'erro');
    if (!resposta.ok) throw new Error((await resposta.json().catch(() => ({}))).erro || 'Erro ao atualizar.');

    authStore.atualizarCachePerfil({ first_name: novoNome || authStore.primeiroNome, email: novoEmail || authStore.emailUsuario });
    editando.value = false;
    mensagem.value = { texto: 'Dados atualizados!', tipo: 'sucesso' };
  } catch (erro) {
    mensagem.value = { texto: erro.message, tipo: 'erro' };
  } finally {
    carregando.value = false;
  }
}

async function excluirConta() {
  if (!senhaExclusao.value) {
    mensagem.value = { texto: 'Digite sua senha.', tipo: 'erro' };
    return;
  }

  const headers = authStore.obterCabecalhosAutenticados();
  if (!headers) return;

  carregando.value = true;
  try {
    const resposta = await fetch(`${API}/users/${authStore.userId}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ email: authStore.emailUsuario, password: senhaExclusao.value })
    });

    if (resposta.status === 401) throw new Error('Senha incorreta.');
    if (!resposta.ok) throw new Error('Erro ao excluir conta.');

    fazerLogout('Conta excluída com sucesso.', 'sucesso');
  } catch (erro) {
    mensagem.value = { texto: erro.message, tipo: 'erro' };
  } finally {
    carregando.value = false;
    senhaExclusao.value = '';
  }
}

function fazerLogout(texto = 'Sessão encerrada.', tipo = 'sucesso') {
  authStore.limparSessao();
  emit('logout');
}
</script>

<template>
  <div class="auth-card perfil-card">
    <div class="perfil-header">
      <div class="perfil-identidade">
        <div class="avatar">
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div>
          <h2 class="perfil-nome">{{ authStore.primeiroNome }}</h2>
          <p class="perfil-status">{{ authStore.emailUsuario }}</p>
        </div>
      </div>
      <button type="button" class="btn-logout-compacto" @click="fazerLogout()" :disabled="carregando">Sair</button>
    </div>

    <div class="perfil-conteudo">
      <template v-if="editando">
        <h3>Editar Perfil</h3>
        <form @submit.prevent="atualizarConta" class="form-auth">
          <div class="campo"><label>Nome</label><input type="text" v-model="formulario.first_name" :disabled="carregando" /></div>
          <div class="campo"><label>E-mail</label><input type="email" v-model="formulario.email" :disabled="carregando" /></div>
          <div class="campo"><label>Nova senha</label><input type="password" v-model="formulario.password" :disabled="carregando" /></div>
          <div class="campo"><label>Confirmar</label><input type="password" v-model="formulario.confirmar_senha" :disabled="carregando" /></div>
          <button type="submit" class="btn-principal" :disabled="carregando">Salvar Alterações</button>
        </form>
        
        <div class="zona-exclusao">
          <button v-if="!confirmandoExclusao" type="button" class="btn-link btn-link-perigo" @click="confirmandoExclusao = true" :disabled="carregando">Excluir conta</button>
          <form v-else @submit.prevent="excluirConta" class="box-confirmar-exclusao">
            <p class="subtitulo-exclusao">Digite a senha para confirmar:</p>
            <div class="campo"><input type="password" v-model="senhaExclusao" :disabled="carregando" /></div>
            <div class="acoes-exclusao">
              <button type="submit" class="btn-principal btn-perigo" :disabled="carregando">Confirmar Exclusão</button>
              <button type="button" class="btn-link" @click="confirmandoExclusao = false" :disabled="carregando">Cancelar</button>
            </div>
          </form>
        </div>
        <div class="alternar-modo"><button type="button" class="btn-link" @click="alternarEdicao" :disabled="carregando">Voltar ao perfil</button></div>
      </template>

      <template v-else>
        <h3>Meus Filmes Avaliados</h3>
        <p v-if="avaliacoes.length === 0" class="sem-avaliacoes">Nenhuma avaliação.</p>
        <ul v-else class="lista-avaliacoes">
          <li v-for="item in avaliacoesExibidas" :key="item.id" class="item-avaliacao">
            <img :src="item.poster_url" :alt="item.title" class="mini-capa" />
            <div class="detalhes-avaliacao">
              <strong>{{ item.title }}</strong>
              <span class="estrelas-perfil">{{ renderEstrelas(item.rating) }}</span>
            </div>
          </li>
        </ul>
        <div v-if="avaliacoes.length > 5" class="ver-todas-wrapper">
          <button type="button" class="btn-link" @click="mostrarTodasAvaliacoes = !mostrarTodasAvaliacoes">
            {{ mostrarTodasAvaliacoes ? 'Mostrar 5 recentes' : `Ver todas (${avaliacoes.length})` }}
          </button>
        </div>
        <div class="alternar-modo"><button type="button" class="btn-link" @click="alternarEdicao" :disabled="carregando">Editar perfil</button></div>
      </template>
      <p v-if="mensagem.texto" class="alerta" :class="mensagem.tipo === 'erro' ? 'alerta-erro' : 'alerta-sucesso'">{{ mensagem.texto }}</p>
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 36px 32px;
  box-sizing: border-box;
  background-color: var(--superficie, #fff);
  border: 1px solid var(--azul-escuro);
  box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
  transition: box-shadow 0.6s ease;
}

.perfil-card {
  max-width: 560px;
  padding: 0;
}

.perfil-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 32px;
  background-color: var(--azul);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--azul-escuro);
  transition: background-color 0.6s ease;
}

.perfil-header::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.perfil-card:hover .perfil-header {
  background-color: var(--azul-escuro);
}

.perfil-identidade {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  color: rgba(255, 255, 255, 0.72);
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
  transition:
    color 0.3s linear,
    transform 0.3s linear,
    filter 0.3s linear;
}

.perfil-card:hover .avatar {
  color: #fff;
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.perfil-nome {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-align: left;
}

.perfil-status {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.btn-logout-compacto {
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background-color: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0 20px;
  height: 42px;
  transition: 0.3s ease;
}

.btn-logout-compacto:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-color: #fff;
}

.perfil-conteudo {
  padding: 32px;
}

.form-auth {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: var(--azul-escuro);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

input {
  appearance: none;
  outline: none;
  height: 54px;
  padding: 0 18px;
  border: 1px solid var(--azul-escuro);
  transition: 0.3s ease;
}

.btn-principal {
  background-color: var(--azul);
  color: rgba(255, 255, 255, 0.72);
  height: 54px;
  border: 1px solid var(--azul-escuro);
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: 0.3s ease;
}

.btn-principal:hover:not(:disabled) {
  background-color: var(--azul-escuro);
  color: #fff;
}

.btn-perigo {
  background-color: var(--azul-escuro);
  color: #fff;
}

.lista-avaliacoes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.item-avaliacao {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 12px 24px;
  background-color: var(--azul);
  border: 1px solid var(--azul-escuro);
  transition: 0.6s ease;
}

.item-avaliacao::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transition: 0.3s ease;
}

.item-avaliacao:hover {
  background-color: var(--azul-escuro);
}

.item-avaliacao:hover::before {
  transform: scaleY(1);
}

.mini-capa {
  width: 44px;
  height: 66px;
  object-fit: cover;
  border: 1px solid var(--azul-escuro);
  transition: 0.3s linear;
}

.item-avaliacao:hover .mini-capa {
  transform: scale(1.08);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.detalhes-avaliacao {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detalhes-avaliacao strong {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  transition: 0.4s;
}

.item-avaliacao:hover .detalhes-avaliacao strong {
  color: #fff;
  transform: translateX(6px);
}

.estrelas-perfil {
  color: #fff;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.zona-exclusao {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--azul-escuro);
}

.box-confirmar-exclusao {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 24px;
  background-color: var(--azul-escuro);
  border: 1px solid var(--azul);
}

.subtitulo-exclusao {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.alternar-modo {
  margin-top: 28px;
}

.btn-link-perigo {
  color: var(--azul-escuro);
}

@media screen and (max-width: 768px) {
  .perfil-header,
  .perfil-conteudo {
    padding: 24px 20px;
  }
}
</style>
