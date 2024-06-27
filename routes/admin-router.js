const express = require("express");
const { loginAdmin, ResetPwd, ChangePassword } = require("../controller/admin-controller");
const router = express.Router();


router.post("/login", loginAdmin);
router.post("/reset", ResetPwd);
router.patch("/changepwd/:userId", ChangePassword);

module.exports = router;
