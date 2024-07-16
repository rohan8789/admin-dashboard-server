const { validationResult } = require("express-validator");
const SiteInformation = require('../../model/settings/site-information')
const StaticPage = require('../../model/settings/static-pages')


const updateStaticPageData = async (req, res) => {
  const id = req.params.id;
  const {heading, description, slugurl, redirecturl, redirect_mode} = req.body;
  let pageData;
  try{
    pageData = await StaticPage.findById({_id:id});
  }catch(err){
    console.log(err);
    return res.status(500).json({message:"Something went wrong"});
  }
  if(!pageData)return res.status(404).json({message:"static page not found by this id"});
  console.log("pageData", pageData)
  pageData.heading=heading;
  pageData.description=description;
  pageData.slugurl=slugurl;
  pageData.redirecturl=redirecturl;
  pageData.redirect_mode=redirect_mode;
  try{
    await pageData.save();
  }catch(err){
    console.log(err);
    return res.status(500).json({message:"Something went wrong"});
  }
  return res.status(201).json({ createStaticData: pageData });
}






const staticPageData = async (req, res) =>{
  
  const {heading, description, slugurl, redirecturl, redirect_mode } = req.body;
  if(!heading || !description || !slugurl || !redirecturl || !redirect_mode){
    return res.status(422).json({message:"please enter complete information"});
  }
  let createStaticData = new StaticPage({heading, description, slugurl, redirecturl, redirect_mode});
  try{
    await createStaticData.save();
  }catch(err){
    console.log(err);
  }
  console.log(createStaticData);
  return res.status(201).json({createStaticData: createStaticData, message:"Created"})
}




const getStaticPageData = async (req, res) =>{
  let static_data;
  try{
    static_data = await StaticPage.find({});
  }catch(err){
    console.log(err);
  }
  console.log("Static page", static_data);
  if(!static_data){
    return res.status(404).json({message:"Static page data not found"});
  }
  return res.status(201).json({static_data:static_data});
}






const getSiteData = async(req, res) =>{
  let checkAdmin;
  try {
    checkAdmin = await SiteInformation.countDocuments({});
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong while checking document count" });
  }
  console.log("Hello please", checkAdmin);
  if(checkAdmin===0)return res.status(103).json({message:"No data"});
  let data;
  try{
    data = await SiteInformation.find({});
  }catch(err){
    console.log(err);
    return res.status(500).json({message:"Something went wrong while finding site infromation"})
  }
  if(!data)return res.status(404).json({message:"Site information is not available"});
  return res.status(201).json({data:data[0]});
}


const SiteData = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ message: "can not register data without user input" });
  }
  const { title, m_mode, i_mode } = req.body;
  if (!title || !m_mode || !i_mode || !req.files["logo"][0].path || !req.files["f_icon"][0].path)
    return res.status(404).json({ message: "Please provide complete details" });

  let checkAdmin;
  try {
    checkAdmin = await SiteInformation.countDocuments({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while checking document count" });
  }
  let c_path1 = req.files["logo"][0].path.replace(/\\/g, "/");
  let c_path2 = req.files["f_icon"][0].path.replace(/\\/g, "/");
  console.log("C_Path is : ", c_path1);
  if(checkAdmin===0){
    const createdData = new SiteInformation({title, m_mode, i_mode, logo:c_path1, f_icon:c_path2})
    try{
      createdData.save();
    }catch(err){
      console.log("err", err);
    }
    console.log("createdData",createdData);
    return res.status(201).json({ createdData:createdData, message:"Setting data created"})
  }else{
    let findSiteData;
    try{
      findSiteData = await SiteInformation.find({title:title});
    }catch(err){
      console.log(err);
      return res.status(500).json({message:"something went wrong while finding site data"});
    }
    if(!findSiteData)return res.status(103).json({message:"Missing site information"});
    console.log("findSiteData", findSiteData)
    if(findSiteData){
      findSiteData[0].title=title;
      findSiteData[0].logo=c_path1;
      findSiteData[0].f_icon=c_path2;
      findSiteData[0].m_mode=m_mode;
      findSiteData[0].i_mode=i_mode;
      try{
        findSiteData[0].save();
      }catch(err){
        console.log(err);
        return res.status(201).json({message:"something went wrong while updating site information"})
      }
      return res.status(201).json({createdData:findSiteData});
    }
  }
};

module.exports = { SiteData, getSiteData, staticPageData, getStaticPageData, updateStaticPageData };
