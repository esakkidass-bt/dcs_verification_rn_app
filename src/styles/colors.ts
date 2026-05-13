import config from '../config';

let PRIMARY_COLORS = 
  {
  0: '#ecf6eb',
  50: '#ecf6eb',
  100: '#d9edd7',
  200: '#c7e3c4',
  300: '#b4dab0',
  400: '#a1d09d',
  500: '#8ec789',
  600: '#7abd76',
  700: '#66b462',
  800: '#51aa4c',
  900: '#38a035',
};
if (config.env === 'training') {
  PRIMARY_COLORS = {
    0: '#ecf6eb',
    50: '#ecf6eb',
    100: '#d9edd7',
    200: '#c7e3c4',
    300: '#b4dab0',
    400: '#a1d09d',
    500: '#8ec789',
    600: '#d65c62', // Red color
    700: '#c55359',
    800: '#b34950',
    900: '#a04046',
  };
}

const colors = {
  primary: PRIMARY_COLORS,
  secondary: {
    0: '#ebf2fc',
    50: '#ebf2fc',
    100: '#d7e5fa',
    200: '#c3d8f6',
    300: '#afcbf3',
    400: '#9bbeef',
    500: '#87b0eb',
    600: '#74a3e7',
    700: '#6096e3',
    800: '#4c88de',
    900: '#367ad9',
  },
  dark: {
    500: '#7a7a7a',
    600: '#4a4a4a',
  },
};

export default colors;
