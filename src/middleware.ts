import { defineMiddleware } from "astro:middleware";
import { isAdminRequest } from "./lib/admin-auth";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.isAdmin = await isAdminRequest(
    context.request,
    context.locals.runtime.env.AUTH_SECRET
  );
  return next();
});
