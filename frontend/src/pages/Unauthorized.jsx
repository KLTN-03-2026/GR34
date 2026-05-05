import { useNavigate, Link } from "react-router-dom";
import { FaUserLock, FaHome, FaArrowLeft } from "react-icons/fa";

// Trang không có quyền truy cập
export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans text-slate-600">
      {/* Phần giao diện */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* Phần giao diện */}
      <div className="relative z-10 max-w-lg w-full bg-white p-10 rounded-3xl shadow-2xl text-center border border-gray-100 mx-4">
        {/* Phần giao diện */}
        <div className="relative mb-6">
          <h1 className="text-9xl font-black text-gray-100 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            403
          </h1>
          <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full text-red-500 text-5xl mb-4 shadow-inner">
            <FaUserLock />
          </div>
        </div>

        {/* Tiêu đề nội dung */}
        <h2 className="text-3xl font-bold text-[#113e48] mb-3">
          Truy cập bị từ chối
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Rất tiếc, bạn không có quyền truy cập vào khu vực này. <br />
          Vui lòng kiểm tra lại tài khoản hoặc liên hệ quản trị viên.
        </p>

        {/* Phần giao diện */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-bold text-[#113e48] bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <FaArrowLeft /> Quay lại
          </button>

          <Link
            to="/"
            className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <FaHome /> Trang chủ
          </Link>
        </div>
      </div>

      {/* Phần giao diện */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );
}