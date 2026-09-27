import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import {
    createTheme,
    ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
);

export const useThemeMode = (): ThemeContextType => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            'useThemeMode must be used within a ThemeProvider'
        );
    }

    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({
    children,
}: ThemeProviderProps) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem('theme_mode');

        if (
            savedMode === 'light' ||
            savedMode === 'dark' ||
            savedMode === 'system'
        ) {
            return savedMode;
        }

        return 'light';
    });

    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
        () =>
            window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
    );

    const resolvedTheme =
        themeMode === 'system' ? systemTheme : themeMode;

    useEffect(() => {
        localStorage.setItem('theme_mode', themeMode);
    }, [themeMode]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(prefers-color-scheme: dark)'
        );

        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? 'dark' : 'light');
        };

        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute(
            'data-theme',
            resolvedTheme
        );
    }, [resolvedTheme]);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: resolvedTheme,

                    primary: {
                        main: '#3b82f6',
                        light: '#60a5fa',
                        dark: '#2563eb',
                        contrastText: '#ffffff',
                    },

                    secondary: {
                        main: '#10b981',
                        light: '#34d399',
                        dark: '#059669',
                        contrastText: '#ffffff',
                    },

                    error: {
                        main: '#ef4444',
                    },

                    warning: {
                        main: '#f59e0b',
                    },

                    info: {
                        main: '#3b82f6',
                    },

                    success: {
                        main: '#10b981',
                    },

                    ...(resolvedTheme === 'dark'
                        ? {
                            background: {
                                default: '#0f172a',
                                paper: '#1e293b',
                            },
                            text: {
                                primary: '#f1f5f9',
                                secondary: '#94a3b8',
                            },
                        }
                        : {
                            background: {
                                default: '#f8fafc',
                                paper: '#ffffff',
                            },
                            text: {
                                primary: '#1e293b',
                                secondary: '#64748b',
                            },
                        }),
                },

                typography: {
                    fontFamily: [
                        '-apple-system',
                        'BlinkMacSystemFont',
                        '"Segoe UI"',
                        'Roboto',
                        '"Helvetica Neue"',
                        'Arial',
                        'sans-serif',
                    ].join(','),

                    h1: {
                        fontSize: '2.5rem',
                        fontWeight: 600,
                    },

                    h2: {
                        fontSize: '2rem',
                        fontWeight: 600,
                    },

                    h3: {
                        fontSize: '1.75rem',
                        fontWeight: 600,
                    },

                    h4: {
                        fontSize: '1.5rem',
                        fontWeight: 600,
                    },

                    h5: {
                        fontSize: '1.25rem',
                        fontWeight: 600,
                    },

                    h6: {
                        fontSize: '1rem',
                        fontWeight: 600,
                    },

                    body1: {
                        fontSize: '1rem',
                    },

                    body2: {
                        fontSize: '0.875rem',
                    },
                },

                shape: {
                    borderRadius: 8,
                },

                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                backgroundColor:
                                    resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc',
                                color:
                                    resolvedTheme === 'dark' ? '#f1f5f9' : '#1e293b',
                            },
                        },
                    },

                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: 8,
                            },
                        },
                    },

                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                boxShadow:
                                    resolvedTheme === 'dark'
                                        ? '0 1px 3px rgba(0, 0, 0, 0.35)'
                                        : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                backgroundColor:
                                    resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
                            },
                        },
                    },

                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                backgroundColor:
                                    resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
                            },
                        },
                    },

                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor:
                                            resolvedTheme === 'dark'
                                                ? '#475569'
                                                : '#cbd5e1',
                                    },

                                    '&:hover fieldset': {
                                        borderColor:
                                            resolvedTheme === 'dark'
                                                ? '#64748b'
                                                : '#94a3b8',
                                    },

                                    '&.Mui-focused fieldset': {
                                        borderColor: '#3b82f6',
                                    },
                                },

                                '& .MuiInputLabel-root': {
                                    color:
                                        resolvedTheme === 'dark'
                                            ? '#94a3b8'
                                            : '#64748b',
                                },

                                '& .MuiInputBase-input': {
                                    color:
                                        resolvedTheme === 'dark'
                                            ? '#f1f5f9'
                                            : '#1e293b',
                                },
                            },
                        },
                    },
                },
            }),
        [resolvedTheme]
    );

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
    };

    return (
        <ThemeContext.Provider
            value={{
                themeMode,
                setThemeMode,
                resolvedTheme,
            }}
        >
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};