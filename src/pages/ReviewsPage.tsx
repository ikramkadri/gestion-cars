import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api"; // Corrected path
import { Doc } from "../../convex/_generated/dataModel"; // Corrected path
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Archive, 
  MessageSquare, 
  User, 
  Car,
  Clock,
  Search
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ReviewCard from "../components/ReviewCard"; // Corrected path

type ReviewStatus = "pending" | "approved" | "rejected" | "archived";

const ReviewsPage = () => {
  const token = localStorage.getItem("convex_token") ?? "";
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // جلب التقييمات بناءً على الفلتر ومصطلح البحث
  const reviews = useQuery(api.reviews.getAllReviews, { 
    token, 
    status: statusFilter,
    searchTerm: searchTerm.length > 2 ? searchTerm : undefined, // ابحث فقط إذا كان هناك 3 أحرف أو أكثر
  });

  // دالة لتحديث حالة التقييم
  const updateReviewStatus = useMutation(api.reviews.updateReviewStatus);

  const handleStatusUpdate = async (reviewId: Doc<"reviews">["_id"], newStatus: ReviewStatus) => {
    const toastId = toast.loading("جاري تحديث حالة التقييم...");
    try {
      await updateReviewStatus({ token, reviewId, status: newStatus });
      toast.success("تم تحديث حالة التقييم بنجاح!", { id: toastId });
    } catch (error: any) {
      toast.error(`فشل التحديث: ${error.message}`, { id: toastId });
      console.error("Failed to update review status:", error);
    }
  };

  if (!reviews) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل التقييمات...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans" dir="rtl">
      <h1 className="text-3xl font-black text-slate-900 leading-tight mb-6">إدارة تقييمات الزبائن</h1>
      <p className="text-slate-500 font-bold mb-8">مراجعة، قبول، أو رفض تقييمات السيارات.</p>

      {/* فلاتر الحالة وأزرار البحث */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button 
            onClick={() => setStatusFilter(undefined)} 
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === undefined ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            الكل
          </button>
          <button 
            onClick={() => setStatusFilter("pending")} 
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === "pending" ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            بانتظار المراجعة
          </button>
          <button 
            onClick={() => setStatusFilter("approved")} 
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === "approved" ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            تمت الموافقة
          </button>
          <button 
            onClick={() => setStatusFilter("rejected")} 
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === "rejected" ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            مرفوضة
          </button>
          <button 
            onClick={() => setStatusFilter("archived")} 
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === "archived" ? 'bg-slate-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            مؤرشفة
          </button>
        </div>
        <div className="relative flex-grow max-w-sm">
          <input
            type="text"
            placeholder="ابحث في التقييمات أو أسماء الزبائن..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* عرض التقييمات */}
      {reviews.length === 0 ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center text-gray-500">
          لا توجد تقييمات لعرضها في الوقت الحالي.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard 
              key={review._id} 
              review={review} 
              onUpdateStatus={handleStatusUpdate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;