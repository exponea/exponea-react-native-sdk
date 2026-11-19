import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './src/App';
// Expo-only "EXPO" watermark; src/ stays identical to ../example.
import { withExpoWatermark } from './ExpoWatermark';

registerRootComponent(withExpoWatermark(App));
