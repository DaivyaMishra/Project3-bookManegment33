const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");

const nameRegex = /^[a-zA-Z ]{2,45}$/;
const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
const mobileRegex = /^[6-9]\d{9}$/;
const passwordRegex =
  /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,15}$/;
const pincodeRegex = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/;

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = function (request) {
  return Object.keys(request) > 0;
};

const isvalidTitle = function (title) {
  return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
};
const createUser = async function (req, res) {
  try {
    const userData = req.body;
    let { title, name, phone, email, password, address } = userData;

    //********************* Validation *****************/

    if (!isValidRequestBody(userData)) {
      return res
        .status(400)
        .send({ status: false, message: "No input  by User ...." });
    }
    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title is required. " });
    }

    if (!isValid(name)) {
      return res
        .status(400)
        .send({ status: false, message: "Name  is required" });
    }
    if (!isValid(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Name  is required" });
    }
    if (!isValid(name)) {
      return res
        .status(400)
        .send({ status: false, message: "phone Number  is required" });
    }
    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email  is required" });
    }
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password  is required" });
    }
    if (!isValid(address)) {
      return res
        .status(400)
        .send({ status: false, message: "Address  is required" });
    }

    if (!pincodeRegex.test(address.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "pincode  must be of 6 Digits" });
    }

    if (!isvalidTitle(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title shoud be among Mr,Mrs, Miss" });
    }

    if (!nameRegex.test(name)) {
      return res.status(400).send({ status: false, message: "Not valid Name" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        status: false,
        message: "please provide  a valid email Address.",
      });
    }
    if (!mobileRegex.test(phone)) {
      return res.status(400).send({
        status: false,
        message:
          "please provide  a valid 10 digits phone number starts shoud be 6-9.",
      });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        status: false,
        message:
          "please provide  a strong  enough.please provide a password of Min length of 8 char and Uppercase",
      });
    }

    const duplicateEmail = await UserModel.findOne({ email });
    if (duplicateEmail)
      return res.status(400).send({
        status: false,
        message: "Email address alerady exists . plz use another email address",
      });

    const duplicatephone = await UserModel.findOne({ phone });
    if (duplicatephone)
      return res.status(400).send({
        status: false,
        message: "phone number alerady exists . plz use another phone number",
      });

    let newUser = await UserModel.create(userData);
    return res
      .status(201)
      .send({ status: true, msg: "succesfully run", data: newUser });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

const loginUser = async function (req, res) {
  try {
    const loginData = req.body;
    const { email, password } = loginData;

    if (!isValidRequestBody(loginData)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid req, please login details" });
    }

    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "Email id require" });

    if (!emailRegex.test(email)) {
      return res.status(400).send({
        status: false,
        message: "Email should be a valid e-mail address",
      });
    }
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password must be present" });
    }

    const user = await UserModel.findOne({ email: email, password: password });

    if (!user) {
      return res.status(401).send({ status: false, msg: "Invalid login" });
    }
    let token = jwt.sign(
      {
        userId: isValid._id.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "Group33-book/Management"
    );
    res.setHeader("x-api-key", token);
    res
      .status(200)
      .send({ status: true, msg: "User successfully", data: token });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};
module.exports = { createUser, loginUser };
