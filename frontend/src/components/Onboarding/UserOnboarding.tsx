import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Calendar, BarChart3, ListChecks, Settings, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

export const UserOnboarding: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 检查用户是否已完成引导
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding && user) {
      // 延迟显示，让应用加载完成
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: '欢迎使用 LentoFlow',
      description: 'LentoFlow 是一个弹性习惯打卡系统，帮助你轻松养成好习惯。',
      icon: <Calendar size={24} />
    },
    {
      id: 2,
      title: '今日视图',
      description: '在今日视图中查看和完成你的日常任务。',
      icon: <Calendar size={24} />,
      target: 'today'
    },
    {
      id: 3,
      title: '统计数据',
      description: '查看你的习惯养成进度和统计数据。',
      icon: <BarChart3 size={24} />,
      target: 'stats'
    },
    {
      id: 4,
      title: '任务管理',
      description: '创建和管理你的习惯任务。',
      icon: <ListChecks size={24} />,
      target: 'tasks'
    },
    {
      id: 5,
      title: '个性化设置',
      description: '根据你的需求调整应用设置。',
      icon: <Settings size={24} />,
      target: 'settings'
    },
    {
      id: 6,
      title: '开始你的习惯之旅',
      description: '现在，开始创建你的第一个习惯任务吧！',
      icon: <Check size={24} />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* 关闭按钮 */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          {/* 步骤指示器 */}
          <div className="bg-primary/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {steps[currentStep].icon}
                <h2 className="text-lg font-semibold text-primary">{steps[currentStep].title}</h2>
              </div>
              <div className="text-xs text-gray-500">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="bg-primary h-1.5 rounded-full"
              />
            </div>
          </div>

          {/* 步骤内容 */}
          <div className="p-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-600 mb-8">{steps[currentStep].description}</p>

              {/* 步骤插图 */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-primary/10 rounded-full p-8"
                >
                  {React.cloneElement(steps[currentStep].icon as React.ReactElement, {
                    size: 48,
                    className: 'text-primary'
                  })}
                </motion.div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-between items-center">
                {currentStep > 0 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    上一步
                  </button>
                ) : (
                  <button
                    onClick={handleSkip}
                    className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    跳过
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <span>{currentStep === steps.length - 1 ? '完成' : '下一步'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
