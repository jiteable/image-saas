import NextAuth from "next-auth"
import GitlabProvider from "next-auth/providers/gitlab"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/server/db/db"

export const authOptions = {
  adapter: DrizzleAdapter(db),
  // Configure one or more authentication providers
  providers: [
    GitlabProvider({
      clientId: process.env.CLIENTID || '',
      clientSecret: process.env.CLIENTSECRET || ''
    })
  ],
}
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
