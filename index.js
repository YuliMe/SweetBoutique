const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('files'));


app.listen(PORT, () => {
    console.log('started listening');
})