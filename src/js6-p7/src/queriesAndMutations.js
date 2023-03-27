import { gql } from "@apollo/client";

export const LESSONS_QUERY = gql`
query getLessons {
  lessons {
    title
  }
}
`;

export const USER_QUERY = gql`
query getUser {
  user {
    name,
    image,
    lessons {
      title
      rating,
      currentlyEnrolled
    }
  }
}
`;