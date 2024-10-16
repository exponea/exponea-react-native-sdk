/* eslint-disable @typescript-eslint/no-unused-vars */
import {SegmentationDataCallback,} from '../ExponeaType';
import {MockExponea} from "./MockExponea";
import {TestUtils} from "./TestUtils";

describe('parameter serialization and typings', () => {
    let mockExponea: MockExponea;
    beforeEach(() => {
        mockExponea = new MockExponea()
    })

    test('Segmentation callback registration', () => {
        const callback = new SegmentationDataCallback(
            "discovery",
            true,
            data => {
                // nothing to do here
            }
        );
        mockExponea.registerSegmentationDataCallback(callback)
        expect(mockExponea.lastArgumentsJson).toBe(`{"exposingCategory":"discovery","includeFirstLoad":true}`)
    });

    test('Segmentation callback un-registration', () => {
        const callback = new SegmentationDataCallback(
            "discovery",
            true,
            data => {
                // nothing to do here
            }
        );
        mockExponea.unregisterSegmentationDataCallback(callback)
        expect(mockExponea.lastArgumentsJson).toBe(`{"exposingCategory":"discovery","includeFirstLoad":true}`)
    });

    test('Segmentation manual fetch without force', () => {
        mockExponea.getSegments("discovery", false)
        expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
            JSON.parse(TestUtils.readJsonFile('./src/test_data/get-segments-nonforced.json'))
        );
    });

    test('Segmentation manual fetch with force', () => {
        mockExponea.getSegments("discovery", true)
        expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
            JSON.parse(TestUtils.readJsonFile('./src/test_data/get-segments-forced.json'))
        );
    });

    test('Segmentation manual fetch without force param', () => {
        mockExponea.getSegments("discovery")
        expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
            JSON.parse(TestUtils.readJsonFile('./src/test_data/get-segments-minimal.json'))
        );
    });
});
