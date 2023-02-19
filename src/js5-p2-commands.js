/* Create router for JS5 Challenge 2 - Commands */
const express = require('express');
const router = express.Router();
const path = require('path');
const jsonParser = require('body-parser').json();
const child_process = require('child_process');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/js5-p2.html'));
});

/* Request handler for when user inputs a command */
router.post('/', jsonParser, (req, res) => {
    /* remove extra spaces from input and split */
    const input = req.body.command.replace(/\s+/g,' ').trim().split(' ');
    const command = input[0];
    const options = input.slice(1);
    const allowedCommands = ['cat', 'ls', 'pwd', 'git'];

    /* if the command is empty or not allowed */
    if (!allowedCommands.includes(command)) {
        return res.status(400).json({
            color: "red",
            message: command === '' ?
                'please enter a command' :
                `'${command}' is not a supported command`
        });
    }
    if (command === 'cat' && options.length === 0) {
        return res.status(400).json({
            color: "red",
            message: `'cat' requires 1 or more options`
        });
    }
    if (command === 'git' && options[0] !== 'status') {
        return res.status(400).json({
            color: "red",
            message: `only 'git status' is available`
        });
    }
    
    /* create child process */
    const child = child_process.spawn(command, options);
    let result = '';

    /* child process listeners */
    child.stdout.on('data', (data) => {
        result += data.toString();
    });
    child.stderr.on('data', (data) => {
        result += data.toString();
    });
    child.on('error', error => {
        result = error.message;
    });
    /* wait for child process to close to send result */
    child.on('close', code => {
        /* code === 0 means normal exit */
        res.json({
            color: code === 0 ? "white" : "red",
            message: result
        });
    });
});

module.exports = router;