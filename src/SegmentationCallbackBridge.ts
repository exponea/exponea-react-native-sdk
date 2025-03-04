import {Segment, SegmentationDataCallback} from "./ExponeaType";

/**
 * Keeps info to ensure communication 'bridge' within SegmentationDataCallback and native implementation.
 */
export class SegmentationCallbackBridge {
    readonly callback: SegmentationDataCallback;
    nativeCallbackId = "";
    constructor(callback: SegmentationDataCallback) {
        this.callback = callback
    }

    assignNativeCallbackId(callbackId: string) {
        this.nativeCallbackId = callbackId
    }
}

export interface SegmentationDataWrapper {
    callbackId: string;
    data: Array<Segment>
}