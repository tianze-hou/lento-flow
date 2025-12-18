import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from '../TaskCard/TaskCard';
import { HealthBar } from '../HealthBar/HealthBar';
import { EnergyMeter } from '../EnergyMeter/EnergyMeter';

// 模拟 API 数据
const mockTodayData = {
  date: '2025-12-18',
  energy_budget: 15,
  energy_spent: 6,
  energy_remaining: 9,
  recommended_tasks: [
    {
      id: 1,
      name: '练习吉他',
      energy_cost: 3,
      urgency: 1.8,
      urgency_level: 'normal',
      health: 65,
      last_done: '2025-12-15',
      days_since: 3,
      expected_interval: 2,
      is_completed_today: false,
      icon: 'guitar',
      color: '#f59e0b'
    },
    {
      id: 2,
      name: '日语学习',
      energy_cost: 2,
      urgency: 2.3,
      urgency_level: 'high',
      health: 42,
      last_done: '2025-12-13',
      days_since: 5,
      expected_interval: 2,
      is_completed_today: false,
      icon: 'book',
      color: '#ef4444'
    },
    {
      id: 3,
      name: '阅读',
      energy_cost: 2,
      urgency: 1.5,
      urgency_level: 'normal',
      health: 75,
      last_done: '2025-12-17',
      days_since: 1,
      expected_interval: 1,
      is_completed_today: true,
      icon: 'book-open',
      color: '#10b981'
    }
  ],
  other_tasks: [
    {
      id: 4,
      name: '运动',
      energy_cost: 4,
      urgency: 1.2,
      urgency_level: 'normal',
      health: 85,
      last_done: '2025-12-16',
      days_since: 2,
      expected_interval: 3,
      is_completed_today: false,
      icon: 'dumbbell',
      color: '#3b82f6'
    },
    {
      id: 5,
      name: '冥想',
      energy_cost: 1,
      urgency: 0.8,
      urgency_level: 'low',
      health: 90,
      last_done: '2025-12-17',
      days_since: 1,
      expected_interval: 1,
      is_completed_today: true,
      icon: 'brain',
      color: '#8b5cf6'
    }
  ],
  overall_health: {
    score: 72,
    status: 'healthy',
    icon: '🌿',
    message: '整体状态良好'
  },
  daily_score: {
    base_score: 40,
    urgent_bonus: 5.4,
    total_score: 45.4,
    grade: 'okay',
    message: '不错的一天！ 👍',
    energy_spent: 6,
    tasks_completed: 2
  },
  motivational_message: '今天状态不错！先完成日语学习吧，它已经等你5天了 📚'
};

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

export const TodayView: React.FC = () => {
  const [data, setData] = useState(mockTodayData);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟 API 调用
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockTodayData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // 处理任务完成
  const handleCompleteTask = (taskId: number) => {
    setData(prev => {
      // 更新推荐任务
      const updatedRecommended = prev.recommended_tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, is_completed_today: !task.is_completed_today };
        }
        return task;
      });

      // 更新其他任务
      const updatedOthers = prev.other_tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, is_completed_today: !task.is_completed_today };
        }
        return task;
      });

      return {
        ...prev,
        recommended_tasks: updatedRecommended,
        other_tasks: updatedOthers
      };
    });
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
            {recommended_tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TaskCard
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                />
              </motion.div>
            ))}
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
                onComplete={() => handleCompleteTask(task.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};