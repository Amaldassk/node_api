import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_P,
    database: process.env.DB,
});

conn.connect((err)=>{
    if(err) throw err;
    console.log('connected');
});

const jsonParser = bodyParser.json();

app.get('/books', verifyToken, (req, res)=>{ //get all books
    const qr = 'select * from books';
    conn.query(qr, (err, result, fields)=>{
        if(err) throw err;
        res.send(result);
    });
});

app.get('/book/:id', (req,res)=>{//get a book
    const id = req.params.id;
    const qr = `select * from books where id=${id}`;
    conn.query(qr, (err,result,fields)=>{
        if(err) throw err;
        res.send(result);
    })
});

app.post('/book', jsonParser, (req,res)=>{//add a book
    const book_title = req.body.book_title;
    const description = req.body.description;
    const author_name = req.body.author_name;
    const price = req.body.price;

    const qr = `insert into books(book_title, description, author_name, price) values('${book_title}','${description}','${author_name}',${price})`;

    conn.query(qr, (err, result, fields)=>{
        if(err) throw err;
        res.send({success:'new book added'});
    });
});

app.patch('/book', jsonParser, (req, res)=>{//update a book
    const book_title = req.body.book_title;
    const description = req.body.description;
    const author_name = req.body.author_name;
    const price = req.body.price;
    const id = req.body.id;

    const qr = `update books set book_title='${book_title}', description='${description}',author_name='${author_name}',price=${price} where id=${id}`;

    conn.query(qr, (err, result, fields)=>{
        if(err) throw err;
        res.send({success:'data updated'});
    });
});

app.delete('/book', (req,res)=>{//delete a book
    const id = req.query.id;
    const qr = `delete from books where id=${id}`;
    conn.query(qr, (err, result, fields)=>{
        if(err) throw err;
        res.send({success:'data deleted'});
    });
});

app.post('/login', jsonParser, (req,res)=>{
    const userName = req.body.username;
    const password = req.body.password;

    if(userName === undefined || password === undefined){
        res.status(500).send({failed:'authentication failed, please enter username & password'});
    }else{
        const qr=`select * from users where username='${userName}' and password='${password}'`;
        conn.query(qr, (err, result)=>{
            if(err || result.length==0){
                res.status(500).send({failed:"Login failed"});
            } else {
                let resp = {
                    id: result[0].id,
                    displayName: result[0].display_name
                }

                let token = jwt.sign(resp, process.env.SECRET, {expiresIn:60});
                res.status(200).send({auth:true, token:token, user:resp});
            }
        });
    }
});

function verifyToken(req,res,next) {
    let authHeader = req.headers.authorization;
    if(authHeader==undefined){
        return res.status(401).send({error:"no token provided"});
    }
    let token = authHeader.split(" ").pop();
    jwt.verify(token, process.env.SECRET, (err, decoded)=>{
        if(err){
            return res.status(500).send({error:"authentication failed"})
        } else{
            next();
        }
    });
}

app.get('/',(req,res)=>{
    res.send('<h1>Welcome</h1>')
});

app.listen(4000, ()=>{
    console.log('connection created at port 4000');
});