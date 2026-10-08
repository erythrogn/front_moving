import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Movie from '../components/movie/Movie.vue'
import Actor from '../components/actor/Actor.vue'
import User from '../components/user/User.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/filmes/:id?',
      name: 'filmes',
      component: Movie,
      props: true
    },
    {
      path: '/atores/:id?',
      name: 'atores',
      component: Actor,
      props: true
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: User
    }
  ]
})

export default router