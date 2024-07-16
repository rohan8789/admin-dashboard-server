const express = require("express");
const {check} = require('express-validator');

const { loginAdmin, ResetPwd, ChangePassword, adminProfile, getAdminDetails} = require("../controller/admin-controller");
const { SiteData, getSiteData, staticPageData, getStaticPageData, updateStaticPageData } = require("../controller/setting/general-setting")
const ImageUpload = require('../middleware/image-upload')
const router = express.Router();


router.post("/login", loginAdmin);
router.post("/reset", ResetPwd);





//Make these private
router.patch("/changepwd/:userId", ChangePassword);
router.get("/:adminId", getAdminDetails);

router.patch("/admin-profile", ImageUpload.single("image"),[
    check("fname").not().isEmpty(),
    check("lname").not().isEmpty(),
    check("email").isEmail(), 
    check("phno").not().isEmpty(),
    check("dob").not().isEmpty(),
    check("empid").not().isEmpty(),
  ],
  adminProfile
);

router.post("/settings/general-settings/site-information", ImageUpload.fields([{name:"logo", maxCount:1}, {name:"f_icon", maxCount:1}]), [
    check("title").not().isEmpty(),
    check("m_mode").not().isEmpty(),
    check("i_mode").not().isEmpty()
  ],
  SiteData
);

router.get("/settings/general-settings/site-information", getSiteData);

router.post("/settings/general-settings/static-pages", staticPageData);
router.get("/settings/general-settings/static-pages", getStaticPageData);
router.patch("/settings/general-settings/static-pages/:id", updateStaticPageData);

module.exports = router;
