// Ambient module declaration so TypeScript doesn't complain about the
// side-effect `import "../global.css"` in app/_layout.tsx (NativeWind/Metro
// handle the actual CSS-to-native-styles transform at build time).
declare module "*.css";
