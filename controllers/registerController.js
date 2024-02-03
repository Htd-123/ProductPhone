// registerController.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");

const router = express.Router();
const saltRounds = 10;

router.get("/", async (req, res) => {
  res.render("register");
});

router.post("/", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Biểu thức chính quy cho mật khẩu
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  // Kiểm tra mật khẩu và xác nhận mật khẩu có giống nhau và hợp lệ không
  if (password !== confirmPassword) {
    return res.status(400).send("Mật khẩu xác nhận không khớp.");
  } else if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send(
        "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, số và ký hiệu đặc biệt."
      );
  }

  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).send("Tên đăng nhập đã tồn tại.");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username: username,
      password: hashedPassword,
      email: email,
      decentralization: "2",
    });

    await newUser.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra khi đăng ký.");
  }
});

module.exports = router;
