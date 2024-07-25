const express = require("express");
const {check} = require('express-validator');

const { loginAdmin, ResetPwd, ChangePassword, adminProfile, getAdminDetails} = require("../controller/admin-controller");
const { SiteData, getSiteData, staticPageData, getStaticPageData, updateStaticPageData, deleteStaticPageData } = require("../controller/setting/general-setting")
const {addNewUser, getAllUsers, editUser, deleteUser} = require("../controller/roles-and-permissions/user")
const {createNews, getNews, updateNews, deleteNews} = require("../controller/posts/news-controller")
const {createBlog, getBlog, updateBlog, deleteBlog} = require("../controller/posts/blogs-controller")
const {createEnt, getEnt, updateEnt, deleteEnt} = require('../controller/posts/entertainment-controller')
const {createJobPost, getJobs, updateJob, deleteJob} = require('../controller/posts/job-controller');

const ImageUpload = require('../middleware/image-upload')
const router = express.Router();


router.post("/login", loginAdmin);
router.post("/reset", ResetPwd);

//Make these private

//admin profile
router.get("/:adminId", getAdminDetails);
router.patch("/changepwd/:userId", ChangePassword);
router.patch("/admin-profile", ImageUpload.single("image"),[
    check("fname").not().isEmpty(),
    check("lname").not().isEmpty(),
    check("email").isEmail(), 
    check("phno").not().isEmpty(),
    check("dob").not().isEmpty(),
    check("empid").not().isEmpty(),
  ], adminProfile
);

//settings
router.post("/settings/general-settings/site-information", ImageUpload.fields([{name:"logo", maxCount:1}, {name:"f_icon", maxCount:1}]), [
    check("title").not().isEmpty(),
    check("m_mode").not().isEmpty(),
    check("i_mode").not().isEmpty()
  ], SiteData
);
router.get("/settings/general-settings/site-information", getSiteData);
router.post("/settings/general-settings/static-pages", staticPageData);
router.get("/settings/general-settings/static-pages", getStaticPageData);
router.patch("/settings/general-settings/static-pages/:id", updateStaticPageData);
router.delete("/settings/general-settings/static-pages/:id", deleteStaticPageData);

//add user
router.post("/roles-and-permissions/user/add-user", addNewUser);
router.get("/roles-and-permissions/user/get-user", getAllUsers);
router.patch("/roles-and-permissions/user/edit-user/:id", editUser);
router.delete("/roles-and-permissions/user/delete-user/:id", deleteUser)

//News related
router.get("/news/get-news", getNews);
router.post("/news/post-news", ImageUpload.single('image'), createNews);
router.patch("/news/update-news/:id", ImageUpload.single("image"), updateNews);
router.delete("/news/delete-news/:id", deleteNews);

//blog related
router.get("/blogs/get-blog", getBlog);
router.post("/blogs/add-blog", ImageUpload.single("image"), createBlog);
router.patch("/blogs/update-blog/:id", ImageUpload.single("image"), updateBlog);
router.delete("/blogs/delete-blog/:id", deleteBlog); 

//entertainment news
router.get("/entertainment/get-ent", getEnt);
router.post("/entertainment/post-ent", ImageUpload.single("image"), createEnt);
router.patch("/entertainment/update-ent/:id", ImageUpload.single("image"), updateEnt);
router.delete("/entertainment/delete-ent/:id", deleteEnt); 


//job related 
router.get("/jobs/get-job", getJobs);
router.post("/jobs/post-job", createJobPost);
router.patch("/jobs/update-job/:id", updateJob);
router.delete("/jobs/delete-job/:id", deleteJob); 

module.exports = router;
