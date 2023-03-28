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

export const ENROLL_MUTATION = gql`
  mutation Enroll($title: String!) {
    enroll(title: $title) {
      lessons {
        title
        rating
        currentlyEnrolled
      }
    }
  }
`;

export const UNENROLL_MUTATION = gql`
  mutation Unenroll($title: String!) {
    unenroll(title: $title) {
      lessons {
        title
        rating
        currentlyEnrolled
      }
    }
  }
`;

export const RATE_LESSON_MUTATION = gql`
  mutation RateLesson($title: String!, $rating: Int!) {
    rateLesson(title: $title, rating: $rating) {
      lessons {
        rating
      }
    }
  }
`;

export const LOGOUT_QUERY = gql`
  query Logout {
    logout
  }
`;
