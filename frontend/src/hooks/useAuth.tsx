import { useState, useEffect, createContext, useContext } from 'react';

// 用户信息类型定义
interface User {
  id: number;
  username: string;
  email: string;
  daily_energy_budget: number;
  max_daily_tasks: number;
  settings: Record<string, any>;
  created_at: string;
}

// 认证上下文类型定义
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证上下文提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // 检查用户是否登录
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // 令牌无效，清除令牌
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('认证检查失败:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 登录函数
  const login = (token: string) => {
    localStorage.setItem('token', token);
    setToken(token);
    // 登录后获取用户信息
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(userData => setUser(userData))
      .catch(error => console.error('获取用户信息失败:', error));
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // 刷新页面，重置应用状态
    window.location.reload();
  };

  // 更新用户信息
  const updateUser = (user: User) => {
    setUser(user);
  };

  // 上下文值
  const contextValue: AuthContextType = {
    user,
    isLoading,
    token,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义 hook，用于访问认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};