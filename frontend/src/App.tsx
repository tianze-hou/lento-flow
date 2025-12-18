
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Calendar, BarChart3, ListChecks, Settings, LogOut } from 'lucide-react'

// 认证相关
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { useAuth } from './hooks/useAuth'

// 页面组件
import { TodayView } from './components/TodayView/TodayView'
import { TaskList } from './components/TaskList/TaskList'
import { StatsView } from './components/StatsView/StatsView'
import { SettingsView } from './components/SettingsView/SettingsView'
import { UserOnboarding } from './components/Onboarding/UserOnboarding'

// 主应用内容组件，包含导航和保护路由
const AppContent = () => {
  const { user, logout } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">LentoFlow</h1>
            </div>
            {/* 用户信息和登出按钮 */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              <button 
                onClick={logout} 
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
                <span>登出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:ml-64">
        <Routes>
          {/* 保护路由 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TodayView />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Route>
        </Routes>
      </div>
      
      {/* 用户引导组件 */}
      <UserOnboarding />

      {/* 底部导航栏（移动端） */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden">
        <div className="flex justify-around">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`
            }
          >
            <Calendar size={20} />
            <span className="text-xs mt-1">今日</span>
          </NavLink>
          <NavLink 
            to="/stats" 
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`
            }
          >
            <BarChart3 size={20} />
            <span className="text-xs mt-1">统计</span>
          </NavLink>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`
            }
          >
            <ListChecks size={20} />
            <span className="text-xs mt-1">任务</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`
            }
          >
            <Settings size={20} />
            <span className="text-xs mt-1">设置</span>
          </NavLink>
        </div>
      </nav>

      {/* 侧边导航栏（桌面端） */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg border-r border-gray-200 hidden md:block">
        <nav className="mt-6 px-4">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex items-center space-x-3 py-3 px-4 rounded-lg mb-1 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <Calendar size={20} />
            <span className="font-medium">今日视图</span>
          </NavLink>
          <NavLink 
            to="/stats" 
            className={({ isActive }) => 
              `flex items-center space-x-3 py-3 px-4 rounded-lg mb-1 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <BarChart3 size={20} />
            <span className="font-medium">统计数据</span>
          </NavLink>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => 
              `flex items-center space-x-3 py-3 px-4 rounded-lg mb-1 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <ListChecks size={20} />
            <span className="font-medium">任务管理</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center space-x-3 py-3 px-4 rounded-lg mb-1 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <Settings size={20} />
            <span className="font-medium">设置</span>
          </NavLink>
        </nav>
      </aside>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 登录注册路由 */}
          <Route path="/login" element={<AuthPage />} />
          {/* 根路由重定向到登录页或主应用 */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App