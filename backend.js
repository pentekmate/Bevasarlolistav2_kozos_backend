const express = require('express')
const mysql = require('mysql')
const app = express()
const port = 3000
const cors = require('cors')
const bcrypt = require('bcryptjs');
var connection

function kapcsolat() {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bevasarlolistav2'
  })
}
app.use(express.static('Kepek'))
app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
  res.send('Hello World!')
})
// Összes listalekérése
app.get('/felhasznalo', (req, res) => {
  kapcsolat()

  connection.query('SELECT * from felhasznalo', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
app.post('/felhasznaloletezik', async (req, res) => {
  kapcsolat()
  connection.query('SELECT * FROM felhasznalo where felhasznalo_nev="' + req.body.bevitel1 + '"', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      if (rows.length > 0) {
        res.send(true)
      }
      else {
        res.send(false)
      }
    }
  })
  connection.end()

})
//Összes felhasználó adatainak lekérése

//Login.jsben használt, belépésnél összehasonlítja az adatokat
app.post('/login', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM `felhasznalo` WHERE `felhasznalo_nev` ="' + req.body.bevitel1 + '" ;', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      if (rows.length > 0) {
        const JelszoVissza = bcrypt.compare(req.body.bevitel2, rows[0].felhasznalo_jelszo)
          .then((talalt) => {
            if (talalt) {
              res.send(true)
            }
            else {
              res.send(false)
            }
          })
      }
      else {
        res.send(false)
      }
    }

  })
  connection.end()
})

//Regisztrációs adatokat visz fel az adatbázisba

