const jwt = require("jsonwebtoken");
const bookModel = require("../model/bookModel");
const validator = require("../validator/validator");
const mongoose = require("mongoose");

const authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];

    if (!token)
      return res
        .status(400)
        .send({ status: false, message: "You are not Logged in Please logIn" });

    let decodedToken = jwt.verify(token, "project3");
    if (!decodedToken)
      return res
        .status(400)
        .send({ status: false, message: "Token validation failed" });

    req.validUserId = decodedToken.userId;

    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const authorisation = async function (req, res, next) {
  try {
    let validUserId = req.validUserId;
    let bookId = req.params.bookId;
    let bodyData = req.body;
    let queryData = req.query;

    //  <--------Authorisation for Path Params And ReqBody--------->
    if (Object.keys(req.body) != 0 || Object.keys(req.params) != 0) {
      if (req.body.userId) {
        if (!validator.isValidObjectId(bodyData.userId))
          return res
            .status(400)
            .send({
              status: false,
              message: `This UserId (${bodyData.userId}) is invalid !!`,
            });

        if (bodyData.userId != validUserId)
          return res
            .status(403)
            .send({ status: false, message: "User is Not Authorised" });

        return next();
      }

      if (req.params.bookId) {
        if (!validator.isValidObjectId(bookId))
          return res
            .status(400)
            .send({
              status: false,
              message: `This BookId (${bookId}) is invalid !!`,
            });

        let fetchBookData = await bookModel.findById(bookId);

        if (!fetchBookData)
          return res
            .status(404)
            .send({
              status: false,
              message: `No Book Found With This (${bookId})`,
            });

        if (fetchBookData.userId != validUserId)
          return res
            .status(403)
            .send({ status: false, message: "Sorry U are not Authorised !!" });

        return next();
      }
    }

    return next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authentication, authorisation };
