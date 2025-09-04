import {createNavigationContainerRef} from '@react-navigation/native';
import {Screen} from '../screens/Screens';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: Screen) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never);
  }
}
