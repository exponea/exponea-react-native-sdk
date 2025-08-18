//
//  Exponea+InternalEvent.swift
//  Exponea
//
//  Created by Adam Mihalik on 13/08/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

enum InternalEvent: CaseIterable, Hashable {
    case pushClick(_ data: OpenedPush? = nil)
    case pushReceived(_ data: ReceivedPush? = nil)
    case inappAction(_ data: InAppMessageAction? = nil)
    case segmentsUpdate(_ data: SegmentationDataWrapper? = nil)
    var rawValue: String {
        switch self {
        case .pushClick:
            return "pushOpened"
        case .pushReceived:
            return "pushReceived"
        case .inappAction:
            return "inAppAction"
        case .segmentsUpdate:
            return "newSegments"
        }
    }
    static func == (lhs: InternalEvent, rhs: InternalEvent) -> Bool {
        return lhs.rawValue == rhs.rawValue
    }
    func hash(into hasher: inout Hasher) {
        hasher.combine(rawValue)
    }
    static var allCases: [InternalEvent] {
        [.pushClick(nil), .pushReceived(nil), .inappAction(nil), .segmentsUpdate(nil)]
    }
}

extension Exponea {
    @objc(supportedEvents)
    override func supportedEvents() -> [String] {
        return InternalEvent.allCases.map { $0.rawValue }
    }

    func sendEvent(withData: OpenedPush) {
        sendEvent(.pushClick(withData))
    }

    func sendEvent(withData: ReceivedPush) {
        sendEvent(.pushReceived(withData))
    }

    func sendEvent(withData: InAppMessageAction) {
        sendEvent(.inappAction(withData))
    }

    func sendEvent(withData: SegmentationDataWrapper) {
        sendEvent(.segmentsUpdate(withData))
    }

    func startObserving(for event: InternalEvent) {
        $activeEventTypes.changeValue { $0.update(with: event) }
        var pendingEvent: InternalEvent?
        $pendingEventData.changeValue {
            pendingEvent = $0.remove(event)
        }
        if let pendingEvent {
            sendEvent(pendingEvent)
        }
    }

    func stopObserving(for event: InternalEvent) {
        $activeEventTypes.changeValue { $0.remove(event) }
    }

    private func sendEvent(_ event: InternalEvent) {
        guard
            isListeningActive(for: event),
            isNativeToReactCommActive()
        else {
            $pendingEventData.changeValue { $0.update(with: event) }
            return
        }
        var jsonData: Data?
        switch event {
        case .pushClick(let data):
            if let data {
                let payload: [String: Any?] = [
                    "action": data.action.rawValue,
                    "url": data.url,
                    "additionalData": data.additionalData
                ]
                jsonData = try? JSONSerialization.data(withJSONObject: payload)
            }
        case .pushReceived(let data):
            if let data {
                jsonData = try? JSONSerialization.data(withJSONObject: data)
            }
        case .inappAction(let data):
            jsonData = try? JSONEncoder().encode(data)
        case .segmentsUpdate(let data):
            jsonData = try? JSONEncoder().encode(data)
        }
        guard let jsonData,
              let eventBody = String(data: jsonData, encoding: .utf8) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "Empty data to send for event \(event.rawValue)")
            return
        }
        sendEvent(withName: event.rawValue, body: eventBody)
    }

    private func isListeningActive(for event: InternalEvent) -> Bool {
        return activeEventTypes.contains(event)
    }

    // validates if bridge is already actived (old architecture) or JS modules are available (bridgeless architecture)
    internal func isNativeToReactCommActive() -> Bool {
        if sendEventOverride != nil {
            // running unit tests without bridge nor JS modules
            return true
        }
        return (self.bridge != nil && self.bridge.isValid) || self.callableJSModules != nil
    }

    // overrides for unit tests purposes
    override func sendEvent(withName name: String!, body: Any) {
        if let sendEventOverride = sendEventOverride {
            sendEventOverride(name, body)
        } else {
            super.sendEvent(withName: name, body: body)
        }
    }
}
