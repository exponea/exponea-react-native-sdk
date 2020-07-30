//
//  TestUtil.swift
//  Tests
//
//  Created by Panaxeo on 18/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import Quick

struct TestUtil {
    private static let packageRootPath = URL(fileURLWithPath: #file).pathComponents
        .dropLast() // file name
        .dropLast() // Tests
        .dropLast() // ios
        .joined(separator: "/")

    static func loadFile(relativePath: String) -> String {
        do {
            return try String(contentsOfFile: self.packageRootPath + relativePath)
        } catch {
            XCTFail(error.localizedDescription)
        }
        return ""
    }

    static func parseJson(jsonString: String) -> NSDictionary {
        guard let data = jsonString.data(using: .utf8),
              let dictionary = try? JSONSerialization.jsonObject(with: data, options: []) as? NSDictionary else {
            XCTFail("Unable to parse data")
            return [:]
        }
        return dictionary
    }

    static func getSortedKeysJson(_ jsonString: String) -> String {
        guard
            let jsonData = jsonString.data(using: .utf8),
            let jsonObject = try? JSONSerialization.jsonObject(with: jsonData),
            let sortedJsonData = try? JSONSerialization.data(
                withJSONObject: jsonObject,
                options: [.sortedKeys]
            ),
            let jsonString = String(data: sortedJsonData, encoding: .utf8) else {
            XCTFail("Unable to parse consents response")
            return ""
        }
        return jsonString
    }
}
