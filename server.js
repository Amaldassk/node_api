import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
const app = express();
import dotenv from 'dotenv';
dotenv.config();

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

app.get('/books', (req, res)=>{ //get all books
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

app.get('/',(req,res)=>{
    res.send('<h1>Welcome</h1>')
});

app.listen(4000, ()=>{
    console.log('connection created at port 4000');
});