import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaUser, FaComments, FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

// Chi tiết bài tin tức
export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await API.get(`/news/${id}`);
        setArticle(res.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#113e48] mb-4">Bài viết không tồn tại</h2>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-3 bg-[#113e48] text-white font-bold rounded-lg hover:bg-orange-500 transition-colors"
        >
          <FaArrowLeft /> Trở về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold mb-8 transition-colors"
        >
          <FaArrowLeft /> Quay lại
        </button>

        {}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {}
          {article.image && (
            <div className="w-full bg-gray-100 flex justify-center border-b border-gray-100">
              <img
                src={getImageUrl(article.image)}
                alt={article.title}
                className="w-full max-h-[600px] object-contain"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {}
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-orange-500" />
                {new Date(article.created_at).toLocaleDateString("vi-VN")}
              </div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <FaUser className="text-orange-500" /> {article.author}
              </div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <FaComments className="text-orange-500" /> {article.comments || 0} Bình luận
              </div>
            </div>

            {}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#113e48] leading-snug mb-8">
              {article.title}
            </h1>

            {}
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium break-words"
              dangerouslySetInnerHTML={{ __html: article.content ? article.content.replace(/\n/g, "<br />").replace(/&nbsp;|\u00A0/g, " ") : "" }}
            />

            {}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">Chủ đề:</span>
                {["#Logistics", "#VậnChuyển", "#SpeedyShip", "#ChuyểnPhátNhanh", "#TinTứcMới"].map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-4 py-2 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-600 rounded-lg text-sm font-bold cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
