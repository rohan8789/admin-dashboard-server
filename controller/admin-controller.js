const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require('axios');

const Admin = require("../model/admin");

const secretkey = "6LcYsgEqAAAAAEFXs9rcE-6FGsgd2795hmf4lvOv";

let count=3;


const ChangePassword = async (req, res) =>{
  const userId = req.params.userId;
  const {password, repassword} = req.body;
  let existingUser;
  try{
    existingUser = await Admin.findById(userId);
  }catch(err){
    return res.status(500).json({message:"something went wrong while finding user-id"});
  }
  if(!existingUser){
    return res.status(401).json({ message: "cannot find user by this id" });
  }
  console.log(existingUser);
  console.log("userId", userId)
  if(password !== repassword){
    return res.status(400).json({message:"password mis-match"});
  }
  let encryptPwd;
  try {
    encryptPwd = await bcrypt.hash(password, 12);
    existingUser.password = encryptPwd;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "password encryption failed" });
  }

  try {
    await existingUser.save(); 
  } catch (err) {
    return res.status(500).json({ message: "Failed to save user after password change" });
  }
  return res.status(201).json({message:"Password successfully changed. Try logging in..."});
}





const ResetPwd = async (req, res) => {
  console.log("Hit", req.body);
  const {email} = req.body;
  let existingAdmin;
  try{
    existingAdmin = await Admin.findOne({email:email});
  }catch(err){
    return res.status(500).json({message:"Error while finding email"})
  }
  if(!existingAdmin){
    return res.status(401).json({message:"email does not exist"})
  }
  if(email !== existingAdmin?.email){
    return res.status(401).json({message:"Not a valid email-Id"})
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingAdmin._id, email: existingAdmin.email },
      "rohansingh",
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong while token creation in login.",
    });
  }
  return res.status(201).json({userId:existingAdmin._id, resetToken:token});
}



const loginAdmin = async (req, res) => {
 
  count--;
  console.log(count);
  if(count==0){
    count=3;
    return res.status(401).json({message:"Maximum login attempt exceeded. Try after some time.", disabled:true});
  }
  const { name, email, password, captcha } = req.body;
  let checkAdmin;
  try {
    checkAdmin = await Admin.countDocuments({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({message:"Something went wrong while checking document count", count:count})
  }
  let success=false;
  try{
    let verifyurl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${captcha}`;
    const res = await axios.post(verifyurl);
    success=res?.data?.success;
  }catch(err){
    return res.status(500).json({message:"failed while verifying captcha"})
  }
  if(!success){
    return res.status(401).json({message:"Captcha verification failed", count:count});
  }

  if (checkAdmin === 1) {
    let existingAdmin = null;
    try {
      existingAdmin = await Admin.findOne({ email: email });
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Something went wrong while finding email id", count:count });
    }
    if (!existingAdmin) {
      return res.status(401).json({ message: "Admin with this email id does not exist", count:count });
    }
    let isValidPwd = false;
    try {
      isValidPwd = await bcrypt.compare(password, existingAdmin.password);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong while comparing password", count:count });
    }
    if (isValidPwd === false) {
      return res.status(500).json({ message: "Invalid Password", count:count });
    }

    let token;
    try {
      token = jwt.sign(
        { userId: existingAdmin._id, email: existingAdmin.email },
        "rohansingh",
        { expiresIn: "1h" }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Something went wrong while token creation in login.", count:count
      });
    }
    count=3;
    return res
      .status(201)
      .json({
        name: existingAdmin.name,
        userId: existingAdmin?._id,
        token: token,
      });
  }

  let encryptPwd;
  try {
    encryptPwd = await bcrypt.hash(password, 12);
  } catch (err) {
    return res.status(500).json({ message: "password encryption failed" });
  }
  let createdAdmin = new Admin({ name, email, password: encryptPwd });
  try {
    await createdAdmin.save();
  } catch (err) {
    return res.status(500).json({ message: "Creating Admin failed" });
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdAdmin._id, email: createdAdmin.email },
      "rohansingh",
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong while token creation in login.",
    });
  }
  count=3;
  return res
    .status(201)
    .json({
      name: createdAdmin.name,
      userId: createdAdmin?._id,
      token: token,
    });
};

module.exports = { loginAdmin, ResetPwd, ChangePassword };
