const express = require('express');
const router = express.Router();
const { gql, ApolloError } = require('apollo-server-express');
const path = require('path');

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
        hello: () => 'Hello world, hellya!',
    },
};

router.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js6-p2/js6-p2.html'))
});

module.exports = { typeDefs, resolvers, router };