"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const HARDCODED_USER = {
  id:    "test-user-id",
  email: "test@gmail.com",
  name:  "Test",
};

export async function signIn(email: string, password: string) {
  if (email === HARDCODED_USER.email && password.length > 0) {
    const cookieStore = await cookies();
    cookieStore.set("auth_session", "authenticated", { path: "/", httpOnly: true });
    return { error: null };
  }
  return { error: "Invalid email or password" };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}

export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session");
  if (!session) return null;
  return HARDCODED_USER;
}

// stub — not used in hardcoded mode
export async function signUp(_email: string, _password: string, _fullName: string) {
  return { error: null };
}
