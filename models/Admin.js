const mongoose = require('mongoose');

const Admin = mongoose.model('Admin', new mongoose.Schema({
  username: String,
  password: String,
  displayName: String
}), 'Admin');

module.exports = Admin;