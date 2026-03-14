import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/onboarding"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks/(.*)"]);
const isAuthRoute = createRouteMatcher(["/login", "/signup"]);
const isRootRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  if (isWebhookRoute(req)) return NextResponse.next();

  const { userId } = await auth();

  if (isProtectedRoute(req)) await auth.protect();

  if (userId && (isAuthRoute(req) || isRootRoute(req))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
