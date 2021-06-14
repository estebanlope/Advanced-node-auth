const crypto = require('crypto')

require("dotenv").config({ path: "./config.env" });
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide an email and password.", 400)
    );
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Email could not be sent 1", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http://localhost:4000/passwordreset/${resetToken}`;

    const message = `<h1> YOU HAVE REQUESTED A PASSWORD RESET </h1>
                     <p>PLEASE GO TO THE LINK TO RESET YOR PASSWORD</p>
                     <a href=${resetUrl} clicktracking="off">${resetUrl}</a>`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (err) {
      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent 2 ", 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetpassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if(!user){
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({succes: true, data: "Password reset success"})
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.allusers = (req, res, next) => {
  User.find({}, (error, users) => {
    res.send({ users: users });
  });
};

exports.deleteUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndDelete({ email });

    if (user) {
      res.status(200).json({ success: true, email: `User deleted: ${email}` });
    } else {
      return next(new ErrorResponse("The user doesn't exits", 400));
    }
  } catch (error) {
    next(error);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ succes: true, token });
};
