import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Filter, 
  Search, 
  ArrowUpRight,
  LayoutList,
  CalendarClock,
  Pencil,
  Save,
  Calendar,
  AlertCircle,
  History,
  Inbox
} from 'lucide-react';
import { TodoItem, TodoStatus, Case, TodoCategory } from '../types';
import { CATEGORY_CONFIG } from '../constants';

interface GlobalTodoListProps {
  todos: TodoItem[];
  cases: Case[];
  onToggleTodo: (id: string) => void;
  onOpenCase: (caseId: string) => void;
  onEditTodo: (id: string, content: string) => void;
}

export const GlobalTodoList: React.FC<GlobalTodoListProps> = ({ 
  todos, 
  cases, 
  onToggleTodo,
  onOpenCase,
  onEditTodo
}) => {
  // 1. Get Real Today for "Due & Urgent" section (Always fixed)
  const realTodayStr = new Date().toISOString().split('T')[0];
  
  // 2. User Selected Date for "Logs" section (Editable)
  const [selectedDate, setSelectedDate] = useState<string>(realTodayStr);
  
  // Filters: Categories is now an array for multi-select
  const [selectedCategories, setSelectedCategories] = useState<TodoCategory[]>([]);
  const [search, setSearch] = useState('');
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Statistics
  const stats = useMemo(() => {
    const pending = todos.filter(t => t.status === TodoStatus.PENDING).length;
    const completed = todos.filter(t => t.status === TodoStatus.COMPLETED).length;
    const urgent = todos.filter(t => t.status === TodoStatus.PENDING && t.category === TodoCategory.CANCEL).length;
    return { pending, completed, urgent };
  }, [todos]);

  // Handle Category Toggle
  const toggleCategory = (cat: TodoCategory) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  const clearCategoryFilter = () => {
    setSelectedCategories([]);
  };

  // Grouping Logic
  const groupedTodos = useMemo(() => {
    const groups = {
      due: [] as TodoItem[],      // Fixed: Real Today Due or Urgent Pending
      logs: [] as TodoItem[],     // Filtered: Selected Date Created
      backlog: [] as TodoItem[]   // Global: All Pending (minus due)
    };

    const dueIds = new Set<string>();

    // 1. First Pass: Identify Due & Urgent (Based on REAL TIME, ignored by filters)
    todos.forEach(todo => {
      const isCompleted = todo.status === TodoStatus.COMPLETED;
      // Condition: Due Date is Today OR Category is Cancel/Urgent
      // AND must be Pending (Prompt: "Must be processed today")
      const isDueRealToday = todo.dueDate === realTodayStr && !isCompleted;
      const isUrgentType = todo.category === TodoCategory.CANCEL && !isCompleted;

      if (isDueRealToday || isUrgentType) {
        groups.due.push(todo);
        dueIds.add(todo.id);
      }
    });

    // 2. Second Pass: Logs and Backlog (Subject to Category/Search filters)
    todos.forEach(todo => {
      // -- Filter Logic --
      // Multi-select Category Filter: If array is not empty, check if todo.category is included
      if (selectedCategories.length > 0 && !selectedCategories.includes(todo.category)) return;
      
      // Search Filter
      if (search) {
        const relatedCase = cases.find(c => c.id === todo.caseId);
        const searchContent = (todo.content + todo.caseId + (relatedCase?.patientName || '')).toLowerCase();
        if (!searchContent.includes(search.toLowerCase())) return;
      }

      // -- A. Daily Logs Logic (Based on SELECTED DATE) --
      // Show everything created on that day (Pending OR Completed)
      const todoDate = todo.createdAt.split(' ')[0];
      if (todoDate === selectedDate) {
        groups.logs.push(todo);
      }

      // -- B. Backlog Logic (Global Pending) --
      // Show all pending items that are NOT already in the "Due" section
      // Note: Backlog is usually "everything else", so we show it if it matches filters
      if (todo.status === TodoStatus.PENDING && !dueIds.has(todo.id)) {
         groups.backlog.push(todo);
      }
    });

    // Sorting: Newest first
    const sortFn = (a: TodoItem, b: TodoItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    groups.due.sort(sortFn);
    groups.logs.sort(sortFn);
    groups.backlog.sort(sortFn);

    return groups;
  }, [todos, cases, selectedCategories, search, selectedDate, realTodayStr]);

  // Handlers for Editing
  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.content);
  };

  const saveEditing = (id: string) => {
    if (editText.trim()) {
      onEditTodo(id, editText);
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  // Helper Component
  const TodoCard: React.FC<{ todo: TodoItem, isUrgent?: boolean }> = ({ todo, isUrgent = false }) => {
    const Config = CATEGORY_CONFIG[todo.category];
    // Fallback if category was removed but data persists (safety check)
    if (!Config) return null;
    
    const relatedCase = cases.find(c => c.id === todo.caseId);
    const isDone = todo.status === TodoStatus.COMPLETED;
    const isEditing = editingId === todo.id;

    return (
      <div 
        className={`
            group relative bg-white rounded-lg p-4 border transition-all duration-200 hover:shadow-md flex gap-4 items-start
            ${isEditing ? 'ring-2 ring-brand-100 border-brand-300 z-10' : ''}
            ${!isEditing && isDone ? 'border-gray-100 bg-gray-50 opacity-80' : ''}
            ${!isEditing && !isDone && isUrgent ? 'border-red-200 bg-red-50/30' : ''}
            ${!isEditing && !isDone && !isUrgent ? 'border-gray-200 hover:border-brand-300' : ''}
        `}
      >
        <button 
            onClick={() => onToggleTodo(todo.id)}
            className={`mt-1 flex-shrink-0 transition-colors ${isDone ? 'text-green-500' : 'text-gray-300 hover:text-brand-500'}`}
        >
            {isDone ? <CheckCircle2 size={24} className="fill-green-50" /> : <Circle size={24} />}
        </button>

        <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
                 <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${Config.color}`}>
                    <Config.icon size={12} />
                    {Config.label}
                 </span>
                 
                 <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                    <span className="text-gray-300">|</span>
                    <button 
                        onClick={() => onOpenCase(todo.caseId)}
                        className="hover:text-brand-600 hover:underline flex items-center gap-1 transition-colors"
                    >
                        {todo.caseId} 
                        <span className="text-gray-400 font-normal">({relatedCase?.patientName || '未知案主'})</span>
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                 </div>
                 
                 <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400">{todo.createdAt}</span>
                    {!isEditing && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); startEditing(todo); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-brand-600 transition-opacity"
                          title="編輯"
                      >
                          <Pencil size={14} />
                      </button>
                    )}
                 </div>
            </div>

            {isEditing ? (
              <div className="mt-2 animate-in fade-in duration-200">
                 <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-base border border-gray-200 rounded p-2 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 resize-y bg-white outline-none min-h-[80px] text-gray-800"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={cancelEditing} className="p-1 px-3 text-gray-500 hover:bg-gray-100 rounded text-sm">取消</button>
                    <button onClick={() => saveEditing(todo.id)} className="py-1 px-4 text-white bg-brand-600 hover:bg-brand-700 rounded shadow-sm flex items-center gap-1 text-sm font-medium"><Save size={14} /> 儲存</button>
                  </div>
              </div>
            ) : (
               <p className={`text-base text-gray-800 mb-2 whitespace-pre-wrap ${isDone ? 'line-through text-gray-400' : ''}`}>
                   {todo.content}
               </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                 <span>建立者: {todo.creatorName}</span>
                 {todo.dueDate && (
                     <span className={`font-medium px-2 py-0.5 rounded ${isDone ? 'text-gray-400 bg-gray-100' : 'text-red-600 bg-red-100'}`}>
                        截止: {todo.dueDate}
                     </span>
                 )}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">總待處理</p><p className="text-2xl font-bold text-brand-600">{stats.pending}</p></div>
          <LayoutList size={24} className="text-brand-200" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">總完成數</p><p className="text-2xl font-bold text-emerald-600">{stats.completed}</p></div>
          <CheckCircle2 size={24} className="text-emerald-200" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">急件追蹤</p><p className="text-2xl font-bold text-red-600">{stats.urgent}</p></div>
          <AlertCircle size={24} className="text-red-200" />
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 shrink-0 sticky top-0 z-20">
        <div className="p-4 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
          
          {/* Top Row: Date & Search (on small screens) / Left Side (on large screens) */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
             {/* Date Picker */}
             <div className="flex items-center gap-3 bg-brand-50/50 p-2 rounded-lg border border-brand-100 self-start">
                <Calendar size={20} className="text-brand-600 ml-2" />
                <div className="flex flex-col">
                    <label className="text-[10px] text-brand-600 font-bold uppercase tracking-wider mb-0.5">篩選日期 (紀錄)</label>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent border-0 p-0 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer h-5 outline-none"
                    />
                </div>
                {selectedDate !== realTodayStr && (
                    <button 
                        onClick={() => setSelectedDate(realTodayStr)}
                        className="ml-2 text-xs bg-white border border-brand-200 text-brand-600 px-2 py-1 rounded hover:bg-brand-50"
                    >
                        回今天
                    </button>
                )}
             </div>

             {/* Search */}
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="搜尋關鍵字..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all h-full"
                />
             </div>
          </div>

          <div className="h-px w-full bg-gray-100 xl:hidden"></div>
          <div className="w-px h-12 bg-gray-200 hidden xl:block mx-2"></div>

          {/* Multi-select Category Chips */}
          <div className="flex items-center gap-2 flex-wrap">
             <div className="text-xs text-gray-400 font-medium mr-1 flex items-center gap-1">
                <Filter size={14} />
                <span>分類篩選:</span>
             </div>
             
             {/* "All" Button */}
             <button
                onClick={clearCategoryFilter}
                className={`
                    px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                    ${selectedCategories.length === 0 
                        ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                `}
             >
                全部顯示
             </button>

             {/* Category Buttons */}
             {Object.keys(CATEGORY_CONFIG).map((key) => {
                 const cat = key as TodoCategory;
                 const config = CATEGORY_CONFIG[cat];
                 const isSelected = selectedCategories.includes(cat);
                 
                 return (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                            ${isSelected 
                                ? `${config.color.replace('bg-', 'bg-opacity-90 bg-').replace('text-', 'text-opacity-100 text-').replace('border-', 'border-opacity-100 border-')} shadow-sm ring-1 ring-offset-1 ring-gray-200 transform scale-105` 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                        `}
                    >
                        <config.icon size={12} className={isSelected ? 'text-current' : 'text-gray-400'} />
                        {config.label}
                    </button>
                 );
             })}
          </div>
        </div>
      </div>

      {/* Main Content: Grouped Sections */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2 pb-10">
        
        {/* Section 1: Due Today & Urgent (Fixed to Real Time) */}
        {groupedTodos.due.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-3 text-red-600">
                    <CalendarClock size={20} />
                    <h3 className="font-bold text-lg">到期與急件 ({groupedTodos.due.length})</h3>
                    <span className="text-xs font-normal bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded">今日必須處理</span>
                    <div className="h-px bg-red-100 flex-1 ml-2"></div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {groupedTodos.due.map(todo => <TodoCard key={todo.id} todo={todo} isUrgent />)}
                </div>
            </section>
        )}

        {/* Section 2: Daily Logs (Filtered by Date Picker) */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-3 text-brand-600">
                <History size={20} />
                <h3 className="font-bold text-lg">本日新增紀錄 ({groupedTodos.logs.length})</h3>
                <span className="text-xs font-normal text-gray-500">({selectedDate})</span>
                <div className="h-px bg-brand-100 flex-1 ml-2"></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {groupedTodos.logs.length > 0 ? (
                    groupedTodos.logs.map(todo => <TodoCard key={todo.id} todo={todo} />)
                ) : (
                    <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-400">
                        {selectedDate === realTodayStr ? "今天尚未有新增紀錄" : "該日期無符合篩選條件的紀錄"}
                    </div>
                )}
            </div>
        </section>

        {/* Section 3: Backlog (Global Pending, excluding Due) */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center gap-2 mb-3 text-gray-500 mt-8">
                <Inbox size={20} />
                <h3 className="font-bold text-lg">待辦積壓 ({groupedTodos.backlog.length})</h3>
                <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded">未完成事項總覽</span>
                <div className="h-px bg-gray-200 flex-1 ml-2"></div>
            </div>
            <div className="grid grid-cols-1 gap-3 opacity-90">
                {groupedTodos.backlog.length > 0 ? (
                    groupedTodos.backlog.map(todo => <TodoCard key={todo.id} todo={todo} />)
                ) : (
                    <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-400">
                        {selectedCategories.length > 0 ? "篩選條件下無積壓項目" : "太棒了！目前沒有積壓的待辦事項"}
                    </div>
                )}
            </div>
        </section>
        
      </div>
    </div>
  );
};