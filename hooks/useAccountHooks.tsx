import { RegisterFormType } from "@/schema/loginSchema";
import { MMKV, createMMKV } from "react-native-mmkv";
import { useState } from "react";
import { addOrUpdateProfile } from "@/utils/localProfiles";

type LocalUser = {
  id: string;
  email: string;
  password: string;
};

const storage = createMMKV({ id: "kabayan-auth" });

const getUsers = (): LocalUser[] => {
  const raw = storage.getString("users");
  return raw ? JSON.parse(raw) : [];
};

const saveUsers = (users: LocalUser[]) => {
  storage.set("users", JSON.stringify(users));
};

const setCurrentUserId = (id: string | null) => {
  if (id) {
    storage.set("currentUser", id);
  } else {
    storage.remove("currentUser");
  }
};

type AccountError = { message: string } | null;

export default function useAccount() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState<AccountError>(null);

  const findUser = (email: string, password?: string) => {
    const users = getUsers();
    return users.find((user) => user.email === email && (!password || user.password === password));
  };

  const SignInWithPassword = async ({ email, password }: RegisterFormType) => {
    try {
      const user = findUser(email, password);
      if (!user) {
        setError({ message: "Invalid credentials" });
        return;
      }
      setCurrentUserId(user.id);
      setData({ user });
      setError(null);
    } catch (err) {
      setError({ message: "Unable to sign in" });
    }
  };

  const SignUpWithEmailAndPassword = async ({ email, password }: RegisterFormType) => {
    try {
      if (findUser(email)) {
        setError({ message: "Email already registered" });
        return;
      }
      const users = getUsers();
      const newUser: LocalUser = {
        id: Math.random().toString(36).slice(2),
        email,
        password,
      };
      users.push(newUser);
      saveUsers(users);
      setCurrentUserId(newUser.id);
      setData({ user: newUser });
      setError(null);
      addOrUpdateProfile({
        user_id: newUser.id,
        display_name: email.split("@")[0],
        job_role: "worker",
        location_label: "Philippines",
        avatar_url: null,
        id_verification_status: "unverified",
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError({ message: "Unable to sign up" });
    }
  };

  const ResetEmailPassword = async ({ email }: RegisterFormType) => {
    try {
      const user = findUser(email);
      if (!user) {
        setError({ message: "Email not found" });
        return;
      }
      setError(null);
      setData({ message: "Password reset instructions would be sent here." });
    } catch (err) {
      setError({ message: "Could not reset password" });
    }
  };

  const SignOut = async () => {
    setCurrentUserId(null);
    setData(null);
    setError(null);
  };

  const Resend = async ({ email }: RegisterFormType) => {
    try {
      const user = findUser(email);
      if (!user) {
        setError({ message: "Email not found" });
        return;
      }
      setError(null);
      setData({ message: "Verification link resent" });
    } catch (err) {
      setError({ message: "Resend failed" });
    }
  };

    return {
        Resend,
        setData,
        setError,
        SignOut,
        ResetEmailPassword,
        SignUpWithEmailAndPassword,
        SignInWithPassword,
        data,
        error,
    };
}

export const getCurrentUserId = () => storage.getString("currentUser") ?? null;

export const getCurrentUser = () => {
  const id = getCurrentUserId();
  if (!id) return null;
  const users = getUsers();
  return users.find((user) => user.id === id) ?? null;
};
