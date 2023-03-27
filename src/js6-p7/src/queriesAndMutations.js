import { gql } from "@apollo/client";

export const LESSONS_QUERY = gql`
  query Lessons {
    lessons {
      title
    }
  }
`;

export const USER_QUERY = gql`
  query User {
    user {
      name
      image
      lessons {
        title
        rating
        currentlyEnrolled
      }
    }
  }
`;

export const SEARCH_QUERY = gql`
  query Search($str: String!) {
    search(str: $str) {
      name
    }
  }
`;

export const GET_POKEMON_QUERY = gql`
  query GetPokemon($str: String!) {
    getPokemon(str: $str) {
      name
      image
    }
  }
`;

export const LOGIN_QUERY = gql`
  query Login($pokemon: String!) {
    login(pokemon: $pokemon) {
      name
      image
      lessons {
        title
        rating
        currentlyEnrolled
      }
    }
  }
`;