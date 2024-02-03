// userProfileController.js

// Xử lý hiển thị trang profile của người dùng
exports.showUserProfile = async (req, res) => {
    try {
      // Render view user-profile
      res.render("user-profile");
    } catch (err) {
      console.error(err);
      res.status(500).send("Có lỗi xảy ra");
    }
  };
  