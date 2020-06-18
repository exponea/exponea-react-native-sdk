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
}
