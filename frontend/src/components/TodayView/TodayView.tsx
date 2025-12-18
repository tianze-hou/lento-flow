import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from '../TaskCard/TaskCard';
import { HealthBar } from '../HealthBar/HealthBar';
import { EnergyMeter } from '../EnergyMeter/EnergyMeter';

// 任务类型定义
interface Task {
  id: number;
  name: string;
  energy_cost: number;
  urgency: number;
  urgency_level: 'low' | 'normal' | 'high';
  health: number;
  last_done: string;
  days_since: number;
  expected_interval: number;
  is_completed_today: boolean;
  icon: string;
  color: string;
}

// 今日数据类型定义
interface TodayData {
  date: string;
  energy_budget: number;
  energy_spent: number;
  energy_remaining: number;
  recommended_tasks: Task[];
  other_tasks: Task[];
  overall_health: {
    score: number;
    status: string;
    icon: string;
    message: string;
  };
  daily_score: {
    base_score: number;
    urgent_bonus: number;
    total_score: number;
    grade: string;
    message: string;
    energy_spent: number;
    tasks_completed: number;
  };
  motivational_message: string;
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

// 初始空数据
const initialEmptyData: TodayData = {
  date: new Date().toISOString().split('T')[0],
  energy_budget: 15,
  energy_spent: 0,
  energy_remaining: 15,
  recommended_tasks: [],
  other_tasks: [],
  overall_health: {
    score: 100,
    status: 'healthy',
    icon: '�',
    message: '开始你的习惯之旅吧！'
  },
  daily_score: {
    base_score: 0,
    urgent_bonus: 0,
    total_score: 0,
    grade: 'new',
    message: '今天是全新的一天！ �',
    energy_spent: 0,
    tasks_completed: 0
  },
  motivational_message: '欢迎来到 LentoFlow！开始创建你的第一个习惯吧 💪'
};

export const TodayView: React.FC = () => {
  const [data, setData] = useState<TodayData>(initialEmptyData);
  const [isLoading, setIsLoading] = useState(false);

  // 从后端获取今日数据
  const fetchTodayData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/today', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const todayData = await response.json();
        setData(todayData);
      } else {
        console.error('获取今日数据失败');
      }
    } catch (error) {
      console.error('获取今日数据出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchTodayData();
  }, []);

  // 处理任务完成/取消完成
  const handleCompleteTask = async (taskId: number, isCompleted: boolean) => {
    try {
      // 根据当前状态决定HTTP方法
      const method = isCompleted ? 'DELETE' : 'POST';
      const response = await fetch(`/api/today/complete/${taskId}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        // 只有POST请求需要body
        body: method === 'POST' ? JSON.stringify({}) : undefined
      });
      
      if (response.ok) {
        // 重新获取最新数据
        fetchTodayData();
      } else {
        const errorData = await response.json();
        console.error('更新任务状态失败:', errorData.detail);
      }
    } catch (error) {
      console.error('更新任务状态出错:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }

  const {
    date,
    energy_budget,
    energy_spent,
    recommended_tasks,
    other_tasks,
    overall_health,
    daily_score,
    motivational_message
  } = data;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 日期和激励语 */}
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {formatDate(date)}
        </h1>
        <p className="text-gray-600 mt-2">
          {motivational_message}
        </p>
      </header>

      {/* 能量条 */}
      <EnergyMeter 
        spent={energy_spent} 
        budget={energy_budget} 
      />

      {/* 整体健康度 */}
      <HealthBar 
        score={overall_health.score}
        status={overall_health.status}
        icon={overall_health.icon}
        message={overall_health.message}
      />

      {/* 今日得分（如果有完成的任务） */}
      {daily_score && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">今日得分</p>
              <p className="text-3xl font-bold">{daily_score.total_score}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl">{daily_score.grade === 'excellent' ? '🌟' : daily_score.grade === 'good' ? '💪' : '👍'}</p>
              <p className="text-sm">{daily_score.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 推荐任务 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">🎯</span>
          今日推荐
          <span className="ml-2 text-sm text-gray-400">
            ({recommended_tasks.filter(t => t.is_completed_today).length}/{recommended_tasks.length})
          </span>
        </h2>
        
        <AnimatePresence>
          <div className="space-y-3">
            {recommended_tasks.length > 0 ? (
              recommended_tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TaskCard
                    task={task}
                    onComplete={() => handleCompleteTask(task.id, !task.is_completed_today)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500">
                暂无推荐任务，去创建你的第一个任务吧！
              </div>
            )}
          </div>
        </AnimatePresence>
      </section>

      {/* 其他任务（可折叠） */}
      {other_tasks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">📋</span>
            其他任务
          </h2>
          <div className="space-y-3">
            {other_tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                onComplete={() => handleCompleteTask(task.id, !task.is_completed_today)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};