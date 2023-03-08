import express from 'express';
import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const users = {};

/* Get list of all pokemon names from PokeAPI */
const allPokemonData = 
    await fetch('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10000') // 10 for testing
    .then(res => res.json())
    .then(res => res.results);
const allPokemonNames = allPokemonData.map(e => ({ name: e.name }));

/* Populate users object - one user per pokemon */
allPokemonData.forEach(async (e) => {
    users[e.name] = {};
    const user = users[e.name];

    /* Is this right? This is over 1000 fetches being made... */
    user.name = e.name;
    user.image = await fetch(e.url)
        .then(res => res.json())
        .then(body => body.sprites.front_default);
    user.lessons = [];
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js6-p2/js6-p2.html'))
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
        lessons: [Lesson] # this stores enrolled lessons
    }
    type Query {
        lessons: [Lesson]
        getPokemon(name: String!): Pokemon
        search(searchString: String!): [BasicPokemon]
        login(pokemon: String!): User
        user: User
    }
    type Mutation {
        enroll(enrollTitle: String!): User
        unenroll(unenrollTitle: String!): User
    }
`;

/**
 * Extend RESTDataSource classes to fetch data from REST APIs
 * See: https://www.apollographql.com/docs/apollo-server/data/fetching-rest
 */
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
        getPokemon: (_, { name }, { dataSources }) => {
            return dataSources.pokemonAPI.getPokemon(name);
        },
        search: (_, { searchString }) => {
            return allPokemonNames.filter(e => {
                return e.name.includes(searchString.toLowerCase());
            });
        },
        login: (_, { pokemon }, { req }) => {
            console.log('login ouch')
            req.session.user = pokemon;
            return users[pokemon];
        },
        user: (_, __, { req }) => {
            console.log('user ouch')
            const pokemon = req.session.user;
            if (!pokemon) {
                console.log('not authorized')
                throw new GraphQLError(
                    'You are not authorized',
                    { extensions: { code: 'FORBIDDEN' } },
                );
            }
            console.log('authorized');
            return users[pokemon];
        },
    },

    Mutation: {
        enroll: () => {
            return {
                name: 'enrolltest',
                image: 'enrolltest',
                lessons: [{title: 'enrolltest'}],
            };
        },
        unenroll: () => {
            return {
                name: 'unenrolltest',
                image: 'unenrolltest',
                lessons: [{title: 'unenrolltest'}],
            };
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