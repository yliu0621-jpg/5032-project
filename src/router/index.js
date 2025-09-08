import { createRouter, createWebHistory } from "vue-router";
import DisplayDataPage from "../components/DisplayDataPage.vue";
import AuthView from "@/views/AuthView.vue";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/display-data",
      name: "display-data",
      component: DisplayDataPage,
    },
    {
      path: "/login",
      name: "login",
      component: AuthView,
      props: () => ({ formType: 'login' })
    },
    {
      path: "/register",
      name: "register",
      component: AuthView,
      props: () => ({ formType: 'register' })
    },
  ],
});

export default router;
