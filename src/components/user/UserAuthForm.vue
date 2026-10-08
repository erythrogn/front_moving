<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits(['login-sucesso']);
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authStore = useAuthStore();

const modoLogin = ref(true);
const carregando = ref(false);
const mensagem = ref({ texto: '', tipo: '' });

const formulario = ref({
  first_name: '',
  email: '',
  password: '',
  confirmar_senha: ''
});

function limparFormulario() {
  formulario.value = { first_name: '', email: '', password: '', confirmar_senha: '' };
}

function alternarModo() {
  modoLogin.value = !modoLogin.value;
  mensagem.value = { texto: '', tipo: '' };
  limparFormulario();
}

async function submeterFormulario() {
  const emailLimpo = formulario.value.email.trim();
  const nomeLimpo = formulario.value.first_name.trim();

  if (!emailLimpo || !formulario.value.password) {
    mensagem.value = { texto: 'Preencha os campos obrigatórios.', tipo: 'erro' };
    return;
  }

  if (!modoLogin.value) {
    if (!nomeLimpo) {
      mensagem.value = { texto: 'O nome é obrigatório para cadastro.', tipo: 'erro' };
      return;
    }
    if (formulario.value.password !== formulario.value.confirmar_senha) {
      mensagem.value = { texto: 'As senhas digitadas não coincidem.', tipo: 'erro' };
      return;
    }
  }

  carregando.value = true;
  mensagem.value = { texto: '', tipo: '' };

  const url = modoLogin.value ? `${API}/login` : `${API}/users`;
  const corpo = modoLogin.value
    ? { email: emailLimpo, password: formulario.value.password }
    : { first_name: nomeLimpo, email: emailLimpo, password: formulario.value.password };

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) throw new Error(dados.erro || 'Ocorreu um erro na requisição.');

    if (modoLogin.value) {
      authStore.salvarLogin(dados.token);
      limparFormulario();
      mensagem.value = { texto: 'Login realizado com sucesso!', tipo: 'sucesso' };
      setTimeout(() => emit('login-sucesso'), 800);
    } else {
      mensagem.value = { texto: 'Cadastro realizado! Faça login para continuar.', tipo: 'sucesso' };
      modoLogin.value = true;
      formulario.value.password = '';
      formulario.value.confirmar_senha = '';
    }
  } catch (erro) {
    mensagem.value = { texto: erro.message, tipo: 'erro' };
  } finally {
    carregando.value = false;
  }
}
</script>

<template>
  <div class="auth-card">
    <h2>{{ modoLogin ? 'Acessar Conta' : 'Criar Conta' }}</h2>
    <p class="subtitulo">{{ modoLogin ? 'Insira suas credenciais para continuar.' : 'Preencha os dados para se registrar.' }}</p>

    <form @submit.prevent="submeterFormulario" class="form-auth">
      <div v-if="!modoLogin" class="campo">
        <label for="first_name">Nome</label>
        <input id="first_name" type="text" v-model="formulario.first_name" placeholder="Seu nome completo" :disabled="carregando" />
      </div>

      <div class="campo">
        <label for="email">E-mail</label>
        <input id="email" type="email" v-model="formulario.email" placeholder="exemplo@email.com" :disabled="carregando" />
      </div>

      <div class="campo">
        <label for="password">Senha</label>
        <input id="password" type="password" v-model="formulario.password" placeholder="Sua senha" :disabled="carregando" />
      </div>

      <div v-if="!modoLogin" class="campo">
        <label for="confirmar_senha">Confirmar senha</label>
        <input id="confirmar_senha" type="password" v-model="formulario.confirmar_senha" placeholder="Repita sua senha" :disabled="carregando" />
      </div>

      <button type="submit" class="btn-principal" :disabled="carregando">
        {{ carregando ? 'Processando...' : (modoLogin ? 'Entrar' : 'Cadastrar') }}
      </button>
    </form>

    <div class="alternar-modo">
      <p>
        {{ modoLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?' }}
        <button type="button" class="btn-link" @click="alternarModo" :disabled="carregando">
          {{ modoLogin ? 'Cadastre-se' : 'Faça Login' }}
        </button>
      </p>
    </div>

    <p v-if="mensagem.texto" class="alerta" :class="mensagem.tipo === 'erro' ? 'alerta-erro' : 'alerta-sucesso'" role="alert">
      {{ mensagem.texto }}
    </p>
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

  .auth-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 15%;
    height: 70%;
    width: 3px;
    background-color: var(--azul);
    box-shadow: 0 0 10px rgba(4, 41, 106, 0.35);
  }

  .auth-card:hover {
    box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
  }

  h2 {
    margin: 0 0 8px;
    color: var(--azul-escuro);
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .subtitulo {
    margin: 0 0 28px;
    color: var(--texto-suave, #555);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
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
    font-family: inherit;
    height: 54px;
    width: 100%;
    padding: 0 18px;
    box-sizing: border-box;
    background-color: var(--fundo, #fff);
    border: 1px solid var(--azul-escuro);
    color: var(--texto, #111);
    font-size: 0.85rem;
    transition: background-color 0.3s ease, box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }

  input:focus {
    box-shadow: 5px 0 20px rgba(4, 41, 106, 0.25);
  }

  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-principal {
    appearance: none;
    border: 1px solid var(--azul-escuro);
    outline: none;
    font-family: inherit;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 54px;
    width: 100%;
    margin-top: 8px;
    padding: 0 28px;
    box-sizing: border-box;
    background-color: var(--azul);
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 5px 0 30px rgba(4, 41, 106, 0.35);
    transition: background-color 0.6s ease, color 0.3s linear, box-shadow 0.6s ease;
  }

  .btn-principal::before {
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

  .btn-principal:hover:not(:disabled) {
    background-color: var(--azul-escuro);
    color: #fff;
    box-shadow: 15px 0 50px rgba(4, 41, 106, 0.5);
  }

  .btn-principal:hover:not(:disabled)::before {
    transform: scaleY(1);
  }

  .btn-principal:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .alternar-modo {
    margin-top: 28px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--texto-suave, #555);
  }

  @media screen and (max-width: 768px) {
    .auth-card {
      padding: 28px 20px;
    }
  }
</style>

