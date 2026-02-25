import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function CarsPage() {
  const cars = useQuery(api.cars.getAllCars); // جلب السيارات
  const addCar = useMutation(api.cars.addCar); // موتيشن الإضافة

  // حالة الفورم (Form State)
  const [formData, setFormData] = useState({
    make: "", model: "", year: 2024,
    purchasePrice: 0, price: 0, mileage: 0,
    condition: "Excellent" as "Excellent" | "Good" | "Fair" | "Poor"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCar(formData);
      alert("تمت إضافة السيارة بنجاح! 🎉");
    } catch (error) {
      console.error(error);
      alert("خطأ في الإضافة، تأكد من البيانات.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">إدارة أسطول السيارات 🚗</h1>

      {/* 1. فورم إضافة سيارة */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input placeholder="الماركة (Dacia, Golf...)" className="border p-2 rounded" onChange={e => setFormData({...formData, make: e.target.value})} />
        <input placeholder="الموديل" className="border p-2 rounded" onChange={e => setFormData({...formData, model: e.target.value})} />
        <input type="number" placeholder="السنة" className="border p-2 rounded" onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
        <input type="number" placeholder="سعر الشراء (Purchase)" className="border p-2 rounded bg-red-50" onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
        <input type="number" placeholder="سعر البيع (Selling)" className="border p-2 rounded bg-green-50" onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
        <button type="submit" className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 transition">إضافة السيارة</button>
      </form>

      {/* 2. جدول عرض السيارات */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">السيارة</th>
              <th className="p-3 border">الحالة</th>
              <th className="p-3 border">سعر الشراء</th>
              <th className="p-3 border">سعر البيع</th>
              <th className="p-3 border">الوضعية</th>
            </tr>
          </thead>
          <tbody>
            {cars?.map((car) => (
              <tr key={car._id} className="hover:bg-gray-50">
                <td className="p-3 border font-semibold">{car.make} {car.model}</td>
                <td className="p-3 border text-sm text-gray-600">{car.condition}</td>
                <td className="p-3 border text-red-600">{car.purchasePrice.toLocaleString()} DA</td>
                <td className="p-3 border text-green-600">{car.price.toLocaleString()} DA</td>
                <td className="p-3 border">
                  <span className={`px-2 py-1 rounded-full text-xs ${car.status === "Available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {car.status === "Available" ? "متوفرة" : "مبيوعة"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}