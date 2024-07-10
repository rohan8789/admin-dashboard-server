const express = require("express");
const {check} = require('express-validator');

const { loginAdmin, ResetPwd, ChangePassword, adminProfile, getAdminDetails} = require("../controller/admin-controller");
const { SiteData, getSiteData } = require("../controller/setting/general-setting")
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

router.post("/setting/general-setting", ImageUpload.fields([{name:"logo", maxCount:1}, {name:"f_icon", maxCount:1}]), [
    check("title").not().isEmpty(),
    check("m_mode").not().isEmpty(),
    check("i_mode").not().isEmpty()
  ],
  SiteData
);

router.get("/setting/general-setting/:siteId", getSiteData);


module.exports = router;
