import React, { useState, useCallback } from 'react';
import { 
  Home, 
  Megaphone, 
  Users, 
  UserCog, 
  ListTodo, 
  Briefcase, 
  CircleDollarSign, 
  PieChart, 
  Menu
} from 'lucide-react';
import { MOCK_CASES, MOCK_TODOS } from './services/mockData';
import { Case, TodoItem, ViewState, TodoCategory, TodoStatus } from './types';
import { CaseDrawer } from './components/CaseDrawer';
import { GlobalTodoList } from './components/GlobalTodoList';

const NAV_ITEMS = [
  { icon: Home, label: '首頁', id: 'HOME' },
  { icon: Megaphone, label: '公告', id: 'ANNOUNCEMENTS' },
  { icon: Users, label: '客戶', id: 'CLIENTS' },
  { icon: UserCog, label: '案件', id: 'CASES' },
  { icon: ListTodo, label: '待辦', id: 'TODOS' }, // The target tab
  { icon: Briefcase, label: '看護', id: 'CAREGIVERS' },
  { icon: CircleDollarSign, label: '會計', id: 'ACCOUNTING' },
  { icon: PieChart, label: '案件分析', id: 'ANALYTICS' },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('CASES');
  const [cases] = useState<Case[]>(MOCK_CASES);
  const [todos, setTodos] = useState<TodoItem[]>(MOCK_TODOS);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- Handlers ---

  const handleCaseClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsDrawerOpen(true);
  };

  const handleOpenCaseFromGlobal = (caseId: string) => {
    const foundCase = cases.find(c => c.id === caseId);
    if (foundCase) {
      handleCaseClick(foundCase);
    }
  };

  const handleAddTodo = useCallback((caseId: string, content: string, category: TodoCategory) => {
    const newTodo: TodoItem = {
      id: Math.random().toString(36).substr(2, 9),
      caseId,
      content,
      category,
      status: TodoStatus.PENDING,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      creatorName: '當前使用者', // Mock user
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const handleToggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === TodoStatus.PENDING ? TodoStatus.COMPLETED : TodoStatus.PENDING } 
        : t
    ));
  }, []);

  const handleEditTodo = useCallback((id: string, newContent: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, content: newContent } : t
    ));
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    if(window.confirm('確定要刪除這條紀錄嗎？')) {
        setTodos(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  // --- Render ---

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-500 text-white flex-shrink-0 flex flex-col shadow-xl z-30">
        <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">
                愛
            </div>
            <h1 className="text-2xl font-bold tracking-wider">愛護安</h1>
        </div>
        
        <div className="px-4 mb-4">
            <button className="w-full bg-white/10 hover:bg-white/20 p-2 rounded flex items-center justify-center">
                <Menu size={20} />
            </button>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id === 'TODOS' ? 'TODOS' : 'CASES')} // Simplified routing for demo
              className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                (currentView === 'TODOS' && item.id === 'TODOS') || (currentView === 'CASES' && item.id === 'CASES')
                  ? 'text-white font-bold bg-white/10 border-r-4 border-orange-300' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="text-base tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        
        {/* Render View Based on State */}
        {currentView === 'CASES' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Mock Header for Case List */}
             <div className="bg-white p-4 border-b border-gray-200 shadow-sm flex gap-4">
                <div className="bg-gray-100 border border-gray-300 rounded p-3 text-center w-24">
                    <div className="text-xs text-gray-500 font-bold">今日案量</div>
                    <div className="text-2xl font-bold text-gray-800">8</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center w-24">
                    <div className="text-xs text-blue-600 font-bold">上班中</div>
                    <div className="text-2xl font-bold text-blue-700">77</div>
                </div>
                 <div className="bg-red-50 border border-red-200 rounded p-3 text-center w-24">
                    <div className="text-xs text-red-600 font-bold">未到班</div>
                    <div className="text-2xl font-bold text-red-700">5</div>
                </div>
             </div>

             {/* Case List Table Mock */}
             <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-white border border-gray-200 shadow rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b font-medium text-gray-600 text-sm">
                        <div className="col-span-2">訂單編號</div>
                        <div className="col-span-2">案件狀態</div>
                        <div className="col-span-3">地點</div>
                        <div className="col-span-2">案主</div>
                        <div className="col-span-3">備註</div>
                    </div>
                    {cases.map(c => (
                        <div 
                            key={c.id}
                            onDoubleClick={() => handleCaseClick(c)}
                            className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 hover:bg-blue-50 cursor-pointer transition-colors items-center text-sm"
                        >
                            <div className="col-span-2 font-mono font-medium">{c.id}</div>
                            <div className="col-span-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                    c.status === '未派遺' ? 'bg-yellow-100 text-yellow-800' :
                                    c.status === '未到班' ? 'bg-red-100 text-red-800' :
                                    c.status === '已派遺' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {c.status}
                                </span>
                            </div>
                            <div className="col-span-3 truncate text-gray-600">{c.hospital}</div>
                            <div className="col-span-2 font-medium">{c.patientName}</div>
                            <div className="col-span-3 text-gray-400 text-xs">雙擊開啟詳情...</div>
                        </div>
                    ))}
                </div>
                <p className="text-center text-gray-400 mt-4 text-sm">提示：雙擊案件行可開啟側邊欄查看詳細與待辦</p>
             </div>
          </div>
        )}

        {currentView === 'TODOS' && (
           <div className="flex-1 h-full overflow-y-auto bg-gray-50">
               <div className="p-6 pb-0">
                    <h2 className="text-2xl font-bold text-gray-800">全域待辦事項中心</h2>
                    <p className="text-gray-500 mt-1">匯整所有案件的處理進度與歷史紀錄</p>
               </div>
               <GlobalTodoList 
                 todos={todos} 
                 cases={cases}
                 onToggleTodo={handleToggleTodo}
                 onOpenCase={handleOpenCaseFromGlobal}
                 onEditTodo={handleEditTodo}
               />
           </div>
        )}

        {/* Global Components */}
        <CaseDrawer 
          caseData={selectedCase}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          todos={todos}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onEditTodo={handleEditTodo}
        />

      </main>
    </div>
  );
}

export default App;