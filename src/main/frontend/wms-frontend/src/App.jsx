import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Database, ArrowDownToLine, ArrowUpFromLine, 
  ShieldAlert, Search, LogOut, UserCircle, Lock,
  FileSpreadsheet, CheckCircle2, Box,
  Users, Fingerprint
} from 'lucide-react';

// ==========================================
// 1. MÔ PHỎNG DATABASE (Initial State)
// ==========================================

const initUsers = [
  { id: 'U1', username: 'admin', password: '123', role: 'ADMIN', name: 'Nguyễn Văn Quản Trị' },
  { id: 'U2', username: 'kho', password: '123', role: 'KEEPER', name: 'Trần Thị Thủ Kho' }
];

const initCategories = [
  { id: 'C1', name: 'Tủ lạnh' },
  { id: 'C2', name: 'Máy giặt' }
];

const initProducts = [
  { id: 'P1', sku: 'TL-INV-400', name: 'Tủ lạnh Inverter 400L', categoryId: 'C1', importPrice: 8000000, exportPrice: 12000000 },
  { id: 'P2', sku: 'MG-LNN-090', name: 'Máy giặt lồng ngang 9Kg', categoryId: 'C2', importPrice: 6500000, exportPrice: 9500000 }
];

const initSuppliers = [{ id: 'S1', name: 'Công ty TNHH LG Việt Nam' }];
const initCustomers = [{ id: 'CUS1', name: 'Đại lý Điện Máy Xanh' }];

const initReceipts = [];
const initIssues = [];

const initSerialNumbers = [
  { sn: 'SN-TL-INV-400-001', productId: 'P1', receiptId: 'INIT', issueId: null, status: 'AVAILABLE', createdAt: '2026-03-01T10:00:00' },
  { sn: 'SN-TL-INV-400-002', productId: 'P1', receiptId: 'INIT', issueId: null, status: 'AVAILABLE', createdAt: '2026-03-01T10:00:00' },
  { sn: 'SN-MG-LNN-090-001', productId: 'P2', receiptId: 'INIT', issueId: null, status: 'DEFECTIVE', createdAt: '2026-03-01T10:00:00' },
];

export default function WMSThesisApp() {
  // ==========================================
  // 2. STATE MANAGEMENT
  // ==========================================
  const [currentUser, setCurrentUser] = useState(null); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [products] = useState(initProducts);
  const [suppliers] = useState(initSuppliers);
  const [customers] = useState(initCustomers);
  const [receipts, setReceipts] = useState(initReceipts);
  const [issues, setIssues] = useState(initIssues);
  const [serialNumbers, setSerialNumbers] = useState(initSerialNumbers);

  const [inboundForm, setInboundForm] = useState({ supplierId: 'S1', productId: 'P1', qty: 1 });
  const [outboundForm, setOutboundForm] = useState({ customerId: 'CUS1', productId: 'P1', qty: 1 });
  const [trackingSearch, setTrackingSearch] = useState('');

  // ==========================================
  // 3. CORE LOGIC
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    const user = initUsers.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
    } else {
      alert('Sai tài khoản hoặc mật khẩu! (Dùng admin/123 hoặc kho/123)');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
  };

  // Dạng code gọi Backend (Demo)
const handleInboundSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Chuẩn bị dữ liệu JSON (DTO) để gửi xuống Java
    const requestData = {
        supplierId: inboundForm.supplierId,
        items: [
            { productId: inboundForm.productId, quantity: inboundForm.qty }
        ]
    };

    try {
        // 2. Gọi xuống Backend (thay bằng URL thực tế của bạn)
        const response = await fetch('http://localhost:8080/api/receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            alert('Nhập kho và sinh Serial thành công từ Backend!');
            // 3. Gọi thêm API để lấy lại danh sách Serial mới nhất hiển thị ra màn hình
        }
    } catch (error) {
        console.error('Lỗi gọi API:', error);
    }
};

  const handleOutboundSubmit = (e) => {
    e.preventDefault();
    const { customerId, productId, qty } = outboundForm;
    const quantity = parseInt(qty);
    if (quantity <= 0) return alert('Số lượng phải lớn hơn 0');

    const availableSNs = serialNumbers.filter(sn => sn.productId === productId && sn.status === 'AVAILABLE');
    
    if (availableSNs.length < quantity) {
      return alert(`Lỗi: Tồn kho không đủ!\nYêu cầu: ${quantity}\nThực tế có thể xuất: ${availableSNs.length}`);
    }

    const pickedSNs = availableSNs.slice(0, quantity);
    const pickedSN_IDs = pickedSNs.map(sn => sn.sn);

    const newIssueId = `IS-${Date.now().toString().slice(-6)}`;
    const newIssue = { id: newIssueId, customerId, date: new Date().toLocaleString(), userId: currentUser.id };

    const updatedSerialNumbers = serialNumbers.map(sn => {
      if (pickedSN_IDs.includes(sn.sn)) {
        return { ...sn, status: 'SOLD', issueId: newIssueId };
      }
      return sn;
    });

    setIssues([...issues, newIssue]);
    setSerialNumbers(updatedSerialNumbers);
    alert(`Xuất kho thành công!\nHệ thống tự động pick ${quantity} S/N (FIFO) và chuyển trạng thái sang SOLD.\nCác S/N đã xuất: ${pickedSN_IDs.join(', ')}`);
  };

  const handleMarkDefective = (snCode) => {
    if(window.confirm(`Xác nhận đánh dấu Serial ${snCode} là hàng hỏng/lỗi? Mã này sẽ không thể xuất kho.`)) {
      setSerialNumbers(serialNumbers.map(sn => 
        sn.sn === snCode ? { ...sn, status: 'DEFECTIVE' } : sn
      ));
    }
  };

  // ==========================================
  // 4. TÍNH TOÁN DATA CHO DASHBOARD
  // ==========================================
  const inventoryData = useMemo(() => {
    return products.map(p => {
      const availableQty = serialNumbers.filter(sn => sn.productId === p.id && sn.status === 'AVAILABLE').length;
      const defectiveQty = serialNumbers.filter(sn => sn.productId === p.id && sn.status === 'DEFECTIVE').length;
      const soldQty = serialNumbers.filter(sn => sn.productId === p.id && sn.status === 'SOLD').length;
      return { ...p, availableQty, defectiveQty, soldQty, totalValue: availableQty * p.importPrice };
    });
  }, [products, serialNumbers]);

  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.totalValue, 0);

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Mã SKU,Tên sản phẩm,Tồn kho (Available),Hàng lỗi,Đã bán,Tổng giá trị tồn\n";
    inventoryData.forEach(row => {
      csvContent += `${row.sku},${row.name},${row.availableQty},${row.defectiveQty},${row.soldQty},${row.totalValue}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BaoCao_TonKho_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // 5. RENDERS (UI)
  // ==========================================

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96">
          <div className="flex flex-col items-center mb-6">
            <Box size={48} className="text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-slate-800">WMS Đồ Án Tốt Nghiệp</h1>
            <p className="text-sm text-slate-500">Đăng nhập hệ thống</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản</label>
              <input type="text" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="admin hoặc kho" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">Đăng nhập</button>
          </form>
          <div className="mt-4 text-xs text-gray-400 text-center">
            Role Admin: admin/123 <br/> Role Thủ kho: kho/123
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Bảng điều khiển (Dashboard)</h2>
        {currentUser.role === 'ADMIN' && (
          <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
            <FileSpreadsheet size={18}/> Xuất báo cáo Excel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 mb-1">Tổng thiết bị đang lưu kho</p>
          <p className="text-3xl font-bold text-gray-800">{serialNumbers.filter(sn=>sn.status==='AVAILABLE').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500 mb-1">Tổng thiết bị đã xuất</p>
          <p className="text-3xl font-bold text-gray-800">{serialNumbers.filter(sn=>sn.status==='SOLD').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500 mb-1">Thiết bị lỗi (DEFECTIVE)</p>
          <p className="text-3xl font-bold text-red-600">{serialNumbers.filter(sn=>sn.status==='DEFECTIVE').length}</p>
        </div>
        {currentUser.role === 'ADMIN' ? (
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
            <p className="text-sm text-gray-500 mb-1">Tổng giá trị tồn kho</p>
            <p className="text-xl font-bold text-purple-600">{totalInventoryValue.toLocaleString()} VNĐ</p>
          </div>
        ) : (
          <div className="bg-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
            <Lock size={20} className="mr-2"/> Ẩn với Thủ kho
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b bg-gray-50"><h3 className="font-bold text-gray-700">Báo cáo Xuất - Nhập - Tồn thời gian thực</h3></div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-gray-500">
            <tr><th className="p-4">SKU</th><th className="p-4">Tên sản phẩm</th><th className="p-4 text-center">Tồn khả dụng<br/>(AVAILABLE)</th><th className="p-4 text-center text-red-500">Hàng lỗi<br/>(DEFECTIVE)</th><th className="p-4 text-center">Đã bán<br/>(SOLD)</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventoryData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-medium">{item.sku}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4 text-center font-bold text-lg text-blue-600">{item.availableQty}</td>
                <td className="p-4 text-center font-bold text-red-500">{item.defectiveQty}</td>
                <td className="p-4 text-center font-bold text-green-600">{item.soldQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInbound = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><ArrowDownToLine className="text-blue-500"/> Lập Phiếu Nhập Kho</h2>
        <form onSubmit={handleInboundSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung cấp</label>
            <select value={inboundForm.supplierId} onChange={e=>setInboundForm({...inboundForm, supplierId: e.target.value})} className="w-full border rounded-lg px-3 py-2">
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sản phẩm</label>
            <select value={inboundForm.productId} onChange={e=>setInboundForm({...inboundForm, productId: e.target.value})} className="w-full border rounded-lg px-3 py-2">
              {products.map(p => <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng nhập</label>
            <input type="number" min="1" value={inboundForm.qty} onChange={e=>setInboundForm({...inboundForm, qty: e.target.value})} className="w-full border rounded-lg px-3 py-2" required/>
          </div>
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0"/>
            <p><strong>Nghiệp vụ cốt lõi:</strong> Hệ thống sẽ tự động sinh {inboundForm.qty} mã Serial duy nhất và gán trạng thái AVAILABLE sau khi lưu.</p>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700">Tạo phiếu & Nhập kho</button>
        </form>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Lịch sử Phiếu Nhập</h3>
        <div className="space-y-3">
          {receipts.slice().reverse().map(r => (
            <div key={r.id} className="p-3 bg-gray-50 border rounded-lg text-sm flex justify-between">
              <div>
                <p className="font-bold text-gray-700">{r.id}</p>
                <p className="text-gray-500">{suppliers.find(s=>s.id===r.supplierId)?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">{r.date}</p>
                <p className="text-xs font-mono">User: {initUsers.find(u=>u.id===r.userId)?.username}</p>
              </div>
            </div>
          ))}
          {receipts.length === 0 && <p className="text-gray-400 text-center py-4">Chưa có phiếu nhập nào</p>}
        </div>
      </div>
    </div>
  );

  const renderOutbound = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><ArrowUpFromLine className="text-green-500"/> Lập Phiếu Xuất Kho</h2>
        <form onSubmit={handleOutboundSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Khách hàng / Đại lý</label>
            <select value={outboundForm.customerId} onChange={e=>setOutboundForm({...outboundForm, customerId: e.target.value})} className="w-full border rounded-lg px-3 py-2">
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sản phẩm cần xuất</label>
            <select value={outboundForm.productId} onChange={e=>setOutboundForm({...outboundForm, productId: e.target.value})} className="w-full border rounded-lg px-3 py-2">
              {products.map(p => <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng xuất</label>
            <input type="number" min="1" value={outboundForm.qty} onChange={e=>setOutboundForm({...outboundForm, qty: e.target.value})} className="w-full border rounded-lg px-3 py-2" required/>
          </div>
          <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0"/>
            <p><strong>Nghiệp vụ cốt lõi:</strong> Hệ thống sẽ quét kho, lấy ra {outboundForm.qty} mã Serial sớm nhất (FIFO) trạng thái AVAILABLE để xuất đi.</p>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700">Tạo phiếu & Xuất kho</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Lịch sử Phiếu Xuất</h3>
        <div className="space-y-3">
          {issues.slice().reverse().map(i => (
            <div key={i.id} className="p-3 bg-gray-50 border rounded-lg text-sm flex justify-between">
              <div>
                <p className="font-bold text-gray-700">{i.id}</p>
                <p className="text-gray-500">{customers.find(c=>c.id===i.customerId)?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">{i.date}</p>
                <p className="text-xs font-mono">User: {initUsers.find(u=>u.id===i.userId)?.username}</p>
              </div>
            </div>
          ))}
          {issues.length === 0 && <p className="text-gray-400 text-center py-4">Chưa có phiếu xuất nào</p>}
        </div>
      </div>
    </div>
  );

  const renderTraceability = () => {
    const searchResult = trackingSearch ? serialNumbers.find(sn => sn.sn.toLowerCase().includes(trackingSearch.toLowerCase())) : null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Fingerprint className="text-purple-500"/> Traceability (Truy xuất)</h2>
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Nhập mã Serial Number để tra cứu (Ví dụ: SN-TL-INV-400-001)..." 
              value={trackingSearch}
              onChange={e => setTrackingSearch(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"><Search size={18}/> Tra cứu</button>
          </div>

          {trackingSearch && searchResult ? (
            <div className="border border-purple-200 rounded-lg p-5 bg-purple-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold font-mono text-gray-800">{searchResult.sn}</h3>
                  <p className="text-sm text-gray-600">Sản phẩm: <strong>{products.find(p=>p.id===searchResult.productId)?.name}</strong></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  searchResult.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-700' :
                  searchResult.status === 'SOLD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  Trạng thái: {searchResult.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-purple-100 pt-4">
                <div>
                  <p className="text-gray-500 mb-1">Nguồn gốc nhập (Inbound):</p>
                  <p className="font-medium text-gray-800">Phiếu: {searchResult.receiptId}</p>
                  <p className="text-gray-500">Thời gian: {new Date(searchResult.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Lịch sử xuất (Outbound):</p>
                  {searchResult.issueId ? (
                    <p className="font-medium text-gray-800">Phiếu xuất: {searchResult.issueId}</p>
                  ) : (
                    <p className="text-gray-400 italic">Chưa xuất kho</p>
                  )}
                </div>
              </div>

              {searchResult.status === 'AVAILABLE' && (
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleMarkDefective(searchResult.sn)}
                    className="flex items-center gap-2 text-sm bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 font-medium transition-colors"
                  >
                    <ShieldAlert size={16}/> Báo lỗi (Chuyển sang DEFECTIVE)
                  </button>
                </div>
              )}
            </div>
          ) : trackingSearch && (
            <div className="text-center py-8 text-gray-500">Không tìm thấy mã Serial này.</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b bg-gray-50"><h3 className="font-bold text-gray-700">Tất cả mã Serial trong DB (Dùng để copy test)</h3></div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white sticky top-0 text-gray-500 shadow-sm">
                <tr><th className="p-3">Serial Number</th><th className="p-3">Sản phẩm</th><th className="p-3 text-center">Trạng thái</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {serialNumbers.slice().reverse().map(sn => (
                  <tr key={sn.sn} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{sn.sn}</td>
                    <td className="p-3 text-xs font-sans text-gray-500">{products.find(p=>p.id===sn.productId)?.name}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-sans ${sn.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-600' : sn.status === 'SOLD' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {sn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 6. LAYOUT & NAVIGATION
  // ==========================================
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Báo cáo', icon: LayoutDashboard, roles: ['ADMIN', 'KEEPER'] },
    { id: 'inbound', label: 'Nhập kho (Inbound)', icon: ArrowDownToLine, roles: ['ADMIN', 'KEEPER'] },
    { id: 'outbound', label: 'Xuất kho (Outbound)', icon: ArrowUpFromLine, roles: ['ADMIN', 'KEEPER'] },
    { id: 'tracking', label: 'Quản lý Serial & Hàng lỗi', icon: Fingerprint, roles: ['ADMIN', 'KEEPER'] },
    { id: 'master', label: 'Master Data (Giả lập)', icon: Database, roles: ['ADMIN'] },
    { id: 'users', label: 'Phân quyền User', icon: Users, roles: ['ADMIN'] },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Box className="text-blue-500" size={32} />
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">WMS Project</h1>
            <p className="text-[10px] tracking-wider text-slate-500">THESIS EDITION</p>
          </div>
        </div>
        
        <div className="p-4 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle size={24} className="text-slate-400"/>
            <div>
              <p className="text-sm font-bold text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">Role: <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentUser.role==='ADMIN'?'bg-red-900 text-red-300':'bg-blue-900 text-blue-300'}`}>{currentUser.role}</span></p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
          {navItems.filter(item => item.roles.includes(currentUser.role)).map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm font-medium ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
            <LogOut size={16}/> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 flex items-center justify-between px-8 shadow-sm z-0">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            {navItems.find(i=>i.id===activeTab)?.label}
          </h2>
          <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border">
            Sinh viên thực hiện: Nhóm Đồ Án WMS
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'inbound' && renderInbound()}
          {activeTab === 'outbound' && renderOutbound()}
          {activeTab === 'tracking' && renderTraceability()}
          
          {(activeTab === 'master' || activeTab === 'users') && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-8 rounded-xl text-center flex flex-col items-center">
              <Database size={48} className="text-yellow-400 mb-4"/>
              <h2 className="text-xl font-bold mb-2">Module chỉ dành cho Admin</h2>
              <p>Màn hình này mô phỏng các thao tác CRUD cơ bản.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}