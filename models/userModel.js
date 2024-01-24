// File: models/userModel.js
"use strict";
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String }, // Lưu ý: trong thực tế, bạn nên mã hóa mật khẩu này
    email: { type: String},
    decentralization: { type: String }, // "1" cho admin, "2" cho user
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.model("accounts", userSchema);

module.exports = User;
