export default {
  providers: [
    {
      // Clerk Issuer Domain for JWT validation
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://delicate-man-63.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
