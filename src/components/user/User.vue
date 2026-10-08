<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import UserAuthForm from './UserAuthForm.vue';
import UserProfile from './UserProfile.vue';

const emit = defineEmits(['login-sucesso']);
const authStore = useAuthStore();

onMounted(() => {
  authStore.sincronizarSessao();
});
</script>

<template>
  <section class="auth-container">
    <UserProfile v-if="authStore.estaAutenticado" @logout="authStore.sincronizarSessao" />
    <UserAuthForm v-else @login-sucesso="emit('login-sucesso')" />
  </section>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  min-height: calc(100vh - 80px);
}
</style>
