// Xử lý yêu cầu đăng xuất
exports.logoutUser = (req, res) => {
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
  };
  