import ExponeaSDK
import XCTest

@testable import BridgedContentBlockSelector

final class BridgedContentBlockSelectorTests: XCTestCase {

    func testFilterAndSortWithoutCustomSortPreservesInputOrder() {
        let selector = BridgedContentBlockSelector()
        XCTAssertFalse(selector.isCustomSortActive)

        let blocks = [
            makeBlock(id: "c", name: "C", priority: 1),
            makeBlock(id: "a", name: "A", priority: 3),
            makeBlock(id: "b", name: "B", priority: 2),
        ]

        let expectation = expectation(description: "filterAndSort completes")
        selector.filterAndSortContentBlocksAsync(blocks) { result, sortWasApplied in
            XCTAssertEqual(result.map(\.id), ["c", "a", "b"])
            XCTAssertFalse(sortWasApplied, "sortWasApplied should be false when no sort hook is set")
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 1)
    }

    func testFilterAndSortWithCustomSortReportsSortApplied() {
        let selector = BridgedContentBlockSelector()
        let blocks = [
            makeBlock(id: "x", name: "X", priority: 1),
            makeBlock(id: "y", name: "Y", priority: 2),
        ]
        selector.sortRequestFn = { _, token in
            selector.onContentSortResponse(blocks, token: token)
        }

        let expectation = expectation(description: "filterAndSort with sort hook completes")
        selector.filterAndSortContentBlocksAsync(blocks) { _, sortWasApplied in
            XCTAssertTrue(sortWasApplied, "sortWasApplied should be true when a sort hook is set")
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 1)
    }

    func testSortWithoutCustomHookReturnsInputUnchanged() {
        let selector = BridgedContentBlockSelector()
        let blocks = [
            makeBlock(id: "low", name: "Low", priority: 1),
            makeBlock(id: "high", name: "High", priority: 10),
        ]

        let expectation = expectation(description: "sort completes")
        selector.sortContentBlocksAsync(blocks) { result in
            XCTAssertEqual(result.map(\.id), ["low", "high"])
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 1)
    }

    func testUntokenizedResponseAcceptedWhenSinglePending() {
        let selector = BridgedContentBlockSelector()
        let input = [makeBlock(id: "only", name: "Only", priority: 1)]
        var capturedToken = ""

        selector.sortRequestFn = { _, token in
            capturedToken = token
        }

        let expectation = expectation(description: "single pending resolves")
        selector.sortContentBlocksAsync(input) { result in
            XCTAssertEqual(result.map(\.id), ["only"])
            expectation.fulfill()
        }

        selector.onContentSortResponse(input, token: nil)
        wait(for: [expectation], timeout: 1)
        XCTAssertFalse(capturedToken.isEmpty)
    }

    func testUntokenizedResponseIgnoredWhenMultiplePending() {
        let selector = BridgedContentBlockSelector()
        var capturedTokens: [String] = []

        selector.sortRequestFn = { _, token in
            capturedTokens.append(token)
        }

        let firstInput = [makeBlock(id: "first", name: "First", priority: 1)]
        let secondInput = [makeBlock(id: "second", name: "Second", priority: 2)]

        var firstResult: [InAppContentBlockResponse]?
        var secondResult: [InAppContentBlockResponse]?

        let firstExpectation = expectation(description: "first request resolves")
        let secondExpectation = expectation(description: "second request resolves")

        selector.sortContentBlocksAsync(firstInput) { result in
            firstResult = result
            firstExpectation.fulfill()
        }
        selector.sortContentBlocksAsync(secondInput) { result in
            secondResult = result
            secondExpectation.fulfill()
        }

        XCTAssertEqual(capturedTokens.count, 2)

        selector.onContentSortResponse(firstInput, token: nil)

        let idleExpectation = expectation(description: "requests stay pending")
        idleExpectation.isInverted = true
        wait(for: [idleExpectation], timeout: 0.2)

        selector.onContentSortResponse(firstInput, token: capturedTokens[0])
        wait(for: [firstExpectation], timeout: 1)
        XCTAssertEqual(firstResult?.map(\.id), ["first"])
        XCTAssertNil(secondResult)

        selector.onContentSortResponse(secondInput, token: capturedTokens[1])
        wait(for: [secondExpectation], timeout: 1)
        XCTAssertEqual(secondResult?.map(\.id), ["second"])
    }

    private func makeBlock(
        id: String,
        name: String,
        priority: Int
    ) -> InAppContentBlockResponse {
        InAppContentBlockResponse(
            id: id,
            name: name,
            dateFilter: .init(enabled: false, fromDate: nil, toDate: nil),
            frequency: .always,
            placeholders: [],
            tags: [],
            loadPriority: priority,
            content: nil,
            personalized: nil
        )
    }
}
