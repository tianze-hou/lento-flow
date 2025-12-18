import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, PieChart, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// 模拟统计数据
const mockDailyStats = [
  { date: '12/12', tasks: 2, energy: 4 },
  { date: '12/13', tasks: 3, energy: 7 },
  { date: '12/14', tasks: 1, energy: 2 },
  { date: '12/15', tasks: 4, energy: 9 },
  { date: '12/16', tasks: 2, energy: 5 },
  { date: '12/17', tasks: 3, energy: 6 },
  { date: '12/18', tasks: 2, energy: 4 }
];

const mockCategoryStats = [
  { name: '学习', value: 8 },
  { name: '健康', value: 5 },
  { name: '工作', value: 3 },
  { name: '其他', value: 2 }
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export const StatsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');

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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">完成任务</p>
              <p className="text-2xl font-bold text-primary">2/5</p>
              <p className="text-xs text-green-500 mt-1">+1 与昨日相比</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">消耗能量</p>
              <p className="text-2xl font-bold text-primary">6/15</p>
              <p className="text-xs text-yellow-500 mt-1">+2 与昨日相比</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">任务健康度</p>
              <p className="text-2xl font-bold text-primary">72%</p>
              <p className="text-xs text-green-500 mt-1">+3% 与昨日相比</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">今日得分</p>
              <p className="text-2xl font-bold text-primary">45.4</p>
              <p className="text-xs text-orange-500 mt-1">-5.2 与昨日相比</p>
            </div>
          </div>
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
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={mockCategoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockCategoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockDailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} name="完成任务数" />
                <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} name="消耗能量" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
