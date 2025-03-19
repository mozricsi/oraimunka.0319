const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
 
app.use(cors());
app.use(bodyParser.json());
 
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  port: "3307",
  password: "",
  database: "atletikavb2017",
});
 
app.get("/", (req, res) => {
    res.send("A szerver működik!");
  });

  // 1. feladat: Versenyszámok neve, ahol az időtartam > 60 perc (GET)
app.get("/api/long-events", (req, res) => {
    // SQL lekérdezés: Azok a versenyszámok, ahol az eredmény > 60 perc
    const query = `
      SELECT DISTINCT Versenyszam
      FROM versenyekszamok
      WHERE
        CASE
          -- Óra:perc:másodperc formátum (pl. 3:33:12)
          WHEN Eredmeny REGEXP '^[0-9]:[0-5][0-9]:[0-5][0-9]$' THEN 
            TIME_TO_SEC(STR_TO_DATE(Eredmeny, '%H:%i:%s')) / 60 > 60
          -- Óra:perc formátum (pl. 08:26)
          WHEN Eredmeny REGEXP '^[0-9]:[0-5][0-9]$' THEN 
            TIME_TO_SEC(STR_TO_DATE(Eredmeny, '%H:%i')) / 60 > 60
          -- Óra:perc:másodperc,tized (pl. 09:02,6)
          WHEN Eredmeny REGEXP '^[0-9][0-9]:[0-5][0-9],[0-9]$' THEN 
            TIME_TO_SEC(STR_TO_DATE(Eredmeny, '%H:%i,%s')) / 60 > 60
          ELSE 0
        END
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("SQL hiba: ", err);
        res.status(500).send("Szerver hiba történt");
        return;
      }
      res.json(results);
    });
  });
 


  
 
  app.listen(3000, () => {
    console.log("A szerver a 3000 porton fut!");
  });
 