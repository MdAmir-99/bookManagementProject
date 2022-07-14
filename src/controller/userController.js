const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const validator = require("../validator/validator");

const createUser = async function (req, res) {
  try {
    let requestBody = req.body;
    let { title, name, phone, email, password, address } = requestBody;
    let { street, city, pincode } = address;

    // <----------BODY VALIDATION------------->
    if (!validator.isValidRequestBody(requestBody))
      return res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters. Please provide user details",
        });

    // <-------------TITLE VALIDATION------------->
    if (!validator.isValidField(title))
      return res
        .status(400)
        .send({ status: false, message: "title is required" });

    if (!validator.isValidUserTitle(title))
      return res
        .status(400)
        .send({
          status: false,
          message: `Title should be among Mr, Mrs and Miss`,
        });

    // <-------------NAME VALIDATION------------>
    if (!validator.isValidField(name))
      return res
        .status(400)
        .send({ status: false, message: "name is required" });

    if (!validator.isValidName(name))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid name " });

    // <------------PHONE VALIDATION------------>
    if (!validator.isValidField(phone))
      return res
        .status(400)
        .send({ status: false, message: "phone number is required" });

    if (!validator.isValidMobile(phone))
      return res
        .status(400)
        .send({ status: false, message: `${phone} is not valid` });

    // <----------Check Phone no. is Exist in Db or not------------->
    const isphoneAlreadyUsed = await userModel.findOne({ phone });
    if (isphoneAlreadyUsed)
      return res
        .status(400)
        .send({
          status: false,
          message: `${phone} phone no. is already registered`,
        });

    // <------------EMAIL VALIDATION--------------->
    if (!validator.isValidField(email))
      return res
        .status(400)
        .send({ status: false, message: "email is required" });

    if (!validator.isValidEmail(email.trim()))
      return res
        .status(400)
        .send({ status: false, message: `${email} is not valid email` });

    // <----------Check Email is Exist in Db or not------------->
    const isEmailAlreadyUsed = await userModel.findOne({ email });
    if (isEmailAlreadyUsed)
      return res
        .status(400)
        .send({
          status: false,
          message: `${email} email is already registered`,
        });

    // <---------PASSWORD VALIDATION------------>
    if (!validator.isValidField(password))
      return res
        .status(400)
        .send({ status: false, message: "password is required" });

    if (!(password.length >= 8 && password.length <= 15))
      return res
        .status(400)
        .send({
          status: false,
          message: "password length should be greter then 8 and less than 15",
        });

    if (!validator.isValidPassword(password))
      return res
        .status(400)
        .send({
          status: false,
          message: "password should contain atleast 1 letter & 1 number",
        });

    // <----------------ADDRESS VALIDATION------------------>

    if (address) {
      // <-----------------ADDRESS VALIDATION - STREET------------->
      if (!validator.isValidField(street))
        return res
          .status(400)
          .send({ status: false, message: "street is required" });

      if (!validator.isValidStreet(street))
        return res
          .status(400)
          .send({ status: false, message: "street name is in invalid format" });

      // <----------ADDRESS VALIDATION - CITY-------------->
      if (!validator.isValidField(city))
        return res
          .status(400)
          .send({ status: false, message: "city is required" });

      if (!validator.isValidName(city))
        return res
          .status(400)
          .send({ status: false, message: "Enter valid city name" });

      // <-----------ADDRESS VALIDATION - PINCODE---------->
      if (!validator.isValidField(pincode))
        return res
          .status(400)
          .send({ status: false, message: "pincode is required" });

      if (!validator.isValidPincode(pincode))
        return res
          .status(400)
          .send({ status: false, message: "Enter valid pincode" });
    }

    let userSaved = await userModel.create(requestBody);
    return res
      .status(201)
      .send({
        status: true,
        message: "user successfully created",
        data: userSaved,
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// <===================UserLogin Api=========================>

const loginUser = async function (req, res) {
  try {
    let requestBody = req.body;
    let { email, password } = requestBody;

    // <-----------Check Email && Password Exist in reqBody------------>
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Email is required!" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required!" });
    }

    // <---------Validation for Email------------>
    if (!validator.isValidEmail(requestBody.email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is not valid" });
    }

    // <------------Validation for Password----------->
    if (!validator.isValidPassword(requestBody.password)) {
      return res
        .status(400)
        .send({ status: false, message: "Password is not valid" });
    }

    // <----------Check User exist in db or not with login crediential------------>
    let validUser = await userModel.findOne({
      email: requestBody.email,
      password: requestBody.password,
    });
    if (!validUser) {
      return res
        .status(401)
        .send({ status: false, message: "Email or Password is not correct" });
    }

    // <-------generate JWT Token and valid for 100 Minutes--------------->
    let payload = {
      userId: validUser._id,
      exp: Math.floor(Date.now() / 1000) + (100 * 60),
      iat: Date.now() / 1000,
    };
    let token = jwt.sign(payload, "project3");
    res.setHeader("x-api-key", token);
    res
      .status(200)
      .send({
        status: true,
        message: "user logged in successfully",
        data: {
          token,
          userId: validUser._id,
          exp: payload.exp,
          iat: payload.iat,
        },
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createUser, loginUser };
