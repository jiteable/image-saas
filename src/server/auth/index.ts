import GitlabProvider from "next-auth/providers/gitlab"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/server/db/db"
import { AuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth"

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db),
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
