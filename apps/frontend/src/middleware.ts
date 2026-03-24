import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  role: string;
  isApproved: boolean;
  sub: string;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isRecruiterDashboard = request.nextUrl.pathname.startsWith("/dashboard/recruteur");
  const isPendingPage = request.nextUrl.pathname === "/dashboard/recruteur/en-attente";

  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      
      // Handle recruiter approval
      if (decoded.role === "RECRUITER") {
        if (!decoded.isApproved && isRecruiterDashboard && !isPendingPage) {
          return NextResponse.redirect(new URL("/dashboard/recruteur/en-attente", request.url));
        }
        if (decoded.isApproved && isPendingPage) {
           return NextResponse.redirect(new URL("/dashboard/recruteur", request.url));
        }
      }
    } catch (error) {
       console.error("Middleware error:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
