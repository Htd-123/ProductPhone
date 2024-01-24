const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Product = require("./models/productModel.js");
const bodyParser = require("body-parser");
const User = require("./models/userModel.js");
const Cart = require("./models/cartModel.js");
const Bill = require("./models/billModel.js");
const Billdetail = require("./models/bill-detailModel.js");
const Comment = require("./models/commentModel.js");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const port = 3001;

// Kết nối đến MongoDB
mongoose.connect(
  "mongodb+srv://huynhthanhdanh9a4:danh123@cluster0.iljso9r.mongodb.net/NeshTech?retryWrites=true&w=majority"
);

// Sử dụng EJS làm template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  session({
    secret: "danh123", // Thay 'your-secret-key' bằng một chuỗi bí mật của bạn
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Đặt thành true nếu bạn đang sử dụng HTTPS
  })
);

// Hàm trung gian để lấy dữ liệu sản phẩm, thực hiện tìm kiếm
async function getProductsAndComments(categoryId = null, searchQuery = null) {
  let productsList;
  if (searchQuery) {
    // Tìm kiếm sản phẩm theo từ khóa
    productsList = await Product.find({
      tieude: { $regex: searchQuery, $options: "i" },
    });
  } else if (categoryId) {
    // Lọc sản phẩm theo categoryId
    productsList = await Product.find({ category: categoryId });
  } else {
    // Lấy tất cả sản phẩm
    productsList = await Product.find();
  }

  return { productsList};
}

// Route chính, hiển thị tất cả sản phẩm
app.get("/", async (req, res) => {
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
app.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { productsList} = await getProductsAndComments(
      categoryId
    );
    res.render("product", {
      product: productsList,
      username: req.session.username, // Nếu bạn muốn giữ username trong trường hợp này
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// Route tìm kiếm sản phẩm
app.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.query; // Lấy từ khóa tìm kiếm từ truy vấn
    const { productsList} = await getProductsAndComments(
      null,
      searchQuery
    );
    res.render("product", {
      product: productsList,
      username: req.session.username, // Nếu bạn muốn giữ username trong trường hợp này
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// Code xử lý chức năng admin
app.get("/admin", async (req, res) => {
  res.render("admin");
});

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

app.post("/admin", (req, res) => {
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
          return res.json({ status: 200, message: "Thành công" });
        }
      })
      .catch((e) => {
        console.log("Lỗi: ", e);
        return res.json({ status: 500, message: "Lỗi" });
      });
  }
  //Xóa sản phẩm
  if (req.body.action === "delete") {
    const tieudeToDelete = req.body.tieude;

    Product.deleteOne({ tieude: tieudeToDelete })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.send("Sản phẩm đã được xóa.");
        } else {
          res.send("Không tìm thấy sản phẩm để xóa.");
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
          res.send("Sản phẩm đã được cập nhật.");
        } else {
          res.send("Không tìm thấy sản phẩm để cập nhật.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Có lỗi xảy ra khi cập nhật sản phẩm");
      });
  }
});

//Code xử lý chức năng user
app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  if (req.body.action === "login") {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username: username });

      if (!user) {
        return res.status(401).send("Tên đăng nhập không tồn tại.");
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).send("Mật khẩu không chính xác.");
      }

      req.session.username = user.username; // Di chuyển dòng này vào đây

      if (user.decentralization === "1") {
        res.render("admin");
      } else if (user.decentralization === "2") {
        res.redirect("/");
      } else {
        res.send("Quyền người dùng không xác định.");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Có lỗi xảy ra khi xử lý đăng nhập.");
    }
  }
});

app.get("/register", async (req, res) => {
  res.render("register");
});
const saltRounds = 10; // Bạn có thể điều chỉnh số lượng vòng salt

app.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Biểu thức chính quy cho mật khẩu
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  // Kiểm tra mật khẩu và xác nhận mật khẩu có giống nhau và hợp lệ không
  if (password !== confirmPassword) {
    return res.status(400).send("Mật khẩu xác nhận không khớp.");
  } else if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send(
        "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, số và ký hiệu đặc biệt."
      );
  }

  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).send("Tên đăng nhập đã tồn tại.");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username: username,
      password: hashedPassword,
      email: email,
      decentralization: "2",
    });

    await newUser.save();

    res.redirect("login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra khi đăng ký.");
  }
});

