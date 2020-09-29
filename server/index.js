const express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
const {
    v4: uuidv4
} = require('uuid');
const app = express();
var router = express.Router();
const PORT = 3000;

const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sweetboutique007@gmail.com',
        pass: 'sweetboutique007007'
    }
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '../../files'));
app.use('/api/manage/*', checkIsAdmin);
app.use('/api/conditure/*', checkIsBaker);

app.get('/api/conditure/getOrders', async (req, res) => {
    let loginData = JSON.parse(req.cookies.loginData);
    let [rows, fields] = await query('select * from orders where isReady = 0 and conditureEmail = ?', [loginData.email]);
    res.send(rows);
});

app.get('/api/conditure/getinfo', async (req, res) => {
    let loginData = JSON.parse(req.cookies.loginData);
    let [rows, fields] = await query('select * from bakers where email = ?', [loginData.email]);
    res.send(rows[0]);
});

app.post('/api/conditure/updateinfo', async (req, res) => {
    let formData = req.body;
    let loginData = JSON.parse(req.cookies.loginData);
    try {

        let [rows, fields] = await query('update bakers set name = ?, phone = ?,businessName = ?,minPrice = ?,maxPrice = ?,homepage = ?,categories = ?,desserts = ?,address = ?,maxDist = ? where email = ?',
            [formData.name, formData.phone, formData.businessName, formData.minPrice, formData.maxPrice, formData.homepage, formData.categories, formData.desserts, formData.address, formData.maxDist, loginData.email]);
        loginData.name = formData.name;

        res.cookie("loginData", JSON.stringify(loginData));

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify(err.message));
    }
});

app.post('/api/conditure/finishOrder', async (req, res) => {
    let loginData = JSON.parse(req.cookies.loginData);
    let [rows, fields] = await query('update orders set isReady = 1 where orderId = ? and conditureEmail = ?', [req.body.orderId, loginData.email]);

    let [orderRow, orderFields] = await query('select customerEmail from orders where orderId = ?', [req.body.orderId]);

    let feedbackLink = 'https://racheliza.mtacloud.co.il/Includes/orderdetails.html?orderid=' + req.body.orderId;
    sendMail(orderRow[0].customerEmail, 'הזמנתך הסתיימה', 'על מנת למלא משוב היכנס לכאן: ' + feedbackLink);
    res.sendStatus(200);
});

app.get('/api/manage/getapprovals', async (req, res) => {
    let [rows, fields] = await query('select * from bakers where isConfirmed = 0');
    res.send(rows);
});

app.post('/api/manage/approve', async (req, res) => {
    let [rows, fields] = await query('update bakers set isConfirmed = 1 where email = ?', [req.body.email]);
    sendMail(req.body.email, "הרשמתך לאתר Sweet Boutique אושרה!", "הרשמתך לאתר אושרה ומעכשיו ניתן יהיה לחפש אותך ולהזמין ממך באתר!");
    res.sendStatus(200);
});

app.get("/api/getConditure/:email", async (req, res) => {
    let [rows, fields] = await query('select * from bakers where isConfirmed = 1 and email = ?', [req.params.email]);
    if (rows.length === 1) {
        res.send(rows[0]);
    } else {
        res.sendStatus(404);
    }
});

app.get("/api/getOrder/:orderId", async (req, res) => {
    let [rows, fields] = await query('select orderId,isReady,timeOfOrder,orderForDate,comments,feedbackRating,feedbackComment from orders where orderId = ?', [req.params.orderId]);
    if (rows.length === 1) {
        res.send(rows[0]);
    } else {
        res.sendStatus(404);
    }
});

