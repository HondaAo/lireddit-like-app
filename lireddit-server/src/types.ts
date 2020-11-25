import {  Response} from 'express'
import {Redis} from 'ioredis'

export type MyContext = {
    redis: Redis
    req: any
    res: Response
}