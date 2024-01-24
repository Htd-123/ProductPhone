// File: models/memberModel.js
"use strict";
const mongoose = require("mongoose");

const carts = new mongoose.Schema(
  {
    user: { type: String },
    tieude: { type: String },
    hinhanh: { type: String },
    price: { type: Number },
  },
  { versionKey: false, timestamps: true }
);

const Cart = mongoose.model("carts", carts);

module.exports = Cart; // Chỉ export model