app.post('/api/ordercake', async (req, res) => {
    let formData = req.body;
    let uuid = uuidv4();
    let [rows, fields] = await query('insert into orders (orderId,conditureEmail,customerAddress,customerName,customerPhone,customerEmail,orderForDate, comments,isReady) VALUES(?,?,?,?,?,?,?,?,0)', [uuid, formData.conditureEmail, formData.customerAddress, formData.customerName, formData.customerPhone, formData.customerEmail, formData.orderDate, formData.comments]);
    if (rows.affectedRows === 1) {
        sendMail(formData.conditureEmail, "התקבלה הזמנה חדשה באתר Sweet Boutique", "התקבלה הזמנה חדשה באתר Sweet Boutique, לכניסה עבור לכאן http://racheliza.mtacloud.co.il/");
        res.send(JSON.stringify(uuid));
    } else {
        res.sendStatus(404);
    }
});

app.post('/api/sendfeedback', async (req, res) => {
    let formData = req.body;
    let [rows, fields] = await query('update orders set feedbackRating = ?, feedbackComment = ? where orderId = ? and feedbackRating is null',
        [formData.feedbackRating, formData.feedbackComment, formData.orderId]);
    res.sendStatus(200);
});

app.get('/api/getConditures', async (req, res) => {
    let [rows, fields] = await query(`select *,
    (select avg(feedbackRating) from orders where email = conditureEmail and feedbackRating is not null) as avg,
    (select count(feedbackRating) from orders where email = conditureEmail and feedbackRating is not null) as count from bakers`);
    res.send(rows);
});

app.post('/api/signup/conditure', async (req, res) => {
    let formData = req.body;
    try {
        try {
            let [rows, fields] = await query('insert into users (email,password) VALUES (?,?)', [formData.email, formData.password]);
        } catch (error) {}

        let [rows, fields] = await query('insert into bakers (email,name,phone,businessName,minPrice,maxPrice,homepage,categories,desserts,address,maxDist,isConfirmed) values (?,?,?,?,?,?,?,?,?,?,?,0)',
            [formData.email, formData.name, formData.phone, formData.businessName, formData.minPrice, formData.maxPrice, formData.homepage, formData.categories, formData.desserts, formData.address, formData.maxDist]);

        let [adminRows, adminFields] = await query('select * from admins');
        sendMail(adminRows.map(a => a.email).join(), 'קונדיטור חדש נרשם לאתר', "קונדיטור חדש בשם" + formData.name + " נרשם לאתר");
        res.cookie("loginData", JSON.stringify({
            email: formData.email,
            password: formData.password,
            isAdmin: 0,
            isBaker: 1,
            name: formData.name
        }));

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify(err.message));
    }
});

app.post('/api/login', async (req, res) => {
    let formData = req.body;
    try {
        let [rows, fields] = await query('select (select count(*) from users where email = ? and password = ?) as hasUser,(select count(*) from bakers where email = ?) as isBaker,(select count(*) from admins where email = ?) as isAdmin',
            [formData.email, formData.password, formData.email, formData.email]);
        let [nameRow] = await query('select name from bakers where email = ?', [formData.email]);
        let name = '';
        if (nameRow.length === 1) {
            name = nameRow[0].name;
        }
        if (rows[0].hasUser === 1) {
            res.cookie("loginData", JSON.stringify({
                email: formData.email,
                password: formData.password,
                isAdmin: rows[0].isAdmin,
                isBaker: rows[0].isBaker,
                name: name
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
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.listen(PORT, () => {
    console.log('started listening');
});

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
    let [rows, fields] = await query('select (select count(*) from users where email = ? and password = ?) as hasUser,(select count(*) from admins where email = ?) as isAdmin', [loginData.email, loginData.password, loginData.email]);

    if (rows[0].hasUser === 1 && rows[0].isAdmin === 1) {
        next();
    } else {
        res.sendStatus(401);
    }
}

async function checkIsBaker(req, res, next) {
    let loginData = JSON.parse(req.cookies.loginData);
    let [rows, fields] = await query('select (select count(*) from users where email = ? and password = ?) as hasUser,(select count(*) from bakers where email = ?) as isBaker', [loginData.email, loginData.password, loginData.email]);

    if (rows[0].hasUser === 1 && rows[0].isBaker === 1) {
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

function sendMail(mailAddress, subject, html) {
    transporter.sendMail({
        from: 'sweetboutique007@gmail.com',
        to: mailAddress,
        subject,
        html
    }, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}