const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const app = express();
const port = 3001;
const productController = require("./controllers/productController");
const adminController = require("./controllers/adminController");
const loginController = require("./controllers/loginController");
const registerController = require("./controllers/registerController");
const resetPasswordController = require("./controllers/resetPasswordController");
const cartController = require("./controllers/cartController");
const productDetailController = require("./controllers/productDetailController");
const userProfileController = require("./controllers/userProfileController");
const logoutController = require("./controllers/logoutController");

// Kết nối đến MongoDB
mongoose.connect(
  "mongodb+srv://huynhthanhdanh9a4:danh123@cluster0.iljso9r.mongodb.net/NeshTech?retryWrites=true&w=majority"
);

// Sử dụng EJS làm template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(
  session({
    secret: "danh123", // Thay 'your-secret-key' bằng một chuỗi bí mật của bạn
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Đặt thành true nếu bạn đang sử dụng HTTPS
  })
);

// Hiển thị sản phẩm + tìm kiếm + tìm kiếm theo danh mục
app.use("/", productController);
//Xử lý phần admin
app.use("/admin", adminController);
//Code xử lý chức năng login
app.use("/login", loginController);
//Code xử lý chức năng đăng ký
app.use("/register", registerController);
//Code xử lý chức năng reset-password
app.use("/reset-password", resetPasswordController);
//Code xử lý chức năng giỏ hàng
app.use("/cart", cartController);

// Route xử lý hiển thị chi tiết sản phẩm và bình luận
app.get("/product/:productId", productDetailController.getProductDetail);
app.post("/product/:productId", productDetailController.addComment);

// Xử lý profile-user
app.get("/user-profile", userProfileController.showUserProfile);

// Route xử lý yêu cầu đăng xuất
app.post("/logout", logoutController.logoutUser);

app.listen(port, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});
