import { createRouter, createWebHistory } from "vue-router";
import DisplayDataPage from "../components/DisplayDataPage.vue";
import AuthView from "@/views/AuthView.vue";
import HomeView from "@/views/HomeView.vue";
import FeedbackView from "@/views/FeedbackView.vue";
import EmailVerificationView from "@/views/EmailVerificationView.vue";
import MealManagementView from "@/views/MealManagementView.vue";
import UserProfileView from "@/views/UserProfileView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

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
    {
      path: "/logout",
      name: "logout",
      beforeEnter: (to, from, next) => {
        signOut(auth).then(() => {
          next({ name: 'home' });
        })
      }
    },
    {
      path: "/feedback",
      name: "feedback",
      component: FeedbackView,
    },
    {
      path: "/verify-email",
      name: "verify-email",
      component: EmailVerificationView,
    },
    {
      path: "/meal-management",
      name: "meal-management",
      component: MealManagementView,
    },
    {
      path: "/profile",
      name: "profile",
      component: UserProfileView,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

export default router;
