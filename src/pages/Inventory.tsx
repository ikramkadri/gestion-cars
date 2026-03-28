import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Trash2, Car, Calendar, DollarSign, Gauge } from 'lucide-react';

const Inventory = () => {
  // 1. جلب البيانات من الباك-أند
  const cars = useQuery(api.cars.getCars);
  const addCar = useMutation(api.cars.addCar);
  const deleteCar = useMutation(api.cars.deleteCar);

  // 2. حالة الـ Form (إضافة سيارة جديدة)
  const [newCar, setNewCar] = useState({
    make: '', model: '', year: 2024, price: 0, mileage: 0, condition: 'Excellent', status: 'Available'
  });

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCar(newCar);
    setNewCar({ make: '', model: '', year: 2024, price: 0, mileage: 0, condition: 'Excellent', status: 'Available' });
  };

  if (cars === undefined) return <p>جاري تحميل المخزن...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">إدارة المخزون (Inventory)</h1>

      {/* نموذج إضافة سيارة */}
      <form onSubmit={handleAddCar} className="bg-white p-6 rounded-xl shadow-sm mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <input placeholder="الماركة (Make)" className="border p-2 rounded" value={newCar.make} onChange={e => setNewCar({...newCar, make: e.target.value})} required />
        <input placeholder="الموديل (Model)" className="border p-2 rounded" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} required />
        <input type="number" placeholder="السعر" className="border p-2 rounded" value={newCar.price} onChange={e => setNewCar({...newCar, price: Number(e.target.value)})} required />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded flex items-center justify-center gap-2">
          <Plus size={18} /> إضافة سيارة
        </button>
      </form>

      {/* جدول عرض السيارات */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">السيارة</th>
              <th className="p-4">السنة</th>
              <th className="p-4">السعر</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{car.make} {car.model}</td>
                <td className="p-4">{car.year}</td>
                <td className="p-4 text-green-600 font-bold">{car.price.toLocaleString()} DA</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${car.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {car.status}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => deleteCar({ id: car._id })} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;