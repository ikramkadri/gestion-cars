import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ShoppingCart, User, CreditCard } from 'lucide-react';

const SalesPage = () => {
  // 1. جلب السيارات المتوفرة فقط للبيع
  const availableCars = useQuery(api.cars.getCars)?.filter(car => car.status === "Available");
  const createSale = useMutation(api.sales.createSale);

  const [formData, setFormData] = useState({
    carId: '',
    customerName: '',
    phone: '',
    amount: 0,
    paymentMethod: 'Cash'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.carId) return alert("الرجاء اختيار سيارة");
    
    // تنفيذ السيناريو: إنشاء زبون + تسجيل بيع + تحديث حالة السيارة
    await createSale({
      carId: formData.carId as any,
      customerName: formData.customerName,
      phone: formData.phone,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod
    });
    
    alert("تمت عملية البيع بنجاح وتحديث المخزن!");
    setFormData({ carId: '', customerName: '', phone: '', amount: 0, paymentMethod: 'Cash' });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart /> تسجيل عملية بيع جديدة
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-2xl">
        <div className="grid grid-cols-1 gap-4">
          {/* اختيار السيارة */}
          <label className="block">
            <span className="text-gray-700">اختر السيارة من المخزن:</span>
            <select 
              className="mt-1 block w-full border rounded p-2"
              onChange={e => setFormData({...formData, carId: e.target.value})}
              required
            >
              <option value="">-- اختر سيارة --</option>
              {availableCars?.map(car => (
                <option key={car._id} value={car._id}>{car.make} {car.model} ({car.price} DA)</option>
              ))}
            </select>
          </label>

          {/* معلومات الزبون */}
          <input 
            placeholder="اسم الزبون الكامل" 
            className="border p-2 rounded"
            onChange={e => setFormData({...formData, customerName: e.target.value})}
            required 
          />
          <input 
            placeholder="رقم الهاتف" 
            className="border p-2 rounded"
            onChange={e => setFormData({...formData, phone: e.target.value})}
            required 
          />

          {/* تفاصيل الدفع */}
          <input 
            type="number" 
            placeholder="المبلغ المدفوع" 
            className="border p-2 rounded"
            onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
            required 
          />
          
          <button type="submit" className="bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
            إتمام عملية البيع
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesPage;