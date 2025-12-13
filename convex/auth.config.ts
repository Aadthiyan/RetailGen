const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!issuer) {
    console.error("⚠️ CLERK_JWT_ISSUER_DOMAIN is not set in Convex environment variables!");
    console.error("Run: npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-issuer-url>");
}

export default {
    providers: [
        {
            domain: issuer || "https://placeholder-domain-to-avoid-crash.com",
            applicationID: "convex",
        },
    ],
};
