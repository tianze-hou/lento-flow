import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Shield, Bell, Palette } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const SettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [settings, setSettings] = useState({
    daily_energy_budget: 15,
    max_daily_tasks: 5,
    notifications: true,
    dark_mode: false,
    language: 'zh-CN'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 从用户数据初始化设置
  useEffect(() => {
    if (user) {
      setSettings({
        daily_energy_budget: user.daily_energy_budget,
        max_daily_tasks: user.max_daily_tasks,
        notifications: user.settings?.notifications ?? true,
        dark_mode: user.settings?.dark_mode ?? false,
        language: user.settings?.language ?? 'zh-CN'
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          daily_energy_budget: settings.daily_energy_budget,
          max_daily_tasks: settings.max_daily_tasks,
          settings: {
            notifications: settings.notifications,
            dark_mode: settings.dark_mode,
            language: settings.language
          }
        })
      });

      if (!response.ok) {
        throw new Error('保存设置失败');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setSuccess('设置已保存！');
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    let value: string | boolean;
    
    if (type === 'checkbox') {
      value = (e.target as HTMLInputElement).checked;
    } else {
      value = e.target.value;
    }
    
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">加载用户信息失败</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">设置</h1>

      {/* 消息提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 侧边导航 */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 sticky top-4">
            <nav className="space-y-1">
              <button className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-primary bg-primary/10 font-medium">
                <User size={18} />
                <span>基本设置</span>
              </button>
              <button className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
                <Shield size={18} />
                <span>隐私设置</span>
              </button>
              <button className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
                <Bell size={18} />
                <span>通知设置</span>
              </button>
              <button className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
                <Palette size={18} />
                <span>外观设置</span>
              </button>
            </nav>
          </div>
        </div>

        {/* 主设置区域 */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User size={18} className="mr-2" />
              基本设置
            </h2>

            <div className="space-y-6">
              {/* 每日能量预算 */}
              <div>
                <label htmlFor="daily_energy_budget" className="block text-sm font-medium text-gray-700 mb-1">
                  每日能量预算
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    id="daily_energy_budget"
                    name="daily_energy_budget"
                    min="5"
                    max="30"
                    value={settings.daily_energy_budget}
                    onChange={handleChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700 w-12">{settings.daily_energy_budget}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">设置你每日可用于完成任务的能量值</p>
              </div>

              {/* 每日最大任务数 */}
              <div>
                <label htmlFor="max_daily_tasks" className="block text-sm font-medium text-gray-700 mb-1">
                  每日最大任务数
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    id="max_daily_tasks"
                    name="max_daily_tasks"
                    min="1"
                    max="10"
                    value={settings.max_daily_tasks}
                    onChange={handleChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700 w-12">{settings.max_daily_tasks}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">设置系统每天推荐的最大任务数量</p>
              </div>

              {/* 语言设置 */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  语言
                </label>
                <select
                  id="language"
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>

              {/* 通知设置 */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="notifications" className="block text-sm font-medium text-gray-700">
                    启用通知
                  </label>
                  <p className="text-xs text-gray-500 mt-1">接收任务提醒和每日总结</p>
                </div>
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>

              {/* 深色模式 */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="dark_mode" className="block text-sm font-medium text-gray-700">
                    深色模式
                  </label>
                  <p className="text-xs text-gray-500 mt-1">切换深色/浅色主题</p>
                </div>
                <input
                  type="checkbox"
                  id="dark_mode"
                  name="dark_mode"
                  checked={settings.dark_mode}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="mt-8 flex justify-end">
              <button
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                <span>{isSaving ? '保存中...' : '保存设置'}</span>
              </button>
            </div>
          </motion.div>

          {/* 账户信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">账户信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <p className="text-sm text-gray-600">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注册日期</label>
                <p className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
