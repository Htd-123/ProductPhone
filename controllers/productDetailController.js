const Product = require("../models/productModel");
const Comment = require("../models/commentModel");

const productDetailController = {
  getProductDetail: async (req, res) => {
    try {
      const productId = req.params.productId;
      const productDetails = await Product.findById(productId);
      const productComments = await Comment.find({ productId: productId });

      res.render("product-detail", { productDetails, productComments, userIsLoggedIn: req.session.username });
    } catch (err) {
      console.error(err);
      res.status(500).send("Có lỗi xảy ra");
    }
  },

  addComment: async (req, res) => {
    const productId = req.params.productId;
    const { comment } = req.body;

    if (!req.session.username) {
      res.redirect("/login");
      return;
    }

    try {
      const newComment = new Comment({
        productId: productId,
        username: req.session.username,
        commentText: comment,
      });

      await newComment.save();
      res.redirect(`/product/${productId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Có lỗi xảy ra khi xử lý bình luận.");
    }
  }
};

module.exports = productDetailController;
