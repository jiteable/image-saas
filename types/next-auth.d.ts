import { DefaultSession, DefaultUser } from 'next-auth'
export enum Role {
  user = 'user',
  admin = 'admin',
}
// if you want to add more fields to the user
interface IUser extends DefaultUser {
  /**
   * Role of user
   */
  //   role?: Role
  /**
   * more fields
   */
  phone?: string | null
}
declare module 'next-auth' {
  interface User extends IUser { }
  interface Session {
    user?: User
  }
}
declare module 'next-auth/jwt' {
  interface JWT extends IUser { }
}