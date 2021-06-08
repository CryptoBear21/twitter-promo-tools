
import { createMuiTheme, ThemeProvider as MuiThemeProvider, ThemeOptions } from '@material-ui/core';
import { useSharedState } from '../hooks/use-shared-state';

const darkTheme: ThemeOptions = { palette: { type: 'dark' } };
const lightTheme: ThemeOptions = { palette: { type: 'light' } };

const ThemeProvider: React.FC = ({ children }) => {
  const [darkMode = true] = useSharedState('darkMode');

  const appliedTheme = createMuiTheme(darkMode ? darkTheme : lightTheme);

  console.log({ darkMode })

  return (
    <MuiThemeProvider theme={appliedTheme}>{children}</MuiThemeProvider>
  )
};

export default ThemeProvider;