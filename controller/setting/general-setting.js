const { validationResult } = require("express-validator");
const General = require('../../model/settings/general')


const getSiteData = async(req, res) =>{
    let id = req.params.siteId;
    console.log(req.params)
    let data;
    try{
        data = await General.findById({_id:id}, '-_id');
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong while finding site infromation"})
    }
    if(!data)return res.status(404).json({message:"Site information is not available"});
    return res.status(201).json({data:data});
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
    checkAdmin = await General.countDocuments({});
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong while checking document count" });
  }
  let c_path1 = req.files["logo"][0].path.replace(/\\/g, "/");
  let c_path2 = req.files["f_icon"][0].path.replace(/\\/g, "/");
  console.log("C_Path is : ", c_path1);
  if(checkAdmin===0){
    const createdData = new General({title, m_mode, i_mode, logo:c_path1, f_icon:c_path2})
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
      findSiteData = await General.find({title:title});
    }catch(err){
      console.log(err);
      return res.status(500).json({message:"something went wrong while finding site data"});
    }
    if(findSiteData){
      findSiteData.title=title;
      findSiteData.logo=logo;
      findSiteData.f_icon=f_icon;
      findSiteData.m_mode=m_mode;
      findSiteData.i_mode=i_mode;
    }
    return res.status(201).json({createdData:findSiteData});
  }
};

module.exports = { SiteData, getSiteData };
