const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");

const nameRegex = /^[a-zA-Z ]{2,45}$/;
const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
const mobileRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/;

///^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,15}$/;
const pincodeRegex = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/;

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = function (request) {
  return Object.keys(request).length > 0;
};

const isvalidTitle = function (title) {
  return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
};

const createUser = async function (req, res) {
  try {
    const userData = req.body;
    let { title, name, phone, email, password, address } = userData;

    //********************* Validation *****************/

    if (!isValidRequestBody(userData)) { return res.status(400).send({ status: false, message: "No input by User ...." });  }
    if (!isValid(title)) {return res.status(400).send({ status: false, message: "Title is required. " }); }

    if (!isValid(name)) {return res.status(400).send({ status: false, message: "Name  is required" });}

    if (!isValid(phone)) {return res.status(400).send({ status: false, message: "Phone Number is required" }); }
    
   if (!isValid(email)) { return res.status(400).send({ status: false, message: "Email  is required" });}
    
   if (!isValid(password)) {return res.status(400).send({ status: false, message: "password  is required" }); }

  //  if(address && (typeof address === 'object') && (address !== null)) {return res.status(400).send({status:false, message:"Enter the address in the object form"})}
   
    if (address && !isValid(address)) { return res.status(400).send({ status: false, message: "Address  is required" });}

    if (address && !pincodeRegex.test(address.pincode)) { return res.status(400).send({ status: false, message: "pincode  must be of 6 Digits" });}

    if (!isvalidTitle(title)) { return res.status(400).send({ status: false, message: "Title shoud be among Mr,Mrs, Miss" }); }

    if (!nameRegex.test(name)) { return res.status(400).send({ status: false, message: "Not valid Name" }); }
    if (!emailRegex.test(email)) {return res.status(400).send({ status: false, message: "please provide a valid email Address." }); }
    if (!mobileRegex.test(phone)) { return res.status(400).send({ status: false,  message: "please provide  a valid 10 digits phone number starts from 6-9."});}
    if (!passwordRegex.test(password)) { return res.status(400).send({ status: false, message:"Use the strong password with min length 8 and max length 15. And password should include atleast one capital letter and one small letter" }); }

    const duplicateEmail = await UserModel.findOne({ email });
    if (duplicateEmail){return res.status(400).send({ status: false, message: "Email address alerady exists. please use another email address"});}
    
    const duplicatephone = await UserModel.findOne({ phone });
    if (duplicatephone){return res.status(400).send({ status: false, message: "phone number alerady exists. please use another phone number"});}
      
    let newUser = await UserModel.create(userData);
    
    return res.status(201).send({ status: true, message: 'Success', data: newUser });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

// ///////////////////////////////[Login User]//////////////////////////////////////////////////////////////////////////

const loginUser = async function (req, res) {
  try {
    const loginData = req.body;
    const { email, password } = loginData;

    if (!isValidRequestBody(loginData)) {
      return res.status(400).send({status: false, message: "Invalid request, please enter your email and password"});}

    if (!isValid(email))return res.status(400).send({ status: false, message: "Email id required" });

    if (!isValid(password)) {return res.status(400).send({ status: false, message: "password must be present" });}

    const user = await UserModel.findOne({ email: email, password: password });

    if (!user) {return res.status(401).send({ status: false, msg: "Invalid credentials" }); }
    let token = jwt.sign({userId: user._id.toString(),iat: Math.floor(Date.now() / 1000) },"Group33-book/Management", {expiresIn: '1h'});
     res.setHeader("x-api-key", token);
    
    res.status(200).send({ status: true, msg: "User successfully logged In", data: token });

    } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};
module.exports = { createUser, loginUser }

// Math.floor(Date.now() / 1000) + 10 * 60 * 60
