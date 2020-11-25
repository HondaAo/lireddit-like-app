import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express'
import { HelloResolver } from "./resolvers/helloResolver";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { ApolloServer } from 'apollo-server-express'
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { MyContext } from "./types";
import cors from 'cors'
import { createConnection } from 'typeorm'
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const main = async() => {
    await createConnection({
        type: 'postgres',
        database: 'lireddit6',
        username: 'hondaao',
        password: 'aosora1207',
        logging: true,
        synchronize: true,
        entities: [User, Post]
    })
    const app = express();
    app.use(
        cors({
         origin: 'http://localhost:3000',
         credentials: true
        })
    )
    const RedisStore = connectRedis(session)
    const redis = Redis()
    
    app.use(
      session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
        client: redis,
        disableTTL: true,
        disableTouch: true
        }),
        cookie: {
            maxAge: 1000*60*60*24*365,
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        },
        saveUninitialized: false,
        secret: 'fnalfnoanfaane',
        resave: false,
      })
    )
    const schema = await buildSchema({
        resolvers: [ HelloResolver, PostResolver, UserResolver],
        validate: false
    })
    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }): MyContext => ({ req, res, redis })
    })
    apolloServer.applyMiddleware({ app , cors:false})
    app.listen(4000, () => {
        console.log('server is running on 4000')
    })
}

main().catch(err => {
    console.log(err);
});