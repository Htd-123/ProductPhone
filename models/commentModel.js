// File: models/memberModel.js
"use strict";
const mongoose = require("mongoose");

const comments = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    username: String,
    commentText: String,
  },
  { versionKey: false, timestamps: true }
);

const Comment = mongoose.model("comments", comments);

module.exports = Comment; // Chỉ export model
