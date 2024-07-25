const Admin = require("../../model/admin");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");



const deleteUser = async(req, res) =>{
  const id = req.params.id;
  let findUser;
  try {
    findUser = await Admin.findById({ _id: id });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!findUser)
    return res.status(404).json({ message: "Admin not found" });

  let deleteUser;
  try {
    deleteUser = await Admin.deleteOne({ _id: id });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
  return res.status(201).json({ message: "Deleted User successfully" });
}


const editUser = async(req, res) =>{
  const {name, role} = req.body;
  const id = req.params.id;
  let findUser;
  try{
    findUser = await Admin.findOne({_id:id});
  }catch(err){
    // console.log(err);
    return res.status(500).json({message:"Something went wrong"});
  }
  if(!findUser)return res.status(404).json({message:"Admin not registered"});
  findUser.name=name;
  findUser.role=role;
  try{
    await findUser.save();
  }catch(err){
    // console.log(err);
    return res.status(500).json({message:"something went wrong"});
  }
  return res.status(201).json({message:"Successs"});
}


const getAllUsers = async (req, res) =>{
    let allUsers;
    try{
        allUsers = await Admin.find({}, '-password');
    }catch(err){
        // console.log("emr", err);
        return res.status(500).json({message:"something went wrong"})
    }
    if(!allUsers)return res.status(404).json({message:"Admin details not found"});
    // console.log("allUsers", allUsers);
    return res.status(201).json({admDetails:allUsers});
}


const addNewUser = async(req, res) =>{
    const {name, email, password, role} = req.body;
    if(!name || !email || !password || !role)return res.status(103).json({message:"Missing Information"});
    let checkUser;
    try{
        checkUser = await Admin.findOne({email:email});
    }catch(err){
        // console.log("err1", err);
        return res.status(500).json({message:"Something went wrong"});
    }
    if(checkUser)return res.status(403).json({message:"Admin already exists"});

    let encryptPwd;
    try {
      encryptPwd = await bcrypt.hash(password, 12);
    } catch (err) {
        // console.log('err2', err);
      return res.status(500).json({ message: "password encryption failed" });
    }

    let createUser = new Admin({name, email, password:encryptPwd, role});
    try{
        await createUser.save();
    }catch(err){
        // console.log('err3', err);
        return res.status(500).json({message:"Something went wrong"});
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

    const resetURL = `http://localhost:3000/reset-password/${createUser?._id}`;

    const mail = {
      from: "rohansinghrp180@gmail.com",
      to: email,
      Subject: "Password Reset",
      text: `You can log-in with current password. For better security, Please click the following link to reset your password:\n${resetURL}\n\nIf you did not request a password reset, please ignore this email.`,
    };

    transporter.sendMail(mail, (err, info) => {
      if (err) {
        return res.status(500).json({ message: "Error sending email" });
      } else {
        return res
          .status(200)
          .json({ message: "Password reset instructions sent to your email" });
      }
    });

    // console.log("createuser",createUser);
    return res.status(201).json({message:"Done"})
}

module.exports = {addNewUser, getAllUsers, editUser, deleteUser}