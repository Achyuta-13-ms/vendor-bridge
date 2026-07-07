import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Check if user is authenticated
      if (!token) return false;

      console.log(`[Middleware] Route: ${req.nextUrl.pathname} | Token Role: ${token.role}`);

      // Check role for admin routes
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token.role === "ADMIN";
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/enterprise/:path*",
    "/admin/:path*",
  ],
};
