var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var User = require('../app/configMongo').Users;
var Link = require('../app/configMongo').Urls;

// var db = require('../app/config');

// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, results) {
    if (err) {
      console.log(err);
    }  
    res.status(200).send(results);
  });
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }
  
  Link.findOne( { url: uri }, function(err, link) {

    if (err) {
      console.log(err);
    } else if (link) {
      console.log('link exists already:======== ', link);
      res.status(200).send(link);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });

        newLink.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log('saved new link ==============');
            res.status(200).send(newLink);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ username: username }, function(err, user) {
    if (err ) {
      console.log(err);
    } else if (user) {
      
      
      if (password === user.password ) {
        console.log('password validated for: ', user);
        util.createSession(req, res, user);
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');  
    }
    
  });
  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       });
  //     }
  //   });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({'username': username }, function(err, user) {
    if (err) {
      console.log('error ===========***', err);
    } else if (user ) {
      console.log('found this user in database ===========>', user);
      res.redirect('/signup');  
    } else {
      console.log('user is not in database ===========>', user);
      var newUser = new User({ username: username, password: password});
      newUser.save(function(err) {
        if (err ) {
          console.log('error ===========///', err);
        } else {
          console.log('user inserted in database ===========>', newUser);
          util.createSession(req, res, newUser);
        }
      });  
    }

  });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           Users.add(newUser);
  //           util.createSession(req, res, newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   });
};

exports.navToLink = function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};