import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const users = {};

/* Get list of all pokemon names from PokeAPI */
const allPokemonData = 
    await fetch('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10000')
    .then(res => res.json())
    .then(res => res.results);
const allPokemonNames = allPokemonData.map(e => ({ name: e.name }));

/* Populate users object - one user per pokemon */
allPokemonData.forEach(async (e) => {
    users[e.name] = {};
    const user = users[e.name];

    /* Is this right...? This is >1000 fetches for pokemon images... */
    user.name = e.name;
    user.image = await fetch(e.url)
        .then(res => res.json())
        .then(body => body.sprites.front_default);
    user.lessons = [];
});

/* Helper functions */
const enroll = (title) => {

};

/* Using the example UI for this challenge: */
/* https://js5.c0d3.com/js6/addLessons.html */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js6-p2/js6-p2-example.html'));
});

/* Define schema */
const typeDefs = `#graphql
    type Lesson {
        title: String
    }
    type Pokemon {
        name: String
        image: String
    }
    type BasicPokemon {
        name: String
    }
    type User {
        name: String
        image: String
        lessons: [Lesson]
    }
    type Query {
        lessons: [Lesson]
        getPokemon(name: String!): Pokemon
        search(str: String!): [BasicPokemon]
        login(pokemon: String!): User
        user: User
    }
    type Mutation {
        enroll(title: String!): User
        unenroll(title: String!): User
    }
`;

/* Extend RESTDataSource classes to fetch data from REST APIs */
/* https://www.apollographql.com/docs/apollo-server/data/fetching-rest */
class LessonsAPI extends RESTDataSource {
    baseURL = 'https://www.c0d3.com/api/lessons/';

    async getLessons() {
        return this.get('./');
    }
}

class PokemonAPI extends RESTDataSource {
    baseURL = 'https://pokeapi.co/api/v2/';

    async getPokemon(name) {
        const data = await this.get(`./pokemon/${name}`);
        return {
            name: data.name,
            image: data.sprites.front_default,
        };
    }
}

/* Define resolver functions */
const resolvers = {
    Query: {
        lessons: async (_, __, { dataSources }) => {
            return dataSources.lessonsAPI.getLessons();
        },
        getPokemon: async (_, { name }, { dataSources }) => {
            return dataSources.pokemonAPI.getPokemon(name);
        },
        search: (_, { str }) => {
            return allPokemonNames.filter(e => {
                return e.name.includes(str.toLowerCase());
            });
        },
        login: (_, { pokemon }, { req }) => {
            req.session.user = pokemon;
            return users[pokemon];
        },
        user: (_, __, { req }) => {
            const pokemon = req.session.user;
            if (!pokemon) throw new GraphQLError('Not authorized');
            return users[pokemon];
        },
    },
    Mutation: {
        enroll: (_, { title }, { req }) => {
            const pokemon = req.session.user;
            if (!pokemon) throw new GraphQLError('Not authorized');

            const lessons = users[pokemon].lessons;
            const found = lessons.find(e => e.title === title);
            if (!found) lessons.push({ title });
            return users[pokemon];
        },
        unenroll: (_, { title }, { req }) => {
            const pokemon = req.session.user;
            if (!pokemon) throw new GraphQLError('Not authorized');

            const lessons = users[pokemon].lessons;
            const index = lessons.findIndex(e => e.title === title);
            if (index > -1) lessons.splice(index, 1);
            return users[pokemon];
        },
    },
};

export default {
    typeDefs,
    resolvers,
    router,
    PokemonAPI,
    LessonsAPI,
};