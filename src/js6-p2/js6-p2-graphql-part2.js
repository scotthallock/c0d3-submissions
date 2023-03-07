import express from 'express';
import session from 'express-session';
import { RESTDataSource } from '@apollo/datasource-rest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

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
        const data = this.get(`./pokemon/${name}`);
        return {
            name: data.name,
            image: data.sprites.front_default,
        };
    }
}

/**
 * Get list of all pokemon names from PokeAPI.
 * (Set ?limit=10000 so all pokemon are returned on one page.)
 */
const allPokemonData = 
    await fetch('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10000')
    .then(res => res.json());
const allPokemonNames = allPokemonData.results.map(e => ({ name: e.name }));

/* Define resolvers */
const resolvers = {
    Query: {
        lessons: async (_, __, { dataSources }) => {
            return dataSources.lessonsAPI.getLessons();
        },
        getPokemon: async (_, { name }, { dataSources }) => {
            return dataSources.pokemonAPI.getPokemon(name);
        },
        search: (_, { searchString }) => {
            return allPokemonNames.filter(e => {
                return e.name.includes(searchString.toLowerCase());
            });
        },
        login: (_, {pokemon}) => {
            return {
                name: 'test',
                image: 'test',
                lessons: [{title: 'test'}],
            }
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

router.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js6-p2/js6-p2.html'))
});

export default {
    typeDefs,
    resolvers,
    router,
    PokemonAPI,
    LessonsAPI,
};