//Regisztracio.jsben használom
app.post('/regisztracio', async (req, res) => {
  kapcsolat()

  const jelszo = await bcrypt.hash(req.body.bevitel2, 10)
  connection.query("INSERT INTO `felhasznalo` VALUES (NULL, '" + req.body.bevitel1 + "' ,'" + jelszo + "',CURDATE(),'1',0);", function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
//A Lista_input.jsben lévő 2tömb (data,segeddata) adataid fetcheli fel adatbázisba
//Lista_input.jsben használom
app.post('/tartalomfel', (req, res) => {
  kapcsolat()

  connection.query('INSERT INTO `listak` VALUES (NULL, "' + req.body.bevitel1 + '",CURDATE(),NULL, "' + req.body.bevitel3 + '","' + req.body.bevitel2 + '",0,0);', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

//Lekérdezi a felhasználó által létrehozott listákat

//Profilom.jsben használom
//Felvitel.js


app.post('/felhasznalolistainincskesz', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM listak WHERE listak_felhasznaloid=' + req.body.bevitel1 + ' and listak_kesz=0 order by listak_datum asc', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

app.post('/felhasznalolistaikesz', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM listak WHERE listak_felhasznaloid =' + req.body.bevitel1 + ' and listak_kesz=1 order by listak_datum asc', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

//Listat töröl


//Szerkeszt.js

app.delete('/regilistatorles', (req, res) => {
  kapcsolat()

  connection.query('DELETE FROM `listak` WHERE listak_datum < (SELECT CURDATE() - INTERVAL 3 MONTH FROM `listak` LIMIT 1);', (err, rows, fields) => {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

//Lista arat tölti fel utólagosan a Szerkeszt.jsben

//Szserkeszt.js
app.post('/arfel', (req, res) => {
  kapcsolat()

  connection.query('UPDATE listak SET listak_ar= "' + req.body.bevitel3 + '" WHERE listak_id = "' + req.body.bevitel4 + '"', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

app.post('/listabefejezese', (req, res) => {
  kapcsolat()

  connection.query('UPDATE listak SET listak_ar= "' + req.body.bevitel3 + '",listak_keszdatum=CURDATE(), listak_kesz=1 WHERE listak_id = "' + req.body.bevitel4 + '"', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})


app.get('/aktualis', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM `listak` WHERE listak_datum > CURRENT_DATE();', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
//Listat töröl


//Szerkeszt.js
app.delete('/listatorles', (req, res) => {
  kapcsolat()

  connection.query('DELETE FROM listak WHERE listak_id = "' + req.body.bevitel5 + '"', (err, rows, fields) => {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/felhasznaloossz', (req, res) => {
  kapcsolat()

  connection.query('SELECT count(listak_nev) as osszes  FROM `listak` WHERE `listak_felhasznaloid` = ' + req.body.bevitel1 + ';', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows[0])
      res.send(rows)

    }
  })
  connection.end()

})
//regisztráciodatum
app.post('/regisztraciodatum', (req, res) => {
  kapcsolat()

  connection.query("SELECT YEAR(`felhasznalo_regisztrdatum`)as'datum',MONTH(felhasznalo_regisztrdatum) as 'honap',DAY(felhasznalo_regisztrdatum) as 'nap'  FROM `felhasznalo` WHERE `felhasznalo_id`=" + req.body.bevitel1 + "", function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/honapok', (req, res) => {
  kapcsolat()

  connection.query('SELECT MONTHNAME(listak_datum) AS honap, SUM(listak_ar) AS ar FROM listak WHERE listak_felhasznaloid =' + req.body.bevitel1 + ' GROUP BY YEAR(listak_datum), MONTH(listak_datum);', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
app.post('/atlagkoltes', (req, res) => {
  kapcsolat()

  connection.query('SELECT avg(listak_ar) as "atlag" FROM `listak` WHERE listak_felhasznaloid=' + req.body.bevitel1 + ' and listak_kesz=1;', (err, rows, fields) => {
    if (err) throw err

    console.log(rows)
    res.send(rows)
  })
  connection.end()
})
app.post('/maxkoltes', (req, res) => {
  kapcsolat()

  connection.query('SELECT MAX(listak_ar) as "max" FROM `listak` WHERE listak_felhasznaloid="' + req.body.bevitel1 + '" and listak_kesz=1;', (err, rows, fields) => {
    if (err) throw err

    console.log(rows)
    res.send(rows)
  })
  connection.end()
})
app.get('/felhasznalonevek', (req, res) => {
  kapcsolat()

  connection.query('SELECT felhasznalo_nev FROM felhasznalo;', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
app.post('/felhasznalonevfrissites', (req, res) => {
  kapcsolat()

  connection.query('UPDATE `felhasznalo` SET `felhasznalo_nev`="' + req.body.bevitel1 + '" WHERE `felhasznalo_id`=' + req.body.bevitel2 + ';', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/idlekeres', (req, res) => {
  kapcsolat()

  connection.query('SELECT `felhasznalo_id` FROM `felhasznalo` WHERE `felhasznalo_nev`="' + req.body.bevitel1 + '";', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

app.get('/felhasznalokepek', (req, res) => {
  kapcsolat()

  connection.query('select * from kepek', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
app.post('/profkepfrissites', (req, res) => {
  kapcsolat()

  connection.query('UPDATE `felhasznalo` SET `felhasznalo_kep_id`=' + req.body.bevitel1 + ' WHERE `felhasznalo_id`=' + req.body.bevitel2 + ';', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {

      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/profilkep', (req, res) => {
  kapcsolat()

  connection.query('SELECT kepek.kepek_nev,kepek_id FROM `felhasznalo` inner JOIN kepek ON kepek.kepek_id=felhasznalo_kep_id where felhasznalo_id=' + req.body.bevitel1 + ';', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      //console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})

app.delete('/profiltorles', (req, res) => {
  kapcsolat()

  connection.query('DELETE FROM `felhasznalo` WHERE `felhasznalo_id` =' + req.body.bevitel1 + '', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.delete('/listatorles', (req, res) => {
  kapcsolat()

  connection.query('DELETE FROM listak WHERE listak_id = "' + req.body.bevitel5 + '"', (err, rows, fields) => {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/listakarszerintnov', (req, res) => {
  kapcsolat()

  connection.query('SELECT * from listak where listak_felhasznaloid = "' + req.body.bevitel1 + '" order by listak_ar ASC', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})

app.post('/listakarszerintcsokk', (req, res) => {
  kapcsolat()

  connection.query('SELECT * from listak where listak_felhasznaloid = "' + req.body.bevitel1 + '" order by listak_ar DESC', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})

app.post('/listakdatumszerintnov', (req, res) => {
  kapcsolat()

  connection.query('SELECT * from listak where listak_felhasznaloid = "' + req.body.bevitel1 + '" order by listak_datum ASC', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})

app.post('/listakdatumszerintcsokk', (req, res) => {
  kapcsolat()

  connection.query('SELECT *  from  listak where listak_felhasznaloid = "' + req.body.bevitel1 + '" order by listak_datum DESC', (err, rows, fields) => {
    if (err) throw err


    res.send(rows)
  })
  connection.end()
})
app.post('/felhasznalolistainincskesz3', (req, res) => {
  kapcsolat()

  connection.query('SELECT * FROM listak WHERE listak_felhasznaloid=' + req.body.bevitel1 + ' and listak_kesz=0 order by listak_datum asc LIMIT 5', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/felhasznaloosszeskesz', (req, res) => {
  kapcsolat()

  connection.query('SELECT felhasznalo_keszlistakszama FROM felhasznalo WHERE felhasznalo_id=' + req.body.bevitel1 + ' ', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/keszlistafrissites', (req, res) => {
  kapcsolat()

  connection.query('UPDATE `felhasznalo` SET `felhasznalo_keszlistakszama`=' + req.body.bevitel1 + ' WHERE `felhasznalo_id`=' + req.body.bevitel2 + ';', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {

      console.log(rows)
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/baratkereses', (req, res) => {
  kapcsolat()

  connection.query('SELECT `felhasznalo_id`, `felhasznalo_nev`, `felhasznalo_kep_id`  FROM `felhasznalo` WHERE `felhasznalo_id` like "%'+req.body.bevitel1+'%";', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/baratokinfo', (req, res) => {
  kapcsolat()

  connection.query('SELECT fhb_baratok_id,fhb_baratjelolesek_id  FROM `felhasznalo_baratinformacio` WHERE `fhb_felhasznalo_id` = "'+req.body.bevitel1+'";', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      res.send(rows)
    }
  })
  connection.end()

})
app.post('/baratjeloles', (req, res) => {
  kapcsolat()

  connection.query('INSERT INTO `felhasznalo_baratinformacio` VALUES (NULL,'+req.body.bevitel1+','+req.body.bevitel2+',"")', function (err, rows, fields) {
    if (err)
      console.log(err)
    else {
      res.send(rows)
    }
  })
  connection.end()

})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
