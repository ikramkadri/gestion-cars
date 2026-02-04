import React, { useState } from 'react';

export default function Sales() {
  // هادي باش نتحكمو في فتح وغلق النافذة
  const [showModal, setShowModal] = useState(false);

  const carsData = [
    { id: 1, brand: "Toyota", model: "Yaris", price: "240M", status: "Vendu" },
    { id: 2, brand: "Hyundai", model: "Accent", price: "310M", status: "Disponible" },
    { id: 3, brand: "Dacia", model: "Stepway", price: "280M", status: "Disponible" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">🚗 إدارة مبيعات السيارات</h1>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 border">الماركة</th>
                <th className="p-3 border">الموديل</th>
                <th className="p-3 border">السعر</th>
                <th className="p-3 border">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {carsData.map((car) => (
                <tr key={car.id} className="hover:bg-gray-100 transition">
                  <td className="p-3 border font-medium">{car.brand}</td>
                  <td className="p-3 border">{car.model}</td>
                  <td className="p-3 border text-green-600 font-bold">{car.price}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded text-xs ${car.status === 'Vendu' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {car.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* الزر درك راهو يغير حالة showModal لـ true */}
        <button 
          onClick={() => setShowModal(true)}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
        >
          إضافة سيارة جديدة +
        </button>
      </div>

      {/* هادي هي النافذة (Modal) اللي تظهر كي نضغطو على الزر */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">إضافة سيارة للمخزن</h2>
            <div className="space-y-4">
              <input type="text" placeholder="الماركة (مثلا: Kia)" className="w-full border p-2 rounded" />
              <input type="text" placeholder="الموديل (مثلا: Picanto)" className="w-full border p-2 rounded" />
              <input type="text" placeholder="السعر" className="w-full border p-2 rounded" />
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded">إلغاء</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-blue-600 text-white py-2 rounded">حفظ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}