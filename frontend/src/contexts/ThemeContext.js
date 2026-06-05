
import { createContext, useContext } from 'react';

const ThemeContext = createContext({ isDarkMode: true });
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ isDarkMode: true }}>
    {children}
  </ThemeContext.Provider>
);