import { createRouter, createWebHistory } from "vue-router";
import RegisterForm from "../components/RegisterForm.vue";
import DisplayDataPage from "../components/DisplayDataPage.vue";
import FirebaseSigninView from "@/views/FirebaseSigninView.vue";

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
    {
      path: "/FireLogin",
      name: "FireLogin",
      component: FirebaseSigninView,
    }
  ],
});

export default router;
