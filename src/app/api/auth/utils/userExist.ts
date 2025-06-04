import { db } from "@/db"
import { UserTable } from "@/db/schema"
import { JOUError } from "@/lib/error"
import { eq } from 'drizzle-orm'

export const userExist = async (email: string) => {
    return db.select({
        id: UserTable.id,
        name: UserTable.name,
        userType: UserTable.userType,
        password: UserTable.password
    })
        .from(UserTable)
        .where(eq(UserTable.email, email))
        .then(([user]) => user)
        .catch(_ => { throw new Error() })
}