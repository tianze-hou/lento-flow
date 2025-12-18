import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Clock } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: number;
    name: string;
    energy_cost: number;
    urgency: number;
    urgency_level: string;
    health: number;
    days_since: number | null;
    is_completed_today: boolean;
    icon?: string;
    color?: string;
  };
  variant?: 'default' | 'compact';
  onComplete: () => void;
}

const urgencyColors = {
  low: 'bg-green-100 border-green-300 text-green-700',
  normal: 'bg-yellow-100 border-yellow-300 text-yellow-700',
  high: 'bg-orange-100 border-orange-300 text-orange-700',
  critical: 'bg-red-100 border-red-300 text-red-700'
};

const urgencyDots = {
  low: '🟢',
  normal: '🟡',
  high: '🟠',
  critical: '🔴'
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = 'default',
  onComplete
}) => {
  const handleClick = () => {
    onComplete();
  };

  return (
    <motion.div
      layout
      className={`
        relative overflow-hidden rounded-xl border-2 transition-all
        ${task.is_completed_today 
          ? 'bg-gray-50 border-gray-200 opacity-75' 
          : urgencyColors[task.urgency_level as keyof typeof urgencyColors]}
        ${variant === 'compact' ? 'p-3' : 'p-4'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* 紧迫度指示 */}
          <span className="text-lg">
            {urgencyDots[task.urgency_level as keyof typeof urgencyDots]}
          </span>
          
          {/* 任务名 */}
          <div>
            <h3 className={`font-medium ${task.is_completed_today ? 'line-through text-gray-400' : ''}`}>
              {task.name}
            </h3>
            {variant === 'default' && (
              <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center">
                  <Zap size={14} className="mr-1" />
                  {task.energy_cost}
                </span>
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {task.days_since === null 
                    ? '从未完成' 
                    : task.days_since === 0 
                      ? '今天' 
                      : `${task.days_since}天前`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 完成按钮 */}
        <motion.button
          onClick={handleClick}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-colors
            ${task.is_completed_today
              ? 'bg-green-500 text-white' 
              : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500'}
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Check size={20} />
        </motion.button>
      </div>

      {/* 健康度进度条 */}
      {variant === 'default' && !task.is_completed_today && (
        <div className="h-1 bg-gray-200 mt-3">
          <motion.div
            className={`h-full ${getHealthColor(task.health)}`}
            initial={{ width: 0 }}
            animate={{ width: `${task.health}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      )}
    </motion.div>
  );
};

// 根据健康度获取颜色
function getHealthColor(health: number): string {
  if (health >= 70) return 'bg-green-500';
  if (health >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}
