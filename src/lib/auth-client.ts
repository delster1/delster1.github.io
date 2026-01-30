import { createAuthClient  } from "better-auth/client";

export const authClient = createAuthClient({
  // IMPORTANT: Include the full path to the auth route
  baseURL: "http://localhost:4321/api/auth",
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


