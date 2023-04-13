const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Modules/user')

const secretKey = 'mysecretkey';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization)
  if (!authorization) {
    return res.status(401).send({ error: "login first" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, secretKey, (err, payload) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ error: "loggin second" });
    }
    const { _id } = payload;
    User.findById(_id).then(userdata => {
      req.user = userdata;
      next();
    }).catch(err => {
      console.log(err);
      return res.status(401).json({ error: "loggin second" });
    });
  })
}
