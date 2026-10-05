// xử lý đăng nhập, đăng xuất
// tài khoản mặc định
const DEFAULT_ACCOUNT = {
  username: "luyenht",
  password: "b23dccn521",
};

const SESSION_KEY = "smartclass_demo_session";

// Kiểm tra tài khoản đăng nhập
export function login(username, password) {
  const validUsername =
    username.trim() === DEFAULT_ACCOUNT.username;

  const validPassword =
    password === DEFAULT_ACCOUNT.password;

  if (!validUsername || !validPassword) {
    return {
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không chính xác!",
    };
  }

  // Chỉ lưu trạng thái demo, không lưu mật khẩu
  sessionStorage.setItem(SESSION_KEY, "authenticated");

  return {
    success: true,
    message: "Đăng nhập thành công!",
    username: DEFAULT_ACCOUNT.username,
  };
}

// Kiểm tra trạng thái đăng nhập
export function isAuthenticated() {
  return (
    sessionStorage.getItem(SESSION_KEY) === "authenticated" // lưu trạng thái đăng nhập trong phiên trình duyệt
  );
}

// Đăng xuất
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

// Lấy thông tin tài khoản đang đăng nhập
export function getCurrentUser() {
  if (!isAuthenticated()) return null;

  return {
    username: DEFAULT_ACCOUNT.username,
    displayName: "Hoàng Thị Luyến",
  };
}
