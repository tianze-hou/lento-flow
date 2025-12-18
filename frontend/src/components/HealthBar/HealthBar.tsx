import React from 'react';
import { motion } from 'framer-motion';

interface HealthBarProps {
  score: number;
  status: string;
  icon: string;
  message: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({ score, icon, message }) => {
  // 根据健康度获取颜色
  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-medium text-gray-800">整体健康度</h3>
        </div>
        <span className="text-sm font-semibold text-gray-600">{score}%</span>
      </div>
      <div className="relative">
        {/* 背景条 */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* 填充条 */}
          <motion.div
            className={`h-full rounded-full ${getHealthColor(score)}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">{message}</p>
    </div>
  );
};
