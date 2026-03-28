import React from 'react';
import { Users, Phone, MapPin, Mail } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api"; // تأكدي من صحة المسار

const CustomersPage = () => {
  // جلب البيانات الحقيقية من Convex بدلاً من useState الوهمي
  const customers = useQuery(api.customers.getAllCustomers);

  // حالة التحميل: إذا كانت البيانات لم تصل بعد
  if (customers === undefined) {
    return <div style={{ padding: '30px' }}>جاري تحميل بيانات الزبائن...</div>;
  }

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ color: '#1B2559', marginBottom: '30px' }}>إدارة قاعدة بيانات الزبائن</h1>
      
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'right', color: '#A3AED0', borderBottom: '1px solid #F4F7FE' }}>
              <th style={{ padding: '15px' }}>الاسم الكامل</th>
              <th style={{ padding: '15px' }}>رقم الهاتف</th>
              <th style={{ padding: '15px' }}>البريد الإلكتروني</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} style={{ borderBottom: '1px solid #F4F7FE' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{c.fullName}</td>
                <td style={{ padding: '15px' }}><Phone size={14} /> {c.phone}</td>
                <td style={{ padding: '15px' }}>{c.email || "لا يوجد"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px' }}>لا يوجد زبائن حالياً.</p>}
      </div>
    </div>
  );
};

export default CustomersPage;