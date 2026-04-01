import { signInAnonymously } from "firebase/auth";
import { auth } from "@/services/firebase";

export default defineNuxtPlugin(async () => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
});
