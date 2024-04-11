import {HostComponent, NativeSyntheticEvent, requireNativeComponent, ViewProps} from 'react-native';
import { InAppContentBlock, InAppContentBlockAction } from './ExponeaType';

export interface DimensEvent {
    width: number;
    height: number;
}

export interface InAppContentBlockEvent {
    eventType: string;
    placeholderId?: string;
    contentBlock?: InAppContentBlock;
    contentBlockAction?: InAppContentBlockAction;
    errorMessage?: string;
}

interface NativeProps extends ViewProps {
    placeholderId: string;
    overrideDefaultBehavior?: boolean;
    onDimensChanged: (event: NativeSyntheticEvent<DimensEvent>) => void
    onInAppContentBlockEvent: (event: NativeSyntheticEvent<InAppContentBlockEvent>) => void
}
const RNInAppContentBlocksPlaceholder: HostComponent<NativeProps> = requireNativeComponent('RNInAppContentBlocksPlaceholder');
export default RNInAppContentBlocksPlaceholder;
