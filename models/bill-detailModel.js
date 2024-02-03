// File: models/memberModel.js
"use strict";
const mongoose = require("mongoose");

const Bill_detail = new mongoose.Schema(
  {
    titlewebsite: { type: String },
    tieude: [{ type: String }],
  },
  { versionKey: false, timestamps: true }
);

const Billdetail = mongoose.model("bill-details", Bill_detail);

module.exports = Billdetail; // Chỉ export model
