const express = require('express');
const router = express.Router();
const { ApolloServer, gql } = require('apollo-server-express');
// Integrating Apollo Server with Node.js middleeware
// https://www.apollographql.com/docs/apollo-server/v2/integrations/middleware/


/* Construct schema */
const typeDefs = gql`
    type Query {
        hello: String
    }
`;

/* Provide resolver functions */
const resolvers =  {
    Query: {
        hello: () => 'Hello world!',
    },
};

async function startApolloServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });
    await server.start();

    server.applyMiddleware({ app });

    app.use((req, res) => {
        res.status(200).send('Hello');
    });

    await new Promise(resolve => app.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    return { server, app };
};

startApolloServer();