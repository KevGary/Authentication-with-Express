var express = require('express');
var router = express.Router();

var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/users');
var Users = db.get('users');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/signup');
});

router.get('/signup', function(req, res, next){
  res.render('index', {title: "Authentication in Express", errors: [], body: ""});
});

router.post('/signup', function(req, res, next){
  req.body.email.trim();
  req.body.password.trim();
  var errors = [];
  if(req.body.email != "" && req.body.password != ""){
    Users.findOne({email: req.body.email}, function(err, data){
      if(err){
        throw err;
      }
      if(data){
        errors.push('Email is already in use');
        res.render('index', {title: "Authentication in Express", errors: errors, body: req.body})
      }else{
        req.session.username = req.body.email;
        var hash = bcrypt.hashSync(req.body.password, 8);
        Users.insert({email: req.body.email, password: hash, students: []});
        res.redirect('/home');
      }
    });
  }else{
    if(req.body.email == ""){
      errors.push('Email incomplete');
    }
    if(req.body.password == ""){
      errors.push('Password incomplete');
    }
    res.render('index', {title: "Authentication in Express", errors: errors, body: req.body});
  }
});

router.get('/signin', function(req, res, next){
  res.render('signin', {title: "Authentication in Express", errors: [], body: ""});
});

router.post('/signin', function(req, res, next){
  var errors = [];
  Users.findOne({email: req.body.email}, function(err, data){
    if(bcrypt.compareSync(req.body.password, data.password) == true){
      req.session.username = req.body.email;
      res.redirect('/home');
    }else{
      errors.push('Username/password incorrect');
      res.render('signin', {title: 'Authentication in Express', errors: errors, body: ""});
    }
    if(!data){
      errors.push('Username/password not found');
      res.render
    }
  });

});

router.get('/home', function(req, res, next){
  Users.findOne({email: req.session.username}, function(err, data){
    res.render('home', {title: "Authentication in Express", data: data.students, user: req.session.username});
  })
});

router.post('/home', function(req, res, next){
  if(req.body.logout){
    req.session = null;
    res.redirect('/signup');
  }else{
    for(key in req.body){
      console.log(req.body)
      res.redirect('/article/'+String(key));
    }
  }
});

router.get('/home/new', function(req, res, next){
  res.render('new', {title: 'Authentication in Express', errors: [], body: "", user: req.session.username});
});

router.post('/home/new', function(req, res, next){
  var errors =[];
  console.log(String(req.body.number).split('-').length)
  Users.findOne({email: req.session.username}, function(err, data){
    if(req.body.name != "" && req.body.number != "" && String(req.body.number).split('-').length == 3 && String(req.body.number).split('-').join('').split('').length == 10){
      Users.update({email: req.session.username}, {email: data.email, password: data.password, students: data.students.concat([req.body])});
      res.redirect('/home');
    }else{
      if(req.body.name == ""){
        errors.push("Name incomplete");
      }
      if(req.body.number == ""){
        errors.push("Number incomplete");
      }
      if(String(req.body.number).split('-').length != 3 || String(req.body.number).split('-').join('').split('').length){
        errors.push("Number incomplete")
      }
      res.render('new', {title: 'Authentication in Express', errors: errors, body: "", user: req.session.username})
    }
  })
});

router.get('/article/:id', function(req, res, next){
  res.render('article', {title: 'Authentication in Express', errors: [], body: "", user: req.session.username, data: req.params.id})
});

router.post('/article/:id', function(req,res, next){
  if(req.body.logout){
    req.session = null;
    res.redirect('/signup');
  }else if(req.body.home){
    res.redirect('/home');
  }
});

module.exports = router;












