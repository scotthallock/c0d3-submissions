import express from 'express';
import session from 'express-session'; // for js-6 graphql server
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import http from 'http';
import cors from 'cors';

import js5_1_router from './src/js5-p1/js5-p1-ip-geolocation.js';
import js5_2_router from './src/js5-p2/js5-p2-commands.js';
import js5_3_router from './src/js5-p3/js5-p3-meme-gen.js';
// js5_4_router, add later
import js5_5_router from './src/js5-p5/js5-p5-chatroom.js';
import js5_6_router from './src/js5-p6/js5-p6-auth.js';
import js5_7_router from './src/js5-p7/js5-p7-image-text-extraction.js';
import js5_8_router from './src/js5-p8/js5-p8-selfie-queen.js';
import js5_9_router from './src/js5-p9/js5-p9-memechat.js';
// js6
import js6_2 from './src/js6-p2/js6-p2-graphql-part2.js';

const app = express();


/**
 * Set up ApolloServer instance (v4)
 * https://www.apollographql.com/docs/apollo-server/migration/#migrate-from-apollo-server-express
 */
const httpServer = http.createServer(app);
const server = new ApolloServer({
    typeDefs: js6_2.typeDefs,
    resolvers: js6_2.resolvers,
    introspection: true,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer })
    ],
});
await server.start();
app.use(
    '/graphql',
    cors(),
    express.json(),
    session({
        secret: 'not very secret',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
    }),
    expressMiddleware(server, {
        context: async ({ req, res }) => {
            const { cache } = server;
            return {
                req,
                dataSources: {
                    lessonsAPI: new js6_2.LessonsAPI({ cache }),
                    pokemonAPI: new js6_2.PokemonAPI({ cache }),
                }
            }
        }, // not really sure what this does...
    }),
);
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at /graphql`);

/* Serve static files */
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

/* Register the routers */
app.use('/ip-geolocation', js5_1_router);
app.use('/commands', js5_2_router);
app.use('/meme-gen', js5_3_router);
// // js5_4 add later
app.use('/chatroom', js5_5_router);
app.use('/auth', js5_6_router);
app.use('/image-text-extraction', js5_7_router);
app.use('/selfie-queen', js5_8_router);
app.use('/memechat', js5_9_router);
app.use('/graphql-part2', js6_2.router);

/* Start the express server */
const port = 8123;
app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port}`));
