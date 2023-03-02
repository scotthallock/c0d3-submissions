const express = require('express');

/* Import the routers */
const js5_1_router = require('./src/js5-p1/js5-p1-ip-geolocation.js');
const js5_2_router = require('./src/js5-p2/js5-p2-commands.js');
const js5_3_router = require('./src/js5-p3/js5-p3-meme-gen.js');
// js5_4_router
const js5_5_router = require('./src/js5-p5/js5-p5-chatroom.js');
const js5_6_router = require('./src/js5-p6/js5-p6-auth.js');
const js5_7_router = require('./src/js5-p7/js5-p7-image-text-extraction.js')
const js5_8_router = require('./src/js5-p8/js5-p8-selfie-queen.js')
const js5_9_router = require('./src/js5-p9/js5-p9-memechat.js')

const app = express();

/* Serve static files */
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

/* Register the routers */
app.use('/ip-geolocation', js5_1_router);
app.use('/commands', js5_2_router);
app.use('/meme-gen', js5_3_router);
// js5_4 add later
app.use('/chatroom', js5_5_router);
app.use('/auth', js5_6_router);
app.use('/image-text-extraction', js5_7_router);
app.use('/selfie-queen', js5_8_router);
app.use('/memechat', js5_9_router);

/* Start the server */
const port = 8123;
app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port}`));
