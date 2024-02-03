// resetPasswordController.js
const express = require("express");
const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");

const resetPasswordRouter = express.Router();

resetPasswordRouter.get("/", async (req, res) => {
  res.render("resetpassword");
});

resetPasswordRouter.post("/", async (req, res) => {
  const { username, oldPassword, newPassword, confirmNewPassword } = req.body;

  // Biểu thức chính quy cho mật khẩu
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  // Kiểm tra mật khẩu mới và mật khẩu xác nhận có giống nhau và hợp lệ không
  if (newPassword !== confirmNewPassword) {
    return res
      .status(400)
      .send("Mật khẩu mới và mật khẩu xác nhận không khớp.");
  } else if (!passwordRegex.test(newPassword)) {
    return res
      .status(400)
      .send(
        "Mật khẩu mới phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, số và ký hiệu đặc biệt."
      );
  }

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).send("Người dùng không tồn tại.");
    }

    // Kiểm tra mật khẩu cũ có khớp không bằng cách so sánh mã hóa
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).send("Mật khẩu cũ không chính xác.");
    }

    // Mã hóa mật khẩu mới trước khi cập nhật
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Sử dụng cùng salt rounds như khi đăng ký

    // Cập nhật trực tiếp mật khẩu mới đã mã hóa
    user.password = hashedNewPassword;
    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra khi đặt lại mật khẩu.");
  }
});

module.exports = resetPasswordRouter;
