// File: models/memberModel.js

"use strict";
const mongoose = require("mongoose");

const product = new mongoose.Schema(
  {
    tieude: { type: String },
    hinhanh: { type: String },
    img: [{ type: String }], 
    price: { type: Number},
    mota: { type: String},
    category: {type: Number},
  },
  { versionKey: false, timestamps: true }
);

const Product = mongoose.model("products", product);

module.exports = Product; // Chỉ export model
