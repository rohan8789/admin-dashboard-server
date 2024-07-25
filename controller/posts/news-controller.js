const { validationResult } = require("express-validator");
const mongoose = require('mongoose')

const news = require('../../model/posts/news');
const Admin = require('../../model/admin')

const createNews = async(req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
    return res.json({ message: "can not register data without user input" });
    }

    const {heading, description, type, creatorId} = req.body;
    if(!heading || !description || !type || !creatorId || !req.file.path){
        return res.status(400).json({message:"Missing information"});
    }

    let imgPath = req.file.path.replace(/\\/g, "/");
    
    let findAdmin;
    try {
        findAdmin = await Admin.findById(creatorId);
    } catch (err) {
        return res.status(400).json({ message: "Creating a place failed..." });
    }
    if (!findAdmin) {
      return res.status(400).json({ message: "User with this uid does not exist..." });
    }
    console.log("This is creatorId", findAdmin)
    let fullName = findAdmin?.fname+" "+findAdmin?.lname;
    if(!fullName) fullName = findAdmin.name;
    
    let newNews = new news({heading, description, image:imgPath, type, creatorId, createdBy:fullName});
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newNews.save({ session: sess });
        let f=0;
        
        // console.log("We are here");
        for(let i=0; i<findAdmin.posts.length; i++){
            if (findAdmin.posts[i].postModel === "News") {
              findAdmin.posts[i].postId.push(newNews);
              f=1;
            }
        }
        // console.log("Error above")
        if(f==0){
            findAdmin.posts.push({postId:newNews, postModel:"News"});
        }else{
            f=0;
        }
        await findAdmin.save({ session: sess });
        await sess.commitTransaction();
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }

    console.log(newNews)
    if(!newNews){
        return res.status(404).json({message:"Post can not be created"});
    }
    return res.status(200).json({message:"Success"});
}

const getNews = async(req, res) => {
    console.log("newsController hit");
    let getAllNews;
    try{
        getAllNews = await news.find({});
    }catch(err){
        console.log(err)
        return res.status(500).json({message:"Something went wrong"});
    }
    if(!getAllNews)return res.status(404).json({message:"news not found"});
    return res.status(201).json({news:getAllNews});
}


const updateNews = async (req, res) =>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json({ message: "can not register data without user input" });
    }

    const { heading, description, type, creatorId } = req.body;
    if (!heading || !description || !type || !req.file.path) {
      return res.status(400).json({ message: "Missing information" });
    }

    const id = req.params.id;
    let findNews;
    try{
        findNews = await news.findById({_id:id});
    }catch(err){
        // console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }

    if(!findNews)return res.status(404).json({message:"News not found"});
    console.log(findNews);
    if(findNews.creatorId.toString() !== creatorId){
        console.log(findNews, findNews.creatorId.toString(), creatorId)
        return res.status(404).json({message:"you are not creator of this news"})
    }
    let imgPath = req.file.path.replace(/\\/g, "/");
    findNews.heading=heading;
    findNews.description=description;
    findNews.type=type;
    findNews.image=imgPath;
    try{
        await findNews.save()
    }catch(err){
        return res.status(500).json({message:"Something went wrong"});
    }
    return res.status(201).json({message:"success"});
}

const deleteNews = async(req, res) =>{
    const id = req.params.id;
    let findNews;
    try{
        findNews = await news.findById({_id:id});
    }catch(err){
        return res.status(500).json({message:"Something went wrong"});
    }
    if(!findNews)return res.status(404).json({message:"News not found"});
    let deleteNews;
    try{
        deleteNews = await news.deleteOne({_id:id});
    }catch(err){
        return res.status(500).json({message:"Something went wrong"});
    }
    if(!deleteNews)return res.status(404).json({message:"cannot be deleted"});
    return res.status(201).json({message:"Success"});
}

module.exports = {createNews, getNews, updateNews, deleteNews};