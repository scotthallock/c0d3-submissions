import express from "express";
/* Imports below needed for Apollo Server, JS6 */
import session from "express-session";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import cors from "cors";

/* Import the routers for each challenge solution */
import js5_1_router from "./src/js5-p1/js5-p1-ip-geolocation.js";
import js5_2_router from "./src/js5-p2/js5-p2-commands.js";
import js5_3_router from "./src/js5-p3/js5-p3-meme-gen.js";
// js5_4_router, add later
import js5_5_router from "./src/js5-p5/js5-p5-chatroom.js";
import js5_6_router from "./src/js5-p6/js5-p6-auth.js";
import js5_7_router from "./src/js5-p7/js5-p7-image-text-extraction.js";
import js5_8_router from "./src/js5-p8/js5-p8-selfie-queen.js";
import js5_9_router from "./src/js5-p9/js5-p9-memechat.js";
// js6_1 links to a different web service
import js6_2 from "./src/js6-p2/js6-p2-graphql-part2.js";
import js6_3_router from "./src/js6-p3/js6-p3-stars-and-kanban.js";
import js6_4_router from "./src/js6-p4/js6-p4-pokemon-classes.js";
// js6_5 is an Expo Snack app
import js6_6_router from "./src/js6-p6/js6-p6-star-lesson.js";
import js6_7_router from "./src/js6-p7/js6-p7-apollo-client.js";

const app = express();

/* Set up Apollo Server v4 */
/* See: https://www.apollographql.com/docs/apollo-server/migration/#migrate-from-apollo-server-express */
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs: js6_2.typeDefs,
  resolvers: js6_2.resolvers,
  introspection: true,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  "/graphql", // the endpoint for the gql server
  cors(),
  express.json(),
  session({
    // set up express-session middleware
    secret: "not very secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  }),
  expressMiddleware(server, {
    context: async ({ req }) => ({ req }), // pass request into resolver
  })
);

app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

/* Mount the imported routers */
app.use("/ip-geolocation", js5_1_router);
app.use("/commands", js5_2_router);
app.use("/meme-gen", js5_3_router);
// js5_4 add later
app.use("/chatroom", js5_5_router);
app.use("/auth", js5_6_router);
app.use("/image-text-extraction", js5_7_router);
app.use("/selfie-queen", js5_8_router);
app.use("/memechat", js5_9_router);
// js6_1 links to a separate web service
app.use("/graphql-part2", js6_2.router);
app.use("/stars-and-kanban", js6_3_router);
app.use("/pokemon-classes", js6_4_router);
// js6_5 is an Expo Snack app
app.use("/star-lesson", js6_6_router);
app.use("/apollo-client", js6_7_router);

/* Start the GraphQL server */
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 GraphQL server ready at /graphql`);

/* Start the Express server */
const port = 8123;
app.listen(process.env.PORT || port, () =>
  console.log(`Server running on port ${port}`)
);
