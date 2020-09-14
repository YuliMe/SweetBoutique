const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(express.static('files'));


app.post('/api/signup', (req, res) => {
    let formData = req.body;
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log('started listening');
})