import React from 'react';
import { Doc } from '../../convex/_generated/dataModel'; // Corrected path
import { Star, CheckCircle, XCircle, Archive, User, Car, Clock, MessageSquare } from 'lucide-react';

// تعريف نوع التقييم مع إضافة carName
interface ReviewWithCarName extends Doc<"reviews"> {
  carName: string;
}

interface ReviewCardProps {
  review: ReviewWithCarName;
  onUpdateStatus: (reviewId: Doc<"reviews">["_id"], newStatus: "pending" | "approved" | "rejected" | "archived") => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onUpdateStatus }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < rating ? "currentColor" : "none"} 
        className={i < rating ? "text-amber-400" : "text-gray-300"} 
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-emerald-100 text-emerald-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "archived": return "bg-slate-100 text-slate-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
      {/* معلومات الزبون والتقييم */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <User size={20} />
        </div>
        <div>
          <p className="font-black text-slate-800 text-base">{review.userName}</p>
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
            <span className="text-xs text-gray-500 ml-1">({review.rating}.0)</span>
          </div>
        </div>
      </div>

      {/* محتوى التقييم */}
      <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-grow">
        <MessageSquare size={16} className="inline-block text-gray-400 ml-2" />
        {review.comment}
      </p>

      {/* معلومات السيارة والحالة */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Car size={16} className="text-indigo-500" />
          <span>{review.carName}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(review.status)}`}>
          {review.status === "pending" && "بانتظار المراجعة"}
          {review.status === "approved" && "موافق عليه"}
          {review.status === "rejected" && "مرفوض"}
          {review.status === "archived" && "مؤرشف"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
        <Clock size={14} />
        <span>{new Date(review.createdAt).toLocaleDateString('ar-DZ')}</span>
      </div>

      {/* أزرار الإجراءات (للأدمن) */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
        {review.status !== "approved" && (
          <button 
            onClick={() => onUpdateStatus(review._id, "approved")}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
          >
            <CheckCircle size={16} /> قبول
          </button>
        )}
        {review.status !== "rejected" && (
          <button 
            onClick={() => onUpdateStatus(review._id, "rejected")}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
          >
            <XCircle size={16} /> رفض
          </button>
        )}
        {review.status !== "archived" && (
          <button 
            onClick={() => onUpdateStatus(review._id, "archived")}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-slate-500 text-white text-xs font-bold hover:bg-slate-600 transition-colors"
          >
            <Archive size={16} /> أرشفة
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;