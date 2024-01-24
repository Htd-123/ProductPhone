// File: models/memberModel.js
"use strict";
const mongoose = require("mongoose");

const comments = new mongoose.Schema(
  {
    binhluan: { type: String },
  },
  { versionKey: false, timestamps: true }
);

const Comment = mongoose.model("comments", comments);

module.exports = Comment; // Chỉ export model
