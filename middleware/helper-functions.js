const { validationResult } = require("express-validator");
const { User, Show } = require("../models");

async function getSingleUser(req, res, next) {
  req.singleUser = await User.findByPk(req.params.id);
  next();
}

async function getSingleShow(req, res, next) {
  req.singleShow = await Show.findByPk(req.params.id);
  next();
}

async function checkErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  next();
}

module.exports = { getSingleUser, getSingleShow, checkErrors };
