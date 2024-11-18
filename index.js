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
      const result = await pool.query("SELECT * FROM items");
      res.render("index", { items: result.rows });
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
    const { name } = req.body;
    await pool.query("INSERT INTO items (name) VALUES ($1)", [name]);
    res.redirect("/");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
});

app.get("/edit/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
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
    const { id } = req.params;
    const { name } = req.body;
    await pool.query("UPDATE items SET name = $1 WHERE id = $2", [name, id]);
    res.redirect("/");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
});

app.post("/delete/:id", async (req, res) => {
try {
    const { id } = req.params;
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
});
    
app.listen(process.env.PORT || PORT, function(){
    console.log(`Server started on port ${PORT}`);
})