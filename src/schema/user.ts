import { Column, Entity } from "typeorm"
import { Metadata } from "./metadata"

@Entity()
export class User extends Metadata {
    @Column()
    email!: string

    @Column()
    googleId!: string

    @Column()
    username!: string

    @Column()
    hashedPassword!: string

    @Column()
    salt!: string

    @Column()
    role!: string
}