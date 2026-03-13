<<<<<<< HEAD


function App() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f0f2f5',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#1a73e8' }}>مرحباً بك في نظام إدارة السيارات 🚗</h1>
      <p>إذا كنت ترى هذه الرسالة، فهذا يعني أن React يعمل بنجاح!</p>
      
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#d93025' }}>تأكد من الآتي لإصلاح الأخطاء الـ 14:</h3>
        <ul style={{ textAlign: 'right', direction: 'rtl' }}>
          <li>تأكد من تغيير <b>imoort</b> إلى <b>import</b> في كل الملفات.</li>
          <li>تأكد أنك قمت بحفظ جميع الملفات (Ctrl + S).</li>
          <li>افتح المتصفح واضغط F12 لترى إذا كان هناك أخطاء في الـ Console.</li>
        </ul>
      </div>
    </div>
=======
import LoginPage from "./pages/Login";

function App() {
  return (
    // درك رانا نقولو للمتصفح: "أظهر صفحة اللوڨين مباشرة"
    <LoginPage />
>>>>>>> d382507ea572d6a84bf6ab6305ac892fd0269226
  );
}

export default App;