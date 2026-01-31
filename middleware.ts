import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const role = token?.role as string;

        // Admin Routes
        if (path.startsWith("/dashboard/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Commissioner Routes
        if (path.startsWith("/dashboard/commissioner") && role !== "commissioner" && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Developer Routes
        if (path.startsWith("/dashboard/developer") && role !== "developer" && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Client Routes
        if (path.startsWith("/dashboard/client") && role !== "client" && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
