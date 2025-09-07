// Simple theme type with type assertion
export type AppTheme = {
  dark: boolean;
  colors: any; // Use any to avoid type conflicts
  fonts: {
    regular: {
      fontFamily: string;
      fontWeight: string;
    };
    medium: {
      fontFamily: string;
      fontWeight: string;
    };
    bold: {
      fontFamily: string;
      fontWeight: string;
    };
    heavy: {
      fontFamily: string;
      fontWeight: string;
    };
  };
};