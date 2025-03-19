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
  port: "3306",
  password: "",
  database: "atletikavb2017",
});
 
app.get("/", (req, res) => {
    res.send("A szerver működik!");
  });

 // 1.feladat: Válaszd ki a versenyszámok nevét, ahol a versenyszám időtartama több mint 60 perc.

 app.get("/versenyszamok-60-folott", (req, res) => {
  const query = `
      SELECT DISTINCT Versenyszam
      FROM versenyekszamok
      WHERE Eredmeny LIKE '%:%:%';
    `;
 
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Adatbázis hiba" });
    }
    res.json(results.map((row) => row.Versenyszam));
  });
});

// 2.feladat: Sajnos a szervezők kihagytak egy nemzetet, a magyarokat. Tegyétek lehetővé a kimaradt nemzetek utólagos felvitelét.
app.post("/nemzetek", (req, res) => {
  const { Nemzet } = req.body;
  const query = "INSERT INTO nemzetek (Nemzet) VALUES (?)";
 
  db.query(query, [Nemzet], (err, result) => {
    if (err) {
      console.error("Hiba a nemzet hozzáadásakor:", err);
      return res.status(500).json({ error: "Nemzet hozzáadása sikertelen" });
    }
    res.status(201).json({ id: result.insertId, Nemzet });
  });
});
 
// 3.feladat: Lesz olyan nemzet aki nem fog részt venni, tegyétek lehetővé ezek törlését.

app.delete("/nezetek/:id", (req, res) => {
  const { id } = req.params;
 
  db.query(
    "SELECT * FROM nemzetek WHERE NemzetId = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Adatbázis hiba" });
      if (results.length === 0)
        return res.status(404).json({ error: "Nemzet nem található" });
 
      db.query(
        "DELETE FROM versenyekszamok WHERE NemzetKod = ?",
        [id],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Hiba a kapcsolódó rekordok törlésekor" });
 
          db.query("DELETE FROM nemzetek WHERE NemzetId = ?", [id], (err) => {
            if (err)
              return res
                .status(500)
                .json({ error: "Nemzet törlése sikertelen" });
            res.status(204).send();
          });
        }
      );
    }
  );
});


  
 
  app.listen(3000, () => {
    console.log("A szerver a 3000 porton fut!");
  });
 