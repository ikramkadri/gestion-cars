import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"; // لاحظي @ اللي خدمناها!

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm border-b mb-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-blue-700">CarGestion</span>
      </div>
      
      <div className="hidden md:flex space-x-6 font-medium">
        <Link to="/" className="text-gray-600 hover:text-blue-600 transition">الرئيسية</Link>
        <Link to="/cars" className="text-gray-600 hover:text-blue-600 transition">السيارات</Link>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" className="hidden sm:inline-flex">دخول</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">أضف سيارة</Button>
      </div>
    </nav>
  );
}