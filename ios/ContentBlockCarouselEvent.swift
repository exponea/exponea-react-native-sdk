//
//  ContentBlockCarouselEvent.swift
//  Exponea
//
//  Created by Adam Mihalik on 11/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

enum ContentBlockCarouselEvent {
    case onMessageShown(
        placeholderId: String,
        contentBlock: InAppContentBlockResponse,
        index: Int,
        count: Int
    )
    case onMessageChanged(
        count: Int,
        contentBlocks: [InAppContentBlockResponse]
    )
    case onNoMessageFound(
        placeholderId: String
    )
    case onError(
        placeholderId: String,
        contentBlock: InAppContentBlockResponse?,
        errorMessage: String
    )
    case onCloseClicked(
        placeholderId: String,
        contentBlock: InAppContentBlockResponse
    )
    case onActionClicked(
        placeholderId: String,
        contentBlock: InAppContentBlockResponse,
        action: InAppContentBlockAction
    )

    func toDictionary() -> [String: Any] {
        var result: [String: Any] = [:]
        switch self {
        case .onMessageShown(let placeholderId, let contentBlock, let index, let count):
            result["eventType"] = "onMessageShown"
            result["placeholderId"] = placeholderId
            if let cbJson = try? JsonDataParser.toJson(value: contentBlock) {
                result["contentBlock"] = cbJson
            }
            result["index"] = index
            result["count"] = count
        case .onMessageChanged(let count, let contentBlocks):
            result["eventType"] = "onMessagesChanged"
            result["count"] = count
            if let cbsJson = try? JsonDataParser.toJson(value: contentBlocks) {
                result["contentBlocks"] = cbsJson
            }
        case .onNoMessageFound(let placeholderId):
            result["eventType"] = "onNoMessageFound"
            result["placeholderId"] = placeholderId
        case .onError(let placeholderId, let contentBlock, let errorMessage):
            result["eventType"] = "onError"
            result["placeholderId"] = placeholderId
            if let cbJson = try? JsonDataParser.toJson(value: contentBlock) {
                result["contentBlock"] = cbJson
            }
            result["errorMessage"] = errorMessage
        case .onCloseClicked(let placeholderId, let contentBlock):
            result["eventType"] = "onCloseClicked"
            result["placeholderId"] = placeholderId
            if let cbJson = try? JsonDataParser.toJson(value: contentBlock) {
                result["contentBlock"] = cbJson
            }
        case .onActionClicked(let placeholderId, let contentBlock, let action):
            result["eventType"] = "onActionClicked"
            result["placeholderId"] = placeholderId
            if let cbJson = try? JsonDataParser.toJson(value: contentBlock) {
                result["contentBlock"] = cbJson
            }
            result["action"] = [
                "type": action.type.description,
                "name": action.name ?? "",
                "url": action.url ?? ""
            ]
        }
        return result
    }
}
