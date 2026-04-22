import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const AUTH_PATHS = new Set([
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

function isOnboardingPath(pathname: string) {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

function isPublicPath(pathname: string) {
  if (AUTH_PATHS.has(pathname)) return true;
  if (pathname === "/events" || pathname.startsWith("/events/")) return true;
  return false;
}

function requiresOnboardingResolution(pathname: string) {
  if (pathname.startsWith("/auth/")) return true;
  if (isOnboardingPath(pathname)) return true;
  if (pathname === "/events" || pathname.startsWith("/events/")) return false;
  return true;
}

function getSafeRelativePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const isAuthenticated = !!req.auth;

  if (!isAuthenticated && !isPublicPath(pathname)) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (!isAuthenticated) {
    return NextResponse.next();
  }

  if (!requiresOnboardingResolution(pathname)) {
    return NextResponse.next();
  }

  const authContext = req.auth as
    | {
        user?: {
          id?: string;
          onboardingCompleted?: boolean;
        };
        onboardingCompleted?: boolean;
        token?: { onboardingCompleted?: boolean };
      }
    | undefined;

  const onboardingCompleted =
    authContext?.user?.onboardingCompleted ??
    authContext?.onboardingCompleted ??
    authContext?.token?.onboardingCompleted ??
    true;

  if (pathname.startsWith("/auth/")) {
    if (onboardingCompleted === false) {
      const target = new URL("/onboarding/step/1", req.url);
      const callbackUrl = getSafeRelativePath(req.nextUrl.searchParams.get("callbackUrl"));
      if (callbackUrl && !isOnboardingPath(callbackUrl)) {
        target.searchParams.set("returnTo", callbackUrl);
      }
      return NextResponse.redirect(target);
    }

    const callbackUrl = getSafeRelativePath(req.nextUrl.searchParams.get("callbackUrl"));
    if (callbackUrl && !isOnboardingPath(callbackUrl)) {
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    onboardingCompleted === false &&
    !isOnboardingPath(pathname) &&
    !pathname.startsWith("/events/") &&
    pathname !== "/events"
  ) {
    const onboardingUrl = new URL("/onboarding/step/1", req.url);
    onboardingUrl.searchParams.set("returnTo", `${pathname}${search}`);
    return NextResponse.redirect(onboardingUrl);
  }

  if (onboardingCompleted === true && isOnboardingPath(pathname)) {
    const returnTo = getSafeRelativePath(req.nextUrl.searchParams.get("returnTo"));
    const safeReturnTo = returnTo && !isOnboardingPath(returnTo) ? returnTo : "/dashboard";
    return NextResponse.redirect(new URL(safeReturnTo, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|simple-test).*)"],
};
