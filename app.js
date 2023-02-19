const express = require('express');

/* Import routers */
const js5_1_router = require('./src/js5-p1-ip-geolocation.js');
const js5_2_router = require('./src/js5-p2-commands.js');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use('/ip-geolocation', js5_1_router);
// app.use('/commands', js5_2_router);


const port = 8123;
app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port}`));
