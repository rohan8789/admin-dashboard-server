const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const nodemailer = require("nodemailer");

const Admin = require("../model/admin");
const Copy = require("../model/copy");
let counter=3;


const getAdminDetails = async (req, res) => {
  const adminId = req.params.adminId;
  console.log("This route is hit", req.params);
  let getAdmin;
  try{
    getAdmin = await Admin.findById({_id:adminId}, '-password');
  }catch(err){
    console.log("err", err);
    return res.status(500).json({message:"something went wrong while fetching admin details"});
  }
  if(!getAdmin){
    console.log("Admin with this id does not exist");
    return res.status(201).json({message:"Admin with this id does not exist"});
  }
  const countPairs = Object.keys(getAdmin.toObject()).length;
  console.log(getAdmin);
  console.log(countPairs);//6
  if(countPairs<10){
    return res.status(401).json({});
  }
  return res.status(201).json({admin:getAdmin});
}



const ChangePassword = async (req, res) => {
  const userId = req.params.userId;
  const {currPassword, password, repassword } = req.body;
  let existingUser;
  try {
    existingUser = await Admin.findById(userId);
  } catch (err) {
    return res.status(500).json({ message: "something went wrong while finding user-id" });
  }
  if (!existingUser) {
    return res.status(401).json({ message: "cannot find user by this id" });
  }
  console.log(existingUser);
  console.log("userId", userId);

  let compareCurrPassword;
  try {
    compareCurrPassword = await bcrypt.compare(currPassword, existingUser.password);
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong while comaparing password" });
  }
  // console.log("Comparison Result", compareCurrPassword);
  if (!compareCurrPassword) {
    return res.status(403).json({ message: "Your current password did not match existing password" });
  }


  if (password !== repassword) {
    return res.status(400).json({ message: "password mis-match" });
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
    return res
      .status(500)
      .json({ message: "Failed to save user after password change" });
  }
  return res
    .status(201)
    .json({ message: "Password successfully changed. Try logging in..." });
};

const ResetPwd = async (req, res) => {
  const { email } = req.body;
  let existingAdmin;
  try {
    existingAdmin = await Admin.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({ message: "Error while finding email" });
  }
  if (!existingAdmin) {
    return res.status(401).json({ message: "email does not exist" });
  }
  if (email !== existingAdmin?.email) {
    return res.status(401).json({ message: "Not a valid email-Id" });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "rohansinghrp180@gmail.com",
      pass: "cojt nsgg fsok xbby",
    },
  });

  const resetURL = `http://localhost:3000/change-password/${existingAdmin?._id}`;

  const mail = {
    from: "rohansinghrp180@gmail.com",
    to: "rohansingh.cs4835@gmail.com",
    Subject: "Password Reset",
    text: `You have requested a password reset for your account. Please click the following link to reset your password within 1 hour:\n${resetURL}\n\nIf you did not request a password reset, please ignore this email.`,
  };

  transporter.sendMail(mail, (err, info) => {
    console.log("Hellllo");
    if (err) {
      console.log("Err", err);
      return res.status(500).json({ message: "Error sending email" });
    } else {
      console.log(info.response, "server is ready");
      return res
        .status(200)
        .json({ message: "Password reset instructions sent to your email" });
    }
  });

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
  return res.status(201).json({ userId: existingAdmin._id, resetToken: token });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  let checkAdmin;
  try {
    checkAdmin = await Admin.countDocuments({});
  } catch (err) {
    return res.status(500).json({message: "Something went wrong while checking document count"});
  }
  if (checkAdmin === 0) {
    let existingAdmin;
    try {
      existingAdmin = await Copy.findOne({ email: email });
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong while finding admin email" });
    }
    console.log("wtf",existingAdmin)
    if (!existingAdmin){
      counter-=1;
      if(counter===0){
        counter=3;
        return res.status(404).json({disabled:true,off:"You have reached maximum login attempts"});
      }
      return res.status(404).json({ message: "Un-authorized access" });
    }
    let encryptPwd;
    try {
      encryptPwd = await bcrypt.hash(password, 12);
    } catch (err) {
      return res.status(500).json({ message: "password encryption failed" });
    }
    let createdAdmin = new Admin({ email, password: encryptPwd});
    try {
      await createdAdmin.save();
    } catch (err) {
      return res.status(500).json({ message: "Creating Admin failed" });
    }
    let token;
    try {
      token = jwt.sign({ userId: createdAdmin._id, email: createdAdmin.email }, "rohansingh", { expiresIn: "1h" });
    } catch (err) {
      return res.status(500).json({message: "Something went wrong while token creation in login."});
    }
    counter = 3;
    return res.status(201).json({
      name: createdAdmin.name,
      userId: createdAdmin?._id,
      token: token,
    });
  } else {
    let existingAdmin;
    try {
      existingAdmin = await Admin.findOne({ email: email });
    } catch (err) {
      return res.status(401).json({message: "Something went wrong while finding email id",});
    }
    if (!existingAdmin) {
      counter -= 1;
      if(counter===0){
        counter=3;
        return res.status(404).json({disabled:true, off:"You have reached maximum login attempts"});
      }
      return res.status(401).json({message: "Admin with this email id does not exist"});
    }
    let isValidPwd = false;
    try {
      isValidPwd = await bcrypt.compare(password, existingAdmin.password);
    } catch (err) {
      return res.status(500).json({message: "Something went wrong while comparing password"});
    }
    if (isValidPwd === false) {
      counter -= 1;
      if(counter===0){
        counter=3;
        return res.status(404).json({disabled:true, off:"You have reached maximum login attempts"});
      }
      return res.status(500).json({ message: "Invalid Password"});
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
      return res
        .status(500)
        .json({
          message: "Something went wrong while token creation in login.",
          count: count,
        });
    }
    counter = 3;
    try {
      await existingAdmin.save();
    } catch (err) {
      return res.status(500).json({ message: "error" });
    }
    return res.status(201).json({
      name: existingAdmin.name,
      userId: existingAdmin?._id,
      token: token,
    });
  }
};

const adminProfile = async (req, res) =>{
  // console.log(req.body)
  let {fname, lname, empid, email, dob, phno} = req.body;
  console.log("req file",req.files)
  let checkAdmin;
  try{
    checkAdmin = await Admin.findOne({email});
    const a = await Admin.find({})
    console.log(a, email);
  }catch(err){
    console.log("verification error: ",err);
    return res.status(500).json({message:"Something went wrong while verifying admin"});
  }
  console.log("half details",checkAdmin)
  if(checkAdmin){
    try{
      checkAdmin.fname=fname;
      checkAdmin.lname=lname;
      checkAdmin.empid=empid;
      checkAdmin.dob=dob;
      checkAdmin.phno=phno;
      if(req.file)checkAdmin.image=req.file.path;
      await checkAdmin.save();
    }catch(err){
      console.log("Saving error ",err);
      res.status(500).json({message:"Something went wrong while saving admin details"})
    }
    console.log("complete details", checkAdmin);
    return res.status(201).json({admin:checkAdmin});
  }else{
    return res.status(404).json({message:"Details does not corresponds to existing admin"});
  }
}


module.exports = { loginAdmin, ResetPwd, ChangePassword, adminProfile, getAdminDetails };
