import XCTest
import ExponeaSDK
import react_native_exponea_sdk

final class JsonDataParserTests: XCTestCase {
    func testParsesNestedEventProperties() throws {
        let properties: NSDictionary = [
            "purchase_status": "success",
            "product_list": [
                [
                    "product_id": "abc123",
                    "quantity": 2
                ],
                [
                    "product_id": "abc456",
                    "quantity": 1
                ]
            ],
            "metadata": [
                "coupon_codes": ["summer", "vip"],
                "gift": true
            ],
            "total_price": 7.99
        ]

        let parsed = try JsonDataParser.parse(dictionary: properties)

        XCTAssertEqual(parsed["purchase_status"]?.jsonValue.stringValue, "success")
        XCTAssertEqual(parsed["total_price"]?.jsonValue.doubleValue, 7.99)

        let products = try XCTUnwrap(parsed["product_list"]?.jsonValue.arrayValue)
        XCTAssertEqual(products.count, 2)
        XCTAssertEqual(products[0].dictionaryValue?["product_id"]?.stringValue, "abc123")
        XCTAssertEqual(products[0].dictionaryValue?["quantity"]?.intValue, 2)
        XCTAssertEqual(products[1].dictionaryValue?["product_id"]?.stringValue, "abc456")
        XCTAssertEqual(products[1].dictionaryValue?["quantity"]?.intValue, 1)

        let metadata = try XCTUnwrap(parsed["metadata"]?.jsonValue.dictionaryValue)
        XCTAssertEqual(metadata["gift"]?.boolValue, true)
        XCTAssertEqual(metadata["coupon_codes"]?.arrayValue?.map(\.stringValue), ["summer", "vip"])
    }

    func testParsesNullValues() throws {
        let parsed = try JsonDataParser.parse(dictionary: ["nullable": NSNull()] as NSDictionary)

        guard case .null = parsed["nullable"]?.jsonValue else {
            return XCTFail("Expected null JSON value")
        }
    }

    func testRejectsUnsupportedValues() {
        XCTAssertThrowsError(
            try JsonDataParser.parse(dictionary: ["date": Date()] as NSDictionary)
        )
    }

    func testRejectsNonStringNestedDictionaryKeys() {
        let properties: NSDictionary = [
            "nested": [
                1: "invalid"
            ]
        ]

        XCTAssertThrowsError(try JsonDataParser.parse(dictionary: properties))
    }
}

private extension JSONValue {
    var stringValue: String? {
        guard case .string(let value) = self else { return nil }
        return value
    }

    var boolValue: Bool? {
        guard case .bool(let value) = self else { return nil }
        return value
    }

    var intValue: Int? {
        guard case .int(let value) = self else { return nil }
        return value
    }

    var doubleValue: Double? {
        guard case .double(let value) = self else { return nil }
        return value
    }

    var dictionaryValue: [String: JSONValue]? {
        guard case .dictionary(let value) = self else { return nil }
        return value
    }

    var arrayValue: [JSONValue]? {
        guard case .array(let value) = self else { return nil }
        return value
    }
}
