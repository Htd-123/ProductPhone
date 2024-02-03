// controllers/productController.js
const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

// Hàm trung gian để lấy dữ liệu sản phẩm, thực hiện tìm kiếm
async function getProductsAndComments(categoryId = null, searchQuery = null) {
  let productsList;
  if (searchQuery) {
    productsList = await Product.find({
      tieude: { $regex: searchQuery, $options: "i" },
    });
  } else if (categoryId) {
    productsList = await Product.find({ category: categoryId });
  } else {
    productsList = await Product.find();
  }

  return { productsList };
}

// Route chính, hiển thị tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
    const { productsList } = await getProductsAndComments();
    res.render("product", {
      product: productsList,
      username: req.session.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// Route để lọc sản phẩm theo categoryId
router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { productsList } = await getProductsAndComments(categoryId);
    res.render("product", {
      product: productsList,
      username: req.session.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// Route tìm kiếm sản phẩm
router.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.query;
    const { productsList } = await getProductsAndComments(null, searchQuery);
    res.render("product", {
      product: productsList,
      username: req.session.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post("/", async (req, res) => {
  if (req.body.action === "cart") {
    const { tieude, hinhanh, price } = req.body;
    const username = req.session.username;

    if (!username) {
      return res.status(401).send("Bạn cần đăng nhập để thêm vào giỏ hàng.");
    }

    try {
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng của người dùng hay không
      const existingProduct = await Cart.findOne({ tieude: tieude, user: username });

      if (existingProduct) {
        return res.send("Sản phẩm này đã tồn tại trong giỏ hàng của bạn.");
      }

      // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm vào giỏ hàng
      const result = await Cart.create({
        user: username,
        tieude: tieude,
        hinhanh: hinhanh,
        price: price,
      });

      if (result) {
        return res.send( "Sản phẩm đã được thêm vào giỏ hàng.");
      } else {
        return res.send("Có lỗi khi thêm vào giỏ hàng.");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Có lỗi xảy ra khi xử lý yêu cầu.");
    }
  }
});

module.exports = router;
