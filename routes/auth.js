const express = require('express');
const router = express.Router();

const {
  register,
  login,
  forgotpassword,
  resetpassword,
  deleteUser,
  allusers
} = require("../controllers/auth");

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/forgotpassword").post(forgotpassword);

router.route("/resetpassword/:resetToken").put(resetpassword);

router.route("/deleteuser").delete(deleteUser);

router.route("/allusers").get(allusers);

module.exports = router;