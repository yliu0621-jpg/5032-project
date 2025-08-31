import { createRouter, createWebHistory } from "vue-router";
import RegisterForm from "../components/RegisterForm.vue";
import DisplayDataPage from "../components/DisplayDataPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "register",
      component: RegisterForm,
    },
    {
      path: "/display-data",
      name: "display-data",
      component: DisplayDataPage,
    },
  ],
});

export default router;
