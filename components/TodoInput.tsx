import React, { useState } from 'react';
import { Send, Plus } from 'lucide-react';
import { TodoCategory } from '../types';
import { CATEGORY_CONFIG } from '../constants';

interface TodoInputProps {
  onAdd: (content: string, category: TodoCategory) => void;
  defaultCategory?: TodoCategory;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd, defaultCategory = TodoCategory.RECORD }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<TodoCategory>(defaultCategory);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, category);
    setText('');
    setIsExpanded(false); // Optional: collapse after submit
  };

  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'p-4 bg-white shadow-md rounded-lg border border-blue-100' : 'p-2'}`}>
      {!isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center gap-2 text-gray-500 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-lg p-3 transition-all"
        >
          <Plus size={18} />
          <span>新增待辦事項或紀錄...</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="輸入內容... (例如：家屬來電確認時間)"
            className="w-full p-2 text-sm border-0 focus:ring-0 resize-none bg-transparent outline-none min-h-[60px]"
          />
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar max-w-[80%]">
              {(Object.keys(CATEGORY_CONFIG) as TodoCategory[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap border transition-all
                      ${isSelected 
                        ? config.color + ' ring-1 ring-offset-1 ring-blue-300 font-medium scale-105' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                    `}
                  >
                    <config.icon size={12} />
                    {config.label}
                  </button>
                );
              })}
            </div>
            
            <button
              type="submit"
              disabled={!text.trim()}
              className="bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
