import type { ViewProps, HostComponent } from 'react-native';
import { codegenNativeComponent } from 'react-native';

export interface AppInboxButtonProps extends ViewProps {
  // Button text customization
  textOverride?: string;

  // Visual styling
  textColor?: string;
  backgroundColor?: string;
  showIcon?: boolean;
  textSize?: string;
  borderRadius?: string;
  textWeight?: string;

  // Button state
  enabled?: boolean;
}

export default codegenNativeComponent<AppInboxButtonProps>(
  'AppInboxButton'
) as HostComponent<AppInboxButtonProps>;
