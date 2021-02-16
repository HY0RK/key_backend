var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var db;
const { CommandCursor } = require('mongodb');


mongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
  if (err) throw err;
  db = client.db('keyDB')

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
  

router.post("/addKey", function(req, res, next) {
  const toAdd = JSON.parse(req.body.toAdd)
  console.log(toAdd)
  const tempKey = {
    type:toAdd.type,
    number:toAdd.number,
    owner:toAdd.owner,
    issueDate:toAdd.issueDate,
    returnDate:toAdd.returnDate,
  }
  console.log(tempKey)
  const result = db.collection("keys").insertOne(tempKey);
  console.dir(result)
})

router.post('/issueKey', function(req, res, next) {
  const toUpdate = JSON.parse(req.body.toUpdate);
  const _id = toUpdate._id;
  
  const query = {_id: ObjectID(_id)};
  console.log(query)
  const newValues = {$set : {owner: toUpdate.newOwner, issueDate: new Date().toDateString()}}
  db.collection("keys").updateOne(query, newValues, function(err, res) {
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
  db.collection("keys").updateOne(query, newValues, function(err, res) {
    if (err) throw err;
    console.log(toUpdate._id + ": Returned")
  })
})


module.exports = router;
