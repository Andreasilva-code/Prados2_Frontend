'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, theme as antTheme } from 'antd';
import { 
  MenuOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [rol, setRol] = useState<string>('Propietario'); // Valor por defecto
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = antTheme.useToken();

  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      // Capitalizar la primera letra para que se vea bien en el título
      const formattedRol = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);
      setRol(formattedRol);
    } else {
      setRol('Propietario');
    }
  }, [user, isAuthenticated]);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">Muro Social</Link>,
    },
    // Solo mostramos el resto del menú si está autenticado
    ...(isAuthenticated ? [
      {
        key: '/residents',
        icon: <UsergroupAddOutlined />,
        label: <Link href="/residents">Residentes</Link>,
      },
      {
        key: '/documents',
        icon: <FileTextOutlined />,
        label: <Link href="/documents">Documentos</Link>,
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: <Link href="/settings">Configuración</Link>,
      }
    ] : [])
  ];

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        theme="dark"
        className="shadow-xl z-50 fixed h-full sm:relative"
      >
        <div className="flex items-center justify-center m-4 bg-white rounded-xl p-2 min-h-16 shadow-inner">
          {collapsed ? (
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <img src="/logo.png" alt="Prados del Portal II" className="w-20 h-20 object-contain mb-1" />
              <span className="text-blue-900 font-extrabold text-xs text-center leading-tight tracking-wide uppercase">
                Prados del Portal II
              </span>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="border-none"
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-4 shadow-sm z-40 sticky top-0">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {isAuthenticated ? `Panel de ${rol === 'Administrador' ? 'Administración' : 'Propietario'}` : 'Administración Residencial'}
            </h1>
          </div>
          <div className="flex items-center gap-4 px-4">
            {!isAuthenticated ? (
              <div className="hidden sm:flex gap-2">
                <Link href="/register">
                  <Button type="default" className="border-blue-900 text-blue-900 font-medium">Registro</Button>
                </Link>
                <Link href="/login">
                  <Button type="primary" className="bg-blue-900 font-medium">Login</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-slate-700 font-medium">
                  Bienvenido, {user?.nombreUsuario}
                </span>
                <Button type="text" icon={<BellOutlined className="text-xl text-slate-600" />} />
                <Avatar 
                  className="bg-blue-900" 
                  icon={<UserOutlined />} 
                >
                  {user?.nombreUsuario?.charAt(0).toUpperCase()}
                </Avatar>
                <Button 
                  type="text" 
                  danger 
                  icon={<LogoutOutlined />} 
                  onClick={logout}
                >
                  Salir
                </Button>
              </div>
            )}
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          className="overflow-initial shadow-sm"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
