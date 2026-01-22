import React, { useState, useMemo } from 'react';
import { X, Clock, CheckCircle2, Circle, MoreVertical, Trash2, Pencil, Save } from 'lucide-react';
import { Case, TodoItem, TodoCategory, TodoStatus } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { TodoInput } from './TodoInput';

interface CaseDrawerProps {
  caseData: Case | null;
  isOpen: boolean;
  onClose: () => void;
  todos: TodoItem[];
  onAddTodo: (caseId: string, content: string, category: TodoCategory) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, content: string) => void;
}

const TABS = ['照護需求', '價格費用', '聯絡資訊', '待辦事項'];

export const CaseDrawer: React.FC<CaseDrawerProps> = ({ 
  caseData, 
  isOpen, 
  onClose,
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo
}) => {
  const [activeTab, setActiveTab] = useState('待辦事項');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Filter todos for this specific case
  const caseTodos = useMemo(() => {
    if (!caseData) return [];
    return todos
      .filter(t => t.caseId === caseData.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first
  }, [todos, caseData]);

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

  if (!isOpen || !caseData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header Section */}
        <div className="p-6 pb-2 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{caseData.id}</h2>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">7416</span>
                <span>建立時間 {caseData.time}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {activeTab === '待辦事項' ? (
            <div className="flex flex-col h-full">
              {/* Input Area (Sticky Top) */}
              <div className="p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                <TodoInput 
                  onAdd={(content, cat) => onAddTodo(caseData.id, content, cat)} 
                />
              </div>

              {/* Timeline/List */}
              <div className="p-4 space-y-4">
                {caseTodos.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Clock size={32} className="opacity-50" />
                    </div>
                    <p>尚無待辦事項或紀錄</p>
                  </div>
                ) : (
                  caseTodos.map((todo) => {
                    const Config = CATEGORY_CONFIG[todo.category];
                    const isDone = todo.status === TodoStatus.COMPLETED;
                    const isEditing = editingId === todo.id;

                    return (
                      <div key={todo.id} className="group flex gap-3 relative pl-4">
                        {/* Timeline Connector */}
                        <div className="absolute left-[19px] top-8 bottom-[-16px] w-[2px] bg-gray-100 last:hidden" />
                        
                        {/* Status Icon */}
                        <button 
                          onClick={() => onToggleTodo(todo.id)}
                          className={`mt-1 flex-shrink-0 transition-colors ${
                            isDone ? 'text-green-500' : 'text-gray-300 hover:text-brand-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 size={22} className="fill-green-50" /> : <Circle size={22} />}
                        </button>

                        {/* Card */}
                        {isEditing ? (
                          <div className="flex-1 bg-white p-3 rounded-lg border border-brand-300 shadow-md ring-2 ring-brand-100 z-10">
                             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${Config.color}`}>
                                  <Config.icon size={10} />
                                  {Config.label}
                                </span>
                                <span className="text-xs text-brand-500 font-bold">編輯中...</span>
                             </div>
                             <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full text-sm border-0 p-0 focus:ring-0 resize-none bg-transparent outline-none min-h-[60px] text-gray-800"
                                autoFocus
                                placeholder="輸入內容..."
                              />
                              <div className="flex justify-end gap-2 mt-2 pt-2">
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 px-2 text-gray-400 hover:text-gray-600 rounded text-xs"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={() => saveEditing(todo.id)}
                                  className="py-1 px-3 text-white bg-brand-600 hover:bg-brand-700 rounded shadow-sm flex items-center gap-1 text-xs"
                                >
                                  <Save size={12} />
                                  儲存
                                </button>
                              </div>
                          </div>
                        ) : (
                          <div className={`flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md ${isDone ? 'opacity-75 bg-gray-50' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${Config.color}`}>
                                <Config.icon size={10} />
                                {Config.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{todo.createdAt}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEditing(todo)}
                                    className="text-gray-300 hover:text-brand-500 p-1"
                                    title="編輯"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button 
                                    onClick={() => onDeleteTodo(todo.id)}
                                    className="text-gray-300 hover:text-red-500 p-1"
                                    title="刪除"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <p className={`text-sm text-gray-800 leading-relaxed whitespace-pre-wrap ${isDone ? 'line-through text-gray-500' : ''}`}>
                              {todo.content}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                by {todo.creatorName}
                              </span>
                              {todo.dueDate && (
                                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                                  Due: {todo.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-gray-400">
              {/* Placeholder for other tabs */}
              <h3 className="text-lg font-medium text-gray-600 mb-2">{activeTab}</h3>
              <p>此區塊內容依實際需求開發...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};