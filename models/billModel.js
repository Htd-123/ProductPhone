// File: models/memberModel.js
"use strict";
const mongoose = require("mongoose");

const bills = new mongoose.Schema(
  {
    user: { type: String},
    tieude: [{ type: String }],
    totalprice: { type: Number },
  },
  { versionKey: false, timestamps: true }
);

const Bill = mongoose.model("bills", bills);

module.exports = Bill; // Chỉ export model
