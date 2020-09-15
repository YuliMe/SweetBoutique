const express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
const app = express();
var router = express.Router();
const PORT = 3000;

const mysql = require('mysql2/promise');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('files'));
app.use('/api/manage/*', checkIsAdmin);

app.get('/api/manage/getapprovals', async (req, res) => {
    let connection = await sqlConnection();
    let [rows, fields] = await connection.execute('select * from bakers where isConfirmed = 0');
    connection.end();
    res.send(rows);
});

app.post('/api/manage/approve', async (req, res) => {
    let connection = await sqlConnection();
    let [rows, fields] = await connection.execute('update bakers set isConfirmed = 1 where email = ?', [req.body.email]);
    connection.end();
    res.sendStatus(200);
});

app.post('/api/signup/conditure', async (req, res) => {
    let formData = req.body;
    try {
        try {
            let [rows, fields] = await query('insert into users (email,password) VALUES (?,?)', [formData.email, formData.password]);
        } catch (error) {}

        let [rows, fields] = await query('insert into bakers (email,name,phone,businessName,minPrice,maxPrice,homepage,categories,isConfirmed) values (?,?,?,?,?,?,?,?,0)',
            [formData.email, formData.name, formData.phone, formData.businessName, formData.minPrice, formData.maxPrice, formData.homepage, formData.categories]);

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify(err.message));
    }
});


app.post('/api/login', async (req, res) => {
    let formData = req.body;
    try {
        let [rows, fields] = await query('select (select count(*) from users where email = ? and password = ?) as hasUser,(select count(*) from bakers where email = ?) as isBaker,(select count(*) from admins where email = ?) as isAdmin from users',
            [formData.email, formData.password, formData.email, formData.email]);

        if (rows[0].hasUser === 1) {
            res.cookie("loginData", JSON.stringify({
                email: formData.email,
                password: formData.password,
                isAdmin: rows[0].isAdmin,
                isBaker: rows[0].isBaker
            }));
            res.send(rows[0]);
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify(err.message));
    }
});

app.get('/api/logoff', (req, res) => {
    res.clearCookie('loginData');
    res.sendStatus(200);
})


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

async function checkIsAdmin(req, res, next) {
    let loginData = JSON.parse(req.cookies.loginData);
    let [rows, fields] = await query('select (select count(*) from users where email = ? and password = ?) as hasUser,(select count(*) from admins where email = ?) as isAdmin from users', [loginData.email, loginData.password, loginData.email]);

    if (rows[0].hasUser === 1 && rows[0].isAdmin === 1) {
        next();
    } else {
        res.sendStatus(401);
    }
}

async function query(query, params) {
    let connection = await sqlConnection();
    let [rows, fields] = await connection.execute(query, params);
    connection.end();

    return [rows, fields];
}