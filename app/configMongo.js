var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortly');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MongoDB connection established');
});

var urlSchema = mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});

var userSchema = mongoose.Schema({
  username: String,
  password: String
});

var Urls = mongoose.model('Urls', urlSchema);
var Users = mongoose.model('Users', userSchema);

module.exports.Urls = Urls;
module.exports.Users = Users;