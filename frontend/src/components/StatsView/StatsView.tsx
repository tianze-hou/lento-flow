import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, PieChart, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// 统计数据类型定义
interface DailyStat {
  date: string;
  tasks: number;
  energy: number;
}

interface CategoryStat {
  name: string;
  value: number;
}

interface TodayOverview {
  completed_tasks: number;
  total_tasks: number;
  energy_spent: number;
  energy_budget: number;
  task_health: number;
  daily_score: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export const StatsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [todayOverview, setTodayOverview] = useState<TodayOverview>({
    completed_tasks: 0,
    total_tasks: 0,
    energy_spent: 0,
    energy_budget: 15,
    task_health: 100,
    daily_score: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // 从后端获取统计数据
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // 获取每日统计
      const dailyResponse = await fetch('/api/stats/daily', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        // 转换后端数据格式以适配前端组件
        const formattedDailyStats = dailyData.map((day: any) => ({
          date: day.date,
          tasks: day.tasks_completed,
          energy: day.energy_spent
        }));
        setDailyStats(formattedDailyStats);
      } else {
        console.error('获取每日统计失败');
      }
      
      // 获取今日概览（从今日视图API获取，因为统计API没有专门的今日概览端点）
      const todayResponse = await fetch('/api/today', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        setTodayOverview({
          completed_tasks: todayData.recommended_tasks.filter((task: any) => task.is_completed_today).length + 
                         (todayData.other_tasks?.filter((task: any) => task.is_completed_today).length || 0),
          total_tasks: todayData.recommended_tasks.length + (todayData.other_tasks?.length || 0),
          energy_spent: todayData.energy_spent,
          energy_budget: todayData.energy_budget,
          task_health: todayData.overall_health.score,
          daily_score: todayData.daily_score?.total_score || 0
        });
      } else {
        console.error('获取今日概览失败');
      }
      
      // 获取分类统计
      const categoryResponse = await fetch('/api/stats/category', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        setCategoryStats(categoryData);
      } else {
        console.error('获取分类统计失败');
        // 如果获取失败，生成空的分类数据
        setCategoryStats([]);
      }
    } catch (error) {
      console.error('获取统计数据出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">统计数据</h1>

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 border border-gray-200">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'daily' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('daily')}
        >
          <div className="flex items-center justify-center space-x-2">
            <BarChart3 size={16} />
            <span>每日统计</span>
          </div>
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'category' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('category')}
        >
          <div className="flex items-center justify-center space-x-2">
            <PieChart size={16} />
            <span>分类统计</span>
          </div>
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'trends' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('trends')}
        >
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp size={16} />
            <span>趋势分析</span>
          </div>
        </button>
      </div>

      {/* 统计内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 今日概览卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar size={18} className="mr-2" />
            今日概览
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">完成任务</p>
                <p className="text-2xl font-bold text-primary">{todayOverview.completed_tasks}/{todayOverview.total_tasks}</p>
                <p className="text-xs text-green-500 mt-1">+0 与昨日相比</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">消耗能量</p>
                <p className="text-2xl font-bold text-primary">{todayOverview.energy_spent}/{todayOverview.energy_budget}</p>
                <p className="text-xs text-yellow-500 mt-1">+0 与昨日相比</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">任务健康度</p>
                <p className="text-2xl font-bold text-primary">{todayOverview.task_health}%</p>
                <p className="text-xs text-green-500 mt-1">+0% 与昨日相比</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">今日得分</p>
                <p className="text-2xl font-bold text-primary">{todayOverview.daily_score.toFixed(1)}</p>
                <p className="text-xs text-orange-500 mt-1">+0.0 与昨日相比</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* 分类统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PieChart size={18} className="mr-2" />
            任务分类
          </h2>
          <div className="h-64">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <PieChart size={48} className="mb-2 opacity-50" />
                <p>暂无分类数据</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 每日统计图表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 md:col-span-2"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 size={18} className="mr-2" />
            最近7天统计
          </h2>
          <div className="h-80">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} name="完成任务数" />
                  <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} name="消耗能量" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BarChart3 size={48} className="mb-2 opacity-50" />
                <p>暂无每日统计数据</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
