// userController.js
const express = require("express");
const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  res.render("login");
});

userRouter.post("/", async (req, res) => {
  if (req.body.action === "login") {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username: username });

      if (!user) {
        return res.status(401).send("Tên đăng nhập không tồn tại.");
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).send("Mật khẩu không chính xác.");
      }

      req.session.username = user.username; // Di chuyển dòng này vào đây

      if (user.decentralization === "1") {
        res.render("admin");
      } else if (user.decentralization === "2") {
        res.redirect("/");
      } else {
        res.send("Quyền người dùng không xác định.");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Có lỗi xảy ra khi xử lý đăng nhập.");
    }
  }
});

module.exports = userRouter;
