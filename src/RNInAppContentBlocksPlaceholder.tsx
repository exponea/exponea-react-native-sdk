import {HostComponent, NativeSyntheticEvent, requireNativeComponent, ViewProps} from 'react-native';

export interface DimensEvent {
    width: number;
    height: number;
}
interface NativeProps extends ViewProps {
    placeholderId: string;
    onDimensChanged: (event: NativeSyntheticEvent<DimensEvent>) => void
}
const RNInAppContentBlocksPlaceholder: HostComponent<NativeProps> = requireNativeComponent('RNInAppContentBlocksPlaceholder');
export default RNInAppContentBlocksPlaceholder;
