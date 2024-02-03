// cartController.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/cartModel");
const Bill = require("../models/billModel");
const Billdetail = require("../models/bill-detailModel");

// Hiển thị giỏ hàng
router.get("/", async (req, res) => {
  try {
    const username = req.session.username;
    const productsCart = await Cart.find({ user: username });
    res.render("cart", { cartList: productsCart });
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra");
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.post("/", async (req, res) => {
  try {
    if (req.body.action === "cart_delete") {
      const cartToDelete = req.body.cart_title;

      const result = await Cart.deleteOne({ tieude: cartToDelete });

      if (result.deletedCount > 0) {
        res.send("Sản phẩm đã được xóa.");
      } else {
        res.send("Không tìm thấy sản phẩm để xóa.");
      }
    }

    // Mua sản phẩm trong giỏ hàng
    if (req.body.action === "buyproduct") {
      const username = req.session.username;
      const productIds = req.body.productTitles;

      // Tính tổng giá
      const totalAmount = await calculateTotalPrice(productIds);

      // Tạo một bản ghi hóa đơn trong cơ sở dữ liệu
      const bill = await Bill.create({
        titlewebsite: "Website Điện thoại NeshTech.com",
        user: username,
        tieude: productIds,
        totalprice: totalAmount, // Thêm tổng giá vào hóa đơn
      });

      // Tạo một bản ghi chi tiết hóa đơn trong cơ sở dữ liệu
      await Billdetail.create({
        titlewebsite: "Website Điện thoại NeshTech.com",
        user: username,
        totalprice: totalAmount, // Thêm tổng giá vào chi tiết hóa đơn
        tieude: productIds,
      });

      // Xóa các sản phẩm đã mua khỏi giỏ hàng
      await Cart.deleteMany({ user: username, tieude: { $in: productIds } });

      res.json({ status: 200, message: "Thành công" });
    }
  } catch (error) {
    console.error("Lỗi: ", error);
    res.status(500).json({ status: 500, message: "Lỗi" });
  }
});

// Hàm trợ giúp để tính tổng giá
async function calculateTotalPrice(productIds) {
  try {
    const products = await Cart.find({ tieude: { $in: productIds } });
    let totalAmount = 0;

    products.forEach((product) => {
      totalAmount += product.price;
    });

    return totalAmount;
  } catch (error) {
    console.error("Lỗi khi tính tổng giá: ", error);
    throw error;
  }
}

module.exports = router;
