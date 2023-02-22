const express = require('express');

/* Import the routers */
const js5_1_router = require('./src/js5-p1/js5-p1-ip-geolocation.js');
const js5_2_router = require('./src/js5-p2/js5-p2-commands.js');
const js5_3_router = require('./src/js5-p3/js5-p3-meme-gen.js');
// js5_4_router
const js5_5_router = require('./src/js5-p5/js5-p5-chatroom.js');
const js5_6_router = require('./src/js5-p6/js5-p6-auth.js');

const app = express();

/* Serve static files */
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

/* Register the routers */
app.use('/ip-geolocation', js5_1_router);
app.use('/commands', js5_2_router);
app.use('/meme-gen', js5_3_router);
// js5_4
app.use('/chatroom', js5_5_router);
app.use('/auth', js5_6_router);

/* Start the server */
const port = 8123;
app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port}`));
