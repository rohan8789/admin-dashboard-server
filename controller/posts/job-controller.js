const mongoose = require('mongoose')

const Admin = require("../../model/admin");
const Job = require("../../model/posts/jobs");

const createJobPost = async(req, res) => {
    const { name, description, designation, worktype, creatorId } = req.body;
    if(!name || !description || !designation || !worktype || !creatorId){
        return res.status(400).json({ message: "Missing information" });
    }
    let findAdmin;
    try{
        findAdmin = await Admin.findOne({_id:creatorId});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"something went wrong"});
    }
    if(!findAdmin)return res.status(404).json({message:"User not found"});

    let fullName = findAdmin?.fname + " " + findAdmin?.lname;
    if (!fullName) fullName = findAdmin.name;

    let newJob = new Job({name, worktype, designation, description, creatorId, createdBy:fullName});
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await newJob.save({ session: sess });
      let f = 0;
      for (let i = 0; i < findAdmin.posts.length; i++) {
        if (findAdmin.posts[i].postModel === "Job") {
          findAdmin.posts[i].postId.push(newJob);
          f = 1;
        }
      }
      if (f == 0) {
        findAdmin.posts.push({ postId: newJob, postModel: "Job" });
      } else {
        f = 0;
      }
      await findAdmin.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something went wrong" });
    }

    if (!newJob) {
      return res.status(404).json({ message: "Post can not be created" });
    }
    return res.status(200).json({ message: "Success" });
} 


const getJobs = async(req, res) => {
    let getAllJobs;
    try {
      getAllJobs = await Job.find({});
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    if (!getAllJobs) return res.status(404).json({ message: "news not found" });
    return res.status(201).json({ news: getAllJobs });
}

const updateJob = async(req, res) => {
  
  const { name, description, designation, worktype, creatorId } = req.body;
  if (!name || !description || !designation || !worktype || !creatorId) {
    return res.status(400).json({ message: "Missing information" });
  }

  const id = req.params.id;
  let findJob;
  try {
    findJob = await Job.findById({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  if (!findJob) return res.status(404).json({ message: "News not found" });
  if (findJob.creatorId.toString() !== creatorId) {
    return res
      .status(404)
      .json({ message: "you are not creator of this news" });
  }
  findJob.name = name;
  findJob.designation = designation;
  findJob.description = description;
  findJob.worktype = worktype;
  try {
    await findJob.save();
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  return res.status(201).json({ message: "success" });
}

const deleteJob = async(req, res) => {
  const id = req.params.id;
  let findJob;
  try {
    findJob = await Job.findById({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!findJob) return res.status(404).json({ message: "News not found" });
  let deleteJob;
  try {
    deleteJob = await Job.deleteOne({ _id: id });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!deleteJob) return res.status(404).json({ message: "cannot be deleted" });
  return res.status(201).json({ message: "Success" });
}

module.exports ={createJobPost, getJobs, updateJob, deleteJob}