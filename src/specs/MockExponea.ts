import ExponeaType, {FlushMode, InAppMessage, LogLevel, Segment, SegmentationDataCallback} from "../ExponeaType";
import Configuration from "../Configuration";
import {JsonObject} from "../Json";
import ExponeaProject from "../ExponeaProject";
import EventType from "../EventType";
import Consent from "../Consent";
import {Recommendation, RecommendationOptions} from "../Recommendation";
import AppInboxStyle from "../AppInboxStyle";
import {AppInboxMessage} from "../AppInboxMessage";
import {AppInboxAction} from "../AppInboxAction";
import {InAppMessageCallback} from "../InAppMessageCallback";
import {TestUtils} from "./TestUtils";
import Exponea from "../index";
import {InAppMessageActionDef} from "../InAppMessageActionDef";

TestUtils.mockExponeaNative()

export class MockExponea implements ExponeaType {
    lastArgumentsJson = '';
    configure(configuration: Configuration): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([configuration]);
        return Promise.resolve();
    }

    isConfigured(): Promise<boolean> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve(true);
    }

    getCustomerCookie(): Promise<string> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve('mock-customer-cookie');
    }

    checkPushSetup(): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve();
    }

    getFlushMode(): Promise<FlushMode> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve(FlushMode.PERIOD);
    }

    setFlushMode(flushingMode: FlushMode): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([flushingMode]);
        return Promise.resolve();
    }

    getFlushPeriod(): Promise<number> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve(123);
    }

    setFlushPeriod(period: number): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([period]);
        return Promise.resolve();
    }

    getLogLevel(): Promise<LogLevel> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve(LogLevel.INFO);
    }

    setLogLevel(loggerLevel: LogLevel): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([loggerLevel]);
        return Promise.resolve();
    }

    getDefaultProperties(): Promise<JsonObject> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve({});
    }

    setDefaultProperties(properties: JsonObject): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([properties]);
        return Promise.resolve();
    }

    anonymize(
        exponeaProject?: ExponeaProject,
        projectMapping?: {[key in EventType]?: Array<ExponeaProject>},
    ): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([exponeaProject, projectMapping]);
        return Promise.resolve();
    }

    identifyCustomer(
        customerIds: Record<string, string>,
        properties: JsonObject,
    ): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([customerIds, properties]);
        return Promise.resolve();
    }

    flushData(): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve();
    }

    trackEvent(
        eventName: string,
        properties: JsonObject,
        timestamp?: number,
    ): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([eventName, properties, timestamp]);
        return Promise.resolve();
    }

    trackSessionStart(timestamp?: number): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([timestamp]);
        return Promise.resolve();
    }

    trackSessionEnd(timestamp?: number): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([timestamp]);
        return Promise.resolve();
    }

    fetchConsents(): Promise<Array<Consent>> {
        this.lastArgumentsJson = JSON.stringify([]);
        return Promise.resolve([
            {
                id: 'mock-consent-id',
                legitimateInterest: true,
                sources: {
                    createdFromCRM: false,
                    imported: true,
                    fromConsentPage: false,
                    privateAPI: true,
                    publicAPI: false,
                    trackedFromScenario: false,
                },
                translations: {
                    en: {key: 'en-value'},
                    cz: {key: 'cz-value'},
                },
            },
        ]);
    }

    fetchRecommendations(
        options: RecommendationOptions,
    ): Promise<Array<Recommendation>> {
        this.lastArgumentsJson = JSON.stringify([options]);
        return Promise.resolve([
            {
                engineName: 'mock-engine-name',
                itemId: 'mock-item-id',
                recommendationId: 'mock-recommendation-id',
                recommendationVariantId: 'mock-recommendation-variant-id',
                data: {
                    key: 'value',
                },
            },
        ]);
    }

    setPushOpenedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */

    removePushOpenedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */

    setPushReceivedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */

    removePushReceivedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */

    requestIosPushAuthorization(): Promise<boolean> {
        return Promise.resolve(true);
    }

    requestPushAuthorization(): Promise<boolean> {
        return Promise.resolve(true);
    }

    setAppInboxProvider(withStyle: AppInboxStyle): Promise<void> {
        this.lastArgumentsJson = JSON.stringify([withStyle]);
        return Promise.resolve();
    }

    trackAppInboxOpened(_message: AppInboxMessage): Promise<void> {
        return Promise.resolve();
    }

    trackAppInboxOpenedWithoutTrackingConsent(
        _message: AppInboxMessage,
    ): Promise<void> {
        return Promise.resolve();
    }

    trackAppInboxClick(
        _action: AppInboxAction,
        _message: AppInboxMessage,
    ): Promise<void> {
        return Promise.resolve();
    }

    trackAppInboxClickWithoutTrackingConsent(
        _action: AppInboxAction,
        _message: AppInboxMessage,
    ): Promise<void> {
        return Promise.resolve();
    }

    markAppInboxAsRead(_message: AppInboxMessage): Promise<boolean> {
        return Promise.resolve(true);
    }

    fetchAppInbox(): Promise<Array<AppInboxMessage>> {
        return Promise.resolve([]);
    }

    fetchAppInboxItem(_messageId: string): Promise<AppInboxMessage> {
        return Promise.resolve({id: '1', type: 'push'});
    }

    setInAppMessageCallback(
        callback: InAppMessageCallback,
    ) {
        Exponea.setInAppMessageCallback(callback)
    }

    removeInAppMessageCallback() {
        Exponea.removeInAppMessageCallback()
    }

    setAutomaticSessionTracking(enabled: boolean): Promise<void> {
        return Promise.resolve();
    }

    setSessionTimeout(timeout: number): Promise<void> {
        return Promise.resolve();
    }

    setAutoPushNotification(enabled: boolean): Promise<void> {
        return Promise.resolve();
    }

    setCampaignTTL(seconds: number): Promise<void> {
        return Promise.resolve();
    }

    trackPushToken(token: string): Promise<void> {
        return Promise.resolve();
    }

    trackHmsPushToken(token: string): Promise<void> {
        return Promise.resolve();
    }

    trackDeliveredPush(params: Record<string, string>): Promise<void> {
        return Promise.resolve();
    }

    trackDeliveredPushWithoutTrackingConsent(
        params: Record<string, string>,
    ): Promise<void> {
        return Promise.resolve();
    }

    trackClickedPush(params: Record<string, string>): Promise<void> {
        return Promise.resolve();
    }

    trackClickedPushWithoutTrackingConsent(
        params: Record<string, string>,
    ): Promise<void> {
        return Promise.resolve();
    }

    trackPaymentEvent(params: Record<string, string>): Promise<void> {
        return Promise.resolve();
    }

    isExponeaPushNotification(params: Record<string, string>): Promise<boolean> {
        return Promise.resolve(true);
    }

    trackInAppMessageClick(
        message: InAppMessage,
        buttonText: string|undefined,
        buttonUrl: string|undefined
    ): Promise<void> {
        this.lastArgumentsJson = JSON.stringify(InAppMessageActionDef.buildForClick(message, buttonText, buttonUrl));
        return Promise.resolve()
    }

    trackInAppMessageClickWithoutTrackingConsent(
        message: InAppMessage,
        buttonText: string|null|undefined,
        buttonUrl: string|null|undefined
    ): Promise<void> {
        this.lastArgumentsJson = JSON.stringify(InAppMessageActionDef.buildForClick(message, buttonText, buttonUrl));
        return Promise.resolve();
    }

    trackInAppMessageClose(
        message: InAppMessage,
        buttonText: string|null|undefined,
        interaction: boolean
    ): Promise<void> {
        this.lastArgumentsJson = JSON.stringify(InAppMessageActionDef.buildForClose(message, buttonText, interaction));
        return Promise.resolve();
    }

    trackInAppMessageCloseWithoutTrackingConsent(
        message: InAppMessage,
        buttonText: string|null|undefined,
        interaction: boolean
    ): Promise<void> {
        this.lastArgumentsJson = JSON.stringify(InAppMessageActionDef.buildForClose(message, buttonText, interaction));
        return Promise.resolve();
    }

    trackInAppContentBlockClick(params: Record<string, string>): Promise<void> {
        return Promise.resolve();
    }

    trackInAppContentBlockClickWithoutTrackingConsent(
        params: Record<string, string>,
    ): Promise<void> {
        return Promise.resolve();
    }

    trackInAppContentBlockClose(params: Record<string, string>): Promise<void> {
        return Promise.resolve();
    }

    trackInAppContentBlockCloseWithoutTrackingConsent(
        params: Record<string, string>,
    ): Promise<void> {
        return Promise.resolve();
    }

    trackInAppContentBlockShown(params: Record<string, string>): Promise<void> {
        return Promise.resolve();
    }

    trackInAppContentBlockShownWithoutTrackingConsent(
        params: Record<string, string>,
    ): Promise<void> {
        return Promise.resolve();
    }

    trackInAppContentBlockError(params: Record<string, string>): Promise<void> {
        return Promise.resolve();
    }

    trackInAppContentBlockErrorWithoutTrackingConsent(
        params: Record<string, string>,
    ): Promise<void> {
        return Promise.resolve();
    }

    getSegments(exposingCategory: string, force?: boolean): Promise<Array<Segment>> {
        this.lastArgumentsJson = JSON.stringify({exposingCategory, force});
        return Promise.resolve([]);
    }

    registerSegmentationDataCallback(callback: SegmentationDataCallback): void {
        this.lastArgumentsJson = JSON.stringify({
            exposingCategory: callback.exposingCategory,
            includeFirstLoad: callback.includeFirstLoad
        })
    }

    unregisterSegmentationDataCallback(callback: SegmentationDataCallback): void {
        this.lastArgumentsJson = JSON.stringify({
            exposingCategory: callback.exposingCategory,
            includeFirstLoad: callback.includeFirstLoad
        })
    }

    simulateEmit(eventName: string, eventData: string) {
        switch (eventName) {
            case 'inAppAction':
                (Exponea as any)["handleInAppMessageAction"](eventData)
                break
            default:
                fail("Unsupported emit event: " + eventName);
        }
    }
}
