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



exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ username: username }, function(err, user) {
    if (err ) {
      console.log(err);
    } else if (user) {
      util.comparePassword(password, user.password, function(isMatch) {

        if ( isMatch ) {
          console.log('password validated for: ', user);
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
      
      
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
      util.hashPassword(password, function(hash) {
        var newUser = new User({ username: username, password: hash});
        newUser.save(function(err) {
          if (err ) {
            console.log('error ===========///', err);
          } else {
            console.log('user inserted in database ===========>', newUser);
            util.createSession(req, res, newUser);
          }
        }); 

      });
      
    }

  });


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
        var code = util.getUrlShortCode(uri);
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          code: code,
          visits: 0
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

exports.navToLink = function(req, res) {
  console.log(req.params[0]);
  Link.findOne({ code: req.params[0] }, function(err, link) {
    if (err) {
      console.log('1===', err);
    } else if ( !link) { 
      res.redirect('/');  
    } else {
      link.visits++;
      link.save(function(err, updatedLink) {
        if (err) {
          console.log('2===', err);
        } else {
          res.redirect(updatedLink.url);  
        }  
      });
    }
  });
  
};