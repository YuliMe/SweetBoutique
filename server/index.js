const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const mysql = require('mysql2/promise');

app.use(bodyParser.json());
app.use(express.static('files'));


app.post('/api/signup', async (req, res) => {
    let formData = req.body;

    let connection = await sqlConnection();
    try {
        let [rows, fields] = await connection.execute('insert into users (email,name,phone,businessName,minPrice,maxPrice,homepage,categories,password,isAdmin,isConfirmed) VALUES (?,?,?,?,?,?,?,?,?,0,0)',
            [formData.email, formData.name, formData.phone, formData.businessName, formData.minPrice, formData.maxPrice, formData.homepage, formData.categories, formData.password]);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify(err.message));
    }
    connection.end();
});

app.listen(PORT, () => {
    console.log('started listening');
})

function sqlConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'cakes'
    });
}