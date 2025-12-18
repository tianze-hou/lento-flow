import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Edit, Trash, Check } from 'lucide-react';

// 模拟任务数据
const mockTasks = [
  {
    id: 1,
    name: '练习吉他',
    energy_cost: 3,
    expected_interval: 2,
    importance: 4,
    category: '学习',
    color: '#f59e0b',
    icon: 'guitar',
    is_active: true,
    last_done_date: '2025-12-15',
    health: 65
  },
  {
    id: 2,
    name: '日语学习',
    energy_cost: 2,
    expected_interval: 2,
    importance: 5,
    category: '学习',
    color: '#ef4444',
    icon: 'book',
    is_active: true,
    last_done_date: '2025-12-13',
    health: 42
  },
  {
    id: 3,
    name: '阅读',
    energy_cost: 2,
    expected_interval: 1,
    importance: 3,
    category: '学习',
    color: '#10b981',
    icon: 'book-open',
    is_active: true,
    last_done_date: '2025-12-17',
    health: 75
  },
  {
    id: 4,
    name: '运动',
    energy_cost: 4,
    expected_interval: 3,
    importance: 4,
    category: '健康',
    color: '#3b82f6',
    icon: 'dumbbell',
    is_active: true,
    last_done_date: '2025-12-16',
    health: 85
  },
  {
    id: 5,
    name: '冥想',
    energy_cost: 1,
    expected_interval: 1,
    importance: 2,
    category: '健康',
    color: '#8b5cf6',
    icon: 'brain',
    is_active: true,
    last_done_date: '2025-12-17',
    health: 90
  }
];

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.is_active;
    if (filter === 'inactive') return !task.is_active;
    return true;
  });

  // 切换任务状态
  const toggleTaskActive = (taskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, is_active: !task.is_active };
      }
      return task;
    }));
  };

  // 删除任务
  const deleteTask = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // 添加任务（模拟）
  const addTask = () => {
    const newTask = {
      id: tasks.length + 1,
      name: '新任务',
      energy_cost: 2,
      expected_interval: 2,
      importance: 3,
      category: '其他',
      color: '#6366f1',
      icon: 'star',
      is_active: true,
      last_done_date: new Date().toISOString().split('T')[0], // 使用当前日期作为字符串
      health: 100
    };
    setTasks(prev => [...prev, newTask]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">任务管理</h1>
        <div className="flex items-center space-x-3">
          {/* 过滤按钮 */}
          <div className="relative">
            <button 
              className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" 
              onClick={() => setFilter(filter === 'all' ? 'active' : filter === 'active' ? 'inactive' : 'all')}
            >
              <Filter size={16} />
              <span>{filter === 'all' ? '全部' : filter === 'active' ? '活跃' : '不活跃'}</span>
            </button>
          </div>
          {/* 添加任务按钮 */}
          <button 
            className="flex items-center space-x-1 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90" 
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>添加任务</span>
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <AnimatePresence>
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* 任务图标 */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: task.color + '20' }}>
                    <span className="text-2xl">{task.icon === 'guitar' ? '🎸' : task.icon === 'book' ? '📚' : task.icon === 'book-open' ? '📖' : task.icon === 'dumbbell' ? '🏋️' : task.icon === 'brain' ? '🧠' : '⭐'}</span>
                  </div>
                  {/* 任务信息 */}
                  <div>
                    <h3 className={`font-medium ${!task.is_active ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <span className="mr-1">⚡</span>
                        {task.energy_cost}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">📅</span>
                        {task.expected_interval}天/次
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">⭐</span>
                        {task.importance}/5
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">🏥</span>
                        {task.health}%
                      </span>
                    </div>
                  </div>
                </div>
                {/* 操作按钮 */}
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
                    title="编辑"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100"
                    title="删除"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash size={16} />
                  </button>
                  <button 
                    className={`p-2 rounded-lg ${task.is_active ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:text-primary hover:bg-gray-100'}`}
                    title={task.is_active ? '标记为不活跃' : '标记为活跃'}
                    onClick={() => toggleTaskActive(task.id)}
                  >
                    <Check size={16} className={task.is_active ? 'opacity-100' : 'opacity-0'} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* 空状态 */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <span className="text-4xl block mb-2">📋</span>
          <h3 className="font-medium text-gray-800 mb-1">暂无任务</h3>
          <p className="text-gray-500 text-sm">点击上方的"添加任务"按钮开始创建你的第一个习惯吧！</p>
        </div>
      )}

      {/* 添加任务模态框 */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">添加新任务</h2>
              {/* 任务表单 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="输入任务名称"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">能量消耗 (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      defaultValue="2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">期望间隔 (天)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30" 
                      defaultValue="2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">重要性 (1-5)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="5" 
                    defaultValue="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              {/* 模态框按钮 */}
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  取消
                </button>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90" 
                  onClick={addTask}
                >
                  添加
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
