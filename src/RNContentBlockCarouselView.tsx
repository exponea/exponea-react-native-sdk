import {HostComponent, NativeSyntheticEvent, requireNativeComponent, ViewProps} from 'react-native';
import { DimensEvent } from './RNInAppContentBlocksPlaceholder';
import { InAppContentBlock } from './ExponeaType';

export interface ContentBlockCarouselEvent {
    eventType: string;
    placeholderId?: string;
    contentBlock?: string;
    contentBlockAction?: string;
    errorMessage?: string;
    index?: number;
    count?: number;
    contentBlocks?: string;
}

export interface ContentBlockDataRequestEvent {
    requestType: string;
    data: string[];
}

export interface ContentBlockCarouselInitProps {
    placeholderId: string;
    maxMessagesCount?: number;
    scrollDelay?: number;
}

interface ContentBlockCarouselNativeProps extends ViewProps {
    initProps: ContentBlockCarouselInitProps;
    overrideDefaultBehavior?: boolean;
    trackActions?: boolean;
    customFilterActive: boolean;
    customSortActive: boolean;
    onDimensChanged: (event: NativeSyntheticEvent<DimensEvent>) => void
    onContentBlockEvent: (event: NativeSyntheticEvent<ContentBlockCarouselEvent>) => void
    onContentBlockDataRequestEvent: (event: NativeSyntheticEvent<ContentBlockDataRequestEvent>) => void
}
const RNContentBlockCarouselView: HostComponent<ContentBlockCarouselNativeProps> = requireNativeComponent('RNContentBlockCarouselView');
export default RNContentBlockCarouselView;
