import GitlabProvider from "next-auth/providers/gitlab"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/server/db/db"
import { AuthOptions, DefaultSession, getServerSession as nextAuthGetServerSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db),
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    }
  },
  // Configure one or more authentication providers
  providers: [
    GitlabProvider({
      clientId: process.env.CLIENTID || '',
      clientSecret: process.env.CLIENTSECRET || ''
    })
  ],
}

export function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}
