import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Edit, Trash, Check } from 'lucide-react';

// 任务类型定义
interface Task {
  id: number;
  name: string;
  energy_cost: number;
  expected_interval: number;
  importance: number;
  category: string;
  color: string;
  icon: string;
  is_active: boolean;
  last_done_date: string;
  health: number;
}

// 新建任务表单数据类型
interface NewTaskFormData {
  name: string;
  energy_cost: number;
  expected_interval: number;
  importance: number;
  category_id: number;
  icon: string;
  color: string;
}

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTaskForm, setNewTaskForm] = useState<NewTaskFormData>({
    name: '',
    energy_cost: 2,
    expected_interval: 2,
    importance: 3,
    category_id: 0,
    icon: 'star',
    color: '#6366f1'
  });

  // 类别数据类型
  interface Category {
    id: number;
    name: string;
    color: string;
    order: number;
    is_active: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
  };

  // 从后端获取任务列表
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      } else {
        console.error('获取任务列表失败');
      }
    } catch (error) {
      console.error('获取任务列表出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 从后端获取类别列表
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      } else {
        console.error('获取类别列表失败');
      }
    } catch (error) {
      console.error('获取类别列表出错:', error);
    }
  };

  // 初始加载任务和类别
  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.is_active;
    if (filter === 'inactive') return !task.is_active;
    return true;
  });

  // 切换任务状态
  const toggleTaskActive = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !task.is_active
        })
      });
      
      if (response.ok) {
        // 更新本地状态
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, is_active: !t.is_active } : t
        ));
      } else {
        console.error('更新任务状态失败');
      }
    } catch (error) {
      console.error('更新任务状态出错:', error);
    }
  };

  // 删除任务
  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // 更新本地状态
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        console.error('删除任务失败');
      }
    } catch (error) {
      console.error('删除任务出错:', error);
    }
  };

  // 处理表单输入变化
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewTaskForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  // 添加任务
  const addTask = async () => {
    if (!newTaskForm.name.trim()) return;
    
    try {
      // 处理category_id，0表示无类别
      const taskData = {
        ...newTaskForm,
        category_id: newTaskForm.category_id === 0 ? null : newTaskForm.category_id
      };
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [...prev, newTask]);
        setIsAddModalOpen(false);
        // 重置表单
        setNewTaskForm({
          name: '',
          energy_cost: 2,
          expected_interval: 2,
          importance: 3,
          category_id: 0,
          icon: 'star',
          color: '#6366f1'
        });
      } else {
        console.error('添加任务失败');
      }
    } catch (error) {
      console.error('添加任务出错:', error);
    }
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
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-primary text-lg font-medium">加载中...</div>
          </div>
        ) : (
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
          
          {/* 空状态 */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <span className="text-4xl block mb-2">📋</span>
              <h3 className="font-medium text-gray-800 mb-1">暂无任务</h3>
              <p className="text-gray-500 text-sm">点击上方的"添加任务"按钮开始创建你的第一个习惯吧！</p>
            </div>
          )}
        </div>
      )}
      </AnimatePresence>

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
                    name="name"
                    value={newTaskForm.name}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="输入任务名称"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">能量消耗 (1-5)</label>
                    <input 
                      type="number" 
                      name="energy_cost"
                      value={newTaskForm.energy_cost}
                      onChange={handleFormChange}
                      min="1" 
                      max="5"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">期望间隔 (天)</label>
                    <input 
                      type="number" 
                      name="expected_interval"
                      value={newTaskForm.expected_interval}
                      onChange={handleFormChange}
                      min="1" 
                      max="30"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">重要性 (1-5)</label>
                  <input 
                    type="number" 
                    name="importance"
                    value={newTaskForm.importance}
                    onChange={handleFormChange}
                    min="1" 
                    max="5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务类别</label>
                  <select 
                    name="category_id"
                    value={newTaskForm.category_id}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value={0}>无类别</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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
