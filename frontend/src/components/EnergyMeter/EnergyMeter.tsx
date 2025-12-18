import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface EnergyMeterProps {
  spent: number;
  budget: number;
}

export const EnergyMeter: React.FC<EnergyMeterProps> = ({ spent, budget }) => {
  const percentage = Math.min(100, (spent / budget) * 100);
  const remaining = budget - spent;

  // 根据剩余能量获取颜色
  const getEnergyColor = (remaining: number): string => {
    const ratio = remaining / budget;
    if (ratio >= 0.5) return 'bg-green-500';
    if (ratio >= 0.25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Zap size={20} className="text-yellow-500" />
          <h3 className="font-medium text-gray-800">今日能量</h3>
        </div>
        <span className="text-sm font-semibold text-gray-600">
          {spent} / {budget}
        </span>
      </div>
      <div className="relative">
        {/* 背景条 */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* 填充条 */}
          <motion.div
            className={`h-full rounded-full ${getEnergyColor(remaining)}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>已消耗</span>
        <span>剩余: {remaining}</span>
      </div>
    </div>
  );
};
