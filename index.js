const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
require('dotenv').config()

const app = express();
const PORT = 3000;


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const { Pool } = require('pg');


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

module.exports = pool;

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/allPoems", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM poems");
      res.render("allPoems", { items: result.rows });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
  
app.get("/add", (req, res) => {
    res.render("add");
  });
  
app.post("/add", async (req, res) => {
try {
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    const createdAt = new Date().toISOString();
    const category = req.body.category;
    // const UpdayedAt;

    const query = `
    INSERT INTO poems (title, content, author, created_at, category)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [title, content, author, createdAt, category];

    await pool.query(query, values);
    console.log('Poem inserted successfully!');
    res.redirect("/");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
});

app.get("/edit/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM poems WHERE id = $1", [id]);
      if (result.rows.length > 0) {
        res.render("edit", { item: result.rows[0] });
      } else {
        res.status(404).send("Item not found");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
  
app.post("/edit/:id", async (req, res) => {
try {
  const id = req.params.id;
  const title = req.body.title;
  const content = req.body.content;
  const author = req.body.author;
  const updatedAt = new Date().toISOString();
  const category = req.body.category;

  const query = `
    UPDATE poems
    SET title = $1, content = $2, author = $3, updated_at = $4, category = $5
    WHERE id = $6
  `;
  const values = [title, content, author, updatedAt, category, id];

    await pool.query(query, values);
    console.log('Poem updated successfully!');
    res.redirect("/");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
});

app.post("/delete/:id", async (req, res) => {
try {
    const { id } = req.params;
    await pool.query("DELETE FROM poems WHERE id = $1", [id]);
    console.log('Poem deleted successfully!');
    res.redirect("/");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
});
    
app.listen(process.env.PORT || PORT, function(){
    console.log(`Server started on port ${PORT}`);
})