app.get("/reset-password", async (req, res) => {
  res.render("resetpassword");
});

app.post("/reset-password", async (req, res) => {
  const { username, oldPassword, newPassword, confirmNewPassword } = req.body;

  // Biểu thức chính quy cho mật khẩu
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  // Kiểm tra mật khẩu mới và mật khẩu xác nhận có giống nhau và hợp lệ không
  if (newPassword !== confirmNewPassword) {
    return res
      .status(400)
      .send("Mật khẩu mới và mật khẩu xác nhận không khớp.");
  } else if (!passwordRegex.test(newPassword)) {
    return res
      .status(400)
      .send(
        "Mật khẩu mới phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, số và ký hiệu đặc biệt."
      );
  }

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).send("Người dùng không tồn tại.");
    }

    // Kiểm tra mật khẩu cũ có khớp không bằng cách so sánh mã hóa
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).send("Mật khẩu cũ không chính xác.");
    }

    // Mã hóa mật khẩu mới trước khi cập nhật
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Sử dụng cùng salt rounds như khi đăng ký

    // Cập nhật trực tiếp mật khẩu mới đã mã hóa
    user.password = hashedNewPassword;
    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra khi đặt lại mật khẩu.");
  }
});

// Chức năng thêm vào giỏ hàng
app.post("/", async (req, res) => {
  // Thêm vào giỏ hàng
  if (req.body.action === "cart") {
    // Lấy thông tin sản phẩm từ request
    const { tieude, hinhanh, price } = req.body;

    // Lấy thông tin người dùng từ session
    const username = req.session.username;

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!username) {
      return res.status(401).send("Bạn cần đăng nhập để thêm vào giỏ hàng.");
    }

    try {
      // Tạo một bản ghi giỏ hàng mới với thông tin sản phẩm và người dùng
      const result = await Cart.create({
        user: username,
        tieude: tieude,
        hinhanh: hinhanh,
        price: price,
      });

      if (result) {
        return res.json({
          status: 200,
          message: "Sản phẩm đã được thêm vào giỏ hàng.",
        });
      } else {
        return res.json({
          status: 500,
          message: "Có lỗi khi thêm vào giỏ hàng.",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Có lỗi xảy ra khi xử lý yêu cầu.");
    }
  }

  // ... Các chức năng khác
});

// Lấy sản phẩm vào trong giỏ hàng
app.get("/cart", async (req, res) => {
  try {
    // Lấy danh sách sản phẩm trong giỏ hàng của người dùng hiện tại
    const username = req.session.username;
    const productsCart = await Cart.find({ user: username });
    res.render("cart", { cartList: productsCart });
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra");
  }
});

app.post("/cart", (req, res) => {
  // Xóa sản phẩm trong giỏ hàng
  if (req.body.action === "cart_delete") {
    const cartToDelete = req.body.cart_title;

    Cart.deleteOne({ tieude: cartToDelete })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.send("Sản phẩm đã được xóa.");
        } else {
          res.send("Không tìm thấy sản phẩm để xóa.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Có lỗi xảy ra khi xóa sản phẩm");
      });
  }

  // Mua sản phẩm trong giỏ hàng
  if (req.body.action === "buyproduct") {
    try {
      const productIds = req.body.productTitles;
      Bill.create({
        tieude: productIds,
      });

      Billdetail.create({
        titlewebsite: "Website Điện thoại NeshTech.com",
      });

      res.json({ status: 200, message: "Thành công" });
    } catch (e) {
      console.log("Lỗi: ", e);
      res.json({ status: 500, message: "Lỗi" });
    }
  }
});

// Code xử lý profile-user
app.get("/user-profile", async (req, res) => {
  res.render("user-profile");
});

//Code xử lý trang chi tiết sản phẩm
app.get("/product/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    // Lấy chi tiết sản phẩm dựa trên productId
    const productDetails = await Product.findById(productId);
    res.render("product-detail", { productDetails });
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra");
  }
});

// Route xử lý yêu cầu đăng xuất
app.post("/logout", (req, res) => {
  // Xóa session
  req.session.destroy((err) => {
    if (err) {
      console.error("Lỗi khi xóa session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Gửi phản hồi thành công
      res.status(200).send("Đăng xuất thành công");
    }
  });
});

app.listen(port, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});
