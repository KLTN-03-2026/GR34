import { useState } from "react";
import API from "../../services/api";

export default function DriverChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.patch("/drivers/1/change-password", {
      oldPassword,
      newPassword,
    });
    alert("✅ Đổi mật khẩu thành công");
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Đổi mật khẩu</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          placeholder="Mật khẩu cũ"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="border w-full px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border w-full px-3 py-2 rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}
