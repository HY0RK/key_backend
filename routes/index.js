var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var db;
const { CommandCursor } = require('mongodb');
const school = "StThomasMoore"

mongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
  if (err) throw err;
  db = client.db(school)

})
// mongoClient.connect("mongodb+srv://hyork:Ypy06XWxfo1fbs2Q@curriculumapp.2dhuk.mongodb.net/scrappedData?retryWrites=true&w=majority", { useUnifiedTopology: true }, function(err, client) {
//   if (err) throw err;
//   db = client.db('keyDB')
// })
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/keys", function(req, res, next) {
  db.collection("keys").find().toArray(function (err, result) {
    if (err) throw err
    db.close
    res.status(200).json(result)
  })
})
router.get("/keyTypes", function(req, res, next) {
  db.collection("admin").find().toArray((err, result) => {
    if (err) throw err;
    db.close;
    res.status(200).json(result[0].keyTypes)
  })
})
router.post("/updateKeyTypes", (req, res, next) => {
  const newValues = {
    $set : {
      keyTypes: JSON.parse(req.body.newKeyTypes)
    }
  }
  db.collection("admin").updateOne({}, newValues, err => {
    if (err) throw err
    else res.status(200).json({"response":"Key Types Updated"})
  })
  console.log(req.body.newKeyTypes)
})
router.post("/login", function( req, res, next) {
  const query = {password: req.body.passphrase};
  db.collection("users").find(query).toArray(function(err, result) {
    if (err) throw err;
    if (result.length > 0) {
      const resJson = {"login":true, "user":result[0].userType}
      res.status(200).json(resJson)
    } else {
      res.status(418).json({"response":"passphrase not accepted"})
    }
  })
})

router.post("/archive", (req, res, next) => {
  const toArchive = JSON.parse(req.body.toArchive)
  db.collection("keyHistory").insertOne(toArchive);
  res.status(201)
})

router.post("/keyHistory", function(req, res, next) {
  const query = {key_id: req.body._id};
  db.collection("keyHistory").find(query).toArray((err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.status(200).json({"response":result});
    } else {
      res.status(200).json({"response":"No key history"})
    }
  })
}) //Implement the backend for the keyHistory code

router.post("/addKey", function(req, res, next) {
  const toAdd = JSON.parse(req.body.toAdd)
  const tempKey = {
    type:toAdd.type,
    number:toAdd.number,
    owner:toAdd.owner,
    issueDate:toAdd.issueDate,
    returnDate:toAdd.returnDate,
  }
  db.collection("keys").insertOne(tempKey, (err, response) => {
    if (err) throw err;
    res.status(201).json({"key_id":response.insertedId})
  })
  
  
})
router.post("/updateKey", (req, res, next) => {
  const toUpdate = JSON.parse(req.body.toUpdate)
  const updatedKey = toUpdate.updatedKey
  const query = {_id: ObjectID(updatedKey._id)}
  const newValues = {
    $set : {
      owner: updatedKey.owner,
      type: updatedKey.type,
      issueDate: updatedKey.issueDate,
      number: updatedKey.number
    }
  }
  db.collection("keys").updateOne(query, newValues, (err) => {
    if (err) throw err;
  })
})



router.post('/issueKey', function(req, res, next) {
  const toUpdate = JSON.parse(req.body.toUpdate);
  const _id = toUpdate._id;
  
  const query = {_id: ObjectID(_id)};
  console.log(query)
  const newValues = {
    $set : {
      owner: toUpdate.newOwner, 
      issueDate: new Date().toDateString(),
      returnDate: ""
    }
  }
  db.collection("keys").updateOne(query, newValues, function(err) {
    if (err) throw err;
    console.log(toUpdate._id + ": Issued")
    db.close
  })
  res.status(200).json({"err":null, "updated":toUpdate._id})
})

router.post('/returnKey', function(req, res, next) {
  const toUpdate= JSON.parse(req.body.toUpdate);
  const query = {_id: ObjectID(toUpdate._id)}
  const newValues = {$set : {owner : "", returnDate: new Date().toDateString()}}
  db.collection("keys").updateOne(query, newValues, function(err) {
    if (err) throw err;
    console.log(toUpdate._id + ": Returned")
  })
  res.status(200).json({"err":null, "returned":toUpdate._id})
})


module.exports = router;
