import { createAuthClient  } from "better-auth/client";

export const authClient = createAuthClient({
  // Set the baseURL to the application's origin.
  // Better-auth client will append '/api/auth' by default.
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
});

export const githubSignIn = async () => {
  const res = await authClient.signIn.social({
    provider: "github", // must match the lowercase key in your config
  });
  console.log(res);
};

export const githubSignOut = async () => {
  const res = await authClient.signOut({
    fetchOptions : {
      onSuccess : () => {
        window.location.href = "/";
      },
    },
  });
  console.log(res);
}


