import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GraphQLError } from "graphql";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const users = {};

/* Get list of all pokemon names from PokeAPI */
const allPokemonData = await fetch(
  "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10000"
)
  .then((res) => res.json())
  .then((data) => data.results);
const allPokemonNames = allPokemonData.map((e) => ({ name: e.name }));

/* Populate users object - one user per pokemon (~1200) */
allPokemonData.forEach(({ name }) => {
  users[name] = {
    name,
    image: null, // fetch this only when we need it
    lessons: []
  };
});

const getLessons = async () => {
  const response = await fetch(`https://www.c0d3.com/api/lessons/`);
  return await response.json();
};

const getPokemonUser = async (name) => {
  if (!users[name].image) {
    // need to fetch the image
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const {
      sprites: { front_default },
    } = await response.json();
    users[name].image = front_default; // cache the image in users object
  }
  return users[name];
};

/* Define schema */
const typeDefs = `#graphql
    type Lesson {
        title: String
        rating: Int
        currentlyEnrolled: Boolean
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
        getPokemon(str: String!): Pokemon
        search(str: String!): [BasicPokemon]
        login(pokemon: String!): User
        logout: Boolean
        user: User
    }
    type Mutation {
        enroll(title: String!): User
        unenroll(title: String!): User
        rateLesson(title: String!, rating: Int!): User
    }
`;

/* Define resolver functions */
const resolvers = {
  Query: {
    lessons: getLessons,

    getPokemon: (_, { str }) => getPokemonUser(str),

    search: (_, { str }) => {
      return allPokemonNames.filter((e) => {
        return e.name.includes(str.toLowerCase());
      });
    },
    login: (_, { pokemon }, { req }) => {
      req.session.user = pokemon;
      return users[pokemon];
    },
    logout: (_, __, { req }) => {
      req.session.user = null;
      return true;
    },
    user: (_, __, { req }) => {
      const pokemon = req.session.user;
      if (!pokemon) throw new GraphQLError("Not authorized");

      return getPokemonUser(pokemon);
    },
  },
  Mutation: {
    enroll: (_, { title }, { req }) => {
      const pokemon = req.session.user;
      if (!pokemon) throw new GraphQLError("Not authorized");

      const lessons = users[pokemon].lessons;
      const index = lessons.findIndex((e) => e.title === title);

      if (index === -1) {
        // enrolling for the very first time
        lessons.push({
          title,
          rating: null,
          currentlyEnrolled: true,
        });
      } else {
        // re-enrolling
        lessons[index].currentlyEnrolled = true;
      }

      return users[pokemon];
    },
    unenroll: (_, { title }, { req }) => {
      const pokemon = req.session.user;
      if (!pokemon) throw new GraphQLError("Not authorized");

      const lessons = users[pokemon].lessons;
      lessons.find((e) => e.title === title).currentlyEnrolled = false;

      return users[pokemon];
    },
    rateLesson: (_, { title, rating }, { req }) => {
      const pokemon = req.session.user;
      if (!pokemon) throw new GraphQLError("Not authorized");

      const lessons = users[pokemon].lessons;
      const index = lessons.findIndex((e) => e.title === title);
      if (index > -1) lessons[index].rating = rating;

      return users[pokemon];
    },
  },
};

/* Using the example UI for this challenge: */
/* https://js5.c0d3.com/js6/addLessons.html */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/js6-p2/js6-p2-example.html"));
});

export default {
  typeDefs,
  resolvers,
  router,
};
