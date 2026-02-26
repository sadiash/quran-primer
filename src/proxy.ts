import { clerkMiddleware } from "@clerk/nextjs/server";

// All routes are public by default. Clerk still tracks session state,
// so SignedIn/SignedOut components work — but no route forces a login.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
