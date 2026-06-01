import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const workspaceDomains = (
  process.env.GOOGLE_WORKSPACE_DOMAINS ||
  process.env.GOOGLE_WORKSPACE_DOMAIN ||
  ""
)
  .split(",")
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          hd: workspaceDomains[0]
        }
      }
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      if (workspaceDomains.length === 0) return true;
      const email = profile?.email || "";
      const domain = email.toLowerCase().split("@").pop();
      return workspaceDomains.includes(domain);
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};

export default NextAuth(authOptions);
