import { createAuthClient  } from "better-auth/client";

export const authClient = createAuthClient({
  // Using relative path so it works in both dev and prod
  baseURL: "/api/auth",
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


