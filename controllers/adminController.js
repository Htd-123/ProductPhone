// adminController.js
const express = require("express");
const Product = require("../models/productModel.js");

const adminRouter = express.Router();

adminRouter.get("/", async (req, res) => {
  res.render("admin");
});

adminRouter.post("/", async (req, res) => {
   // Thêm sản phẩm
   if (req.body.action === "add") {
    const createData = req.body;
    return Product.create({
      tieude: req.body.tieude,
      hinhanh: req.body.hinhanh,
      price: req.body.price,
      mota: req.body.description,
      category: req.body.category,
    })
      .then((rs) => {
        if (rs) {
          res.render('admin', { message_add: 'Thêm thành công' });
        }
      })
      .catch((e) => {
        console.log("Lỗi: ", e);
        res.render('admin', { message_add: "Có lỗi xảy ra khi thêm sản phẩm." });
      });
  }
  //Xóa sản phẩm
  if (req.body.action === "delete") {
    const tieudeToDelete = req.body.tieude;

    Product.deleteOne({ tieude: tieudeToDelete })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.render('admin', { message_delete: 'Xóa thành công' });
        } else {
          res.render('admin', { message_delete: 'Có lỗi xảy ra khi xóa sản phẩm' });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Có lỗi xảy ra khi xóa sản phẩm");
      });
  }

  //Update sản phẩm
  if (req.body.action === "update") {
    const tieudeCu = req.body.tieude;
    const updateData = {
      tieude: req.body.tieude,
      hinhanh: req.body.hinhanh,
      price: req.body.price,
      mota: req.body.description,
      category: req.body.category,
    };

    Product.findOneAndUpdate({ tieude: tieudeCu }, updateData, { new: true })
      .then((updatedProduct) => {
        if (updatedProduct) {
          res.render('admin', { message_update: 'Cập nhật thành công' });
        } else {
          res.render('admin', { message_update: 'Có lỗi xảy ra khi cập nhật' });
        }
      })
      .catch((err) => {
        console.error(err);
        res.render('admin', { message_update: 'Có lỗi xảy ra khi cập nhật' });
      });
  }
});

module.exports = adminRouter;
