import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1e3a8a', // Dark blue
    colorBgLayout: '#f1f5f9', // Light gray background
    colorTextBase: '#334155', // Dark slate text
    borderRadius: 6,
    fontFamily: 'var(--font-geist-sans)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#0f172a',
    },
    Menu: {
      darkItemBg: '#0f172a',
      darkItemSelectedBg: '#1e3a8a',
    }
  }
};

export default theme;
