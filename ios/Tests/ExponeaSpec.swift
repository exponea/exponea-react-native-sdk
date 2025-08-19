//
//  ExponeaSpec.swift
//  Tests
//
//  Created by Panaxeo on 30/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import Quick
import Nimble

import enum ExponeaSDK.FlushingMode

@testable import Exponea

class ExponeaSpec: QuickSpec {
    override func spec() {
        var mockExponea: MockExponea!
        var exponea: Exponea!
        beforeEach {
            mockExponea = MockExponea()
            Exponea.exponeaInstance = mockExponea
            exponea = Exponea()
        }
        context("configuration") {
            it("should answer to isConfigured") {
                waitUntil { done in
                    exponea.isConfigured(
                        resolve: { result in
                            expect(result as? Bool).to(equal(false))
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should configure") {
                let configurationDictionary = TestUtil.parseJson(
                    jsonString: TestUtil.loadFile(relativePath: "/src/test_data/configurationMinimal.json")
                )
                waitUntil { done in
                    exponea.configure(
                        configuration: configurationDictionary,
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("configure"))
                            expect(mockExponea.calls[2].name).to(equal("pushNotificationsDelegate:set"))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should not configure if already configured") {
                let configurationDictionary = TestUtil.parseJson(
                    jsonString: TestUtil.loadFile(relativePath: "/src/test_data/configurationMinimal.json")
                )
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.configure(
                        configuration: configurationDictionary,
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal(ExponeaError.alreadyConfigured.localizedDescription))
                            expect(error?.localizedDescription)
                                .to(equal(ExponeaError.alreadyConfigured.localizedDescription))
                            done()
                        }
                    )
                }
            }

            it("should not configure with empty configuration") {
                waitUntil { done in
                    exponea.configure(
                        configuration: [:],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal("Property projectToken is required."))
                            expect(error?.localizedDescription).to(equal("Property projectToken is required."))
                            done()
                        }
                    )
                }
            }
        }

        context("getting customerCookie") {
            it("should reject promise if Exponea is not configured") {
                waitUntil { done in
                    exponea.getCustomerCookie(
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description as? String).to(equal(ExponeaError.notConfigured.localizedDescription))
                            expect(error?.localizedDescription)
                                .to(equal(ExponeaError.notConfigured.localizedDescription))
                            done()
                        }
                    )
                }
            }

            it("should return customer cookie") {
                mockExponea.isConfiguredValue = true
                mockExponea.customerCookieValue = "mock-cookie"
                waitUntil { done in
                    exponea.getCustomerCookie(
                        resolve: { result in
                            expect(result as? String).to(equal("mock-cookie"))
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("customerCookie:get"))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }
        }

        context("checking push setup") {
            it("should set checkPushSetup value") {
                waitUntil { done in
                    exponea.checkPushSetup(
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("checkPushSetup:set"))
                            expect(mockExponea.checkPushSetupValue).to(beTrue())
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should set checkPushSetupValue after Exponea is configured") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.checkPushSetup(
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("checkPushSetup:set"))
                            expect(mockExponea.checkPushSetupValue).to(beTrue())
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            context("flush mode") {
                it("should get flush mode") {
                    waitUntil { done in
                        exponea.getFlushMode(
                            resolve: { result in
                                expect(result as? String).to(equal("APP_CLOSE"))
                                expect(mockExponea.calls[0].name).to(equal("flushingMode:get"))
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }

                it("should set flush mode") {
                    waitUntil { done in
                        exponea.setFlushMode(
                            flushMode: "IMMEDIATE",
                            resolve: { result in
                                expect(result).to(beNil())
                                expect(mockExponea.calls[0].name).to(equal("flushingMode:set"))
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }

                it("should not set flush mode with invalid value") {
                    waitUntil { done in
                        exponea.setFlushMode(
                            flushMode: "invalid",
                            resolve: { _ in },
                            reject: { errorCode, description, error in
                                expect(errorCode).to(equal("ExponeaSDK"))
                                expect(description).to(equal("Invalid value for flush mode."))
                                expect(error?.localizedDescription)
                                    .to(equal("Invalid value for flush mode."))
                                done()
                            }
                        )
                    }
                }
            }

            context("flush period") {
                it("should get flush period") {
                    mockExponea.flushingModeValue = .periodic(123)
                    waitUntil { done in
                        exponea.getFlushPeriod(
                            resolve: { result in
                                expect(result as? Int).to(equal(123))
                                expect(mockExponea.calls[0].name).to(equal("flushingMode:get"))
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }

                it("should not get flush period when not in periodic flush mode") {
                    waitUntil { done in
                        exponea.getFlushPeriod(
                            resolve: { _ in },
                            reject: { errorCode, description, error in
                                expect(errorCode).to(equal("ExponeaSDK"))
                                expect(description).to(equal("Flush mode is not periodic."))
                                expect(error?.localizedDescription)
                                    .to(equal("Flush mode is not periodic."))
                                done()
                            }
                        )
                    }
                }

                it("should set flush period") {
                    mockExponea.flushingModeValue = .periodic(123)
                    waitUntil { done in
                        exponea.setFlushPeriod(
                            flushPeriod: 456,
                            resolve: { result in
                                expect(result).to(beNil())
                                expect(mockExponea.calls[0].name).to(equal("flushingMode:get"))
                                expect(mockExponea.calls[1].name).to(equal("flushingMode:set"))
                                if case .periodic(let period) = mockExponea.flushingModeValue {
                                    expect(period).to(equal(456))
                                } else {
                                    XCTFail("Periodic Flushing mode expected")
                                }
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }

                it("should not set flush period when not in periodic flush mode") {
                    waitUntil { done in
                        exponea.setFlushPeriod(
                            flushPeriod: 456,
                            resolve: { _ in },
                            reject: { errorCode, description, error in
                                expect(errorCode).to(equal("ExponeaSDK"))
                                expect(description).to(equal("Flush mode is not periodic."))
                                expect(error?.localizedDescription)
                                    .to(equal("Flush mode is not periodic."))
                                done()
                            }
                        )
                    }
                }
            }

            context("default properties") {
                it("should get default properties when Exponea is not initialized") {
                    waitUntil { done in
                        exponea.getDefaultProperties(
                            resolve: { result in
                                expect(result as? String).to(equal("{}"))
                                expect(mockExponea.calls[0].name).to(equal("defaultProperties:get"))
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }

                it("should get default properties when Exponea is initialized") {
                    mockExponea.isConfiguredValue = true
                    mockExponea.defaultPropertiesValue = ["key": "value", "int": 1]
                    waitUntil { done in
                        exponea.getDefaultProperties(
                            resolve: { result in
                                guard let resultString = result as? String else {
                                    XCTFail("Expected a String")
                                    return
                                }
                                expect(TestUtil.getSortedKeysJson(resultString)).to(
                                    equal("{\"int\":1,\"key\":\"value\"}")
                                )
                                expect(mockExponea.calls[0].name).to(equal("defaultProperties:get"))
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }

                it("should set default properties when Exponea is initialized") {
                    mockExponea.isConfiguredValue = true
                    waitUntil { done in
                        exponea.setDefaultProperties(
                            properties: ["key": "value", "int": 1],
                            resolve: { result in
                                expect(result).to(beNil())
                                expect(mockExponea.calls[0].name).to(equal("defaultProperties:set"))
                                expect(mockExponea.calls[0].params[0] as? NSDictionary).to(
                                    equal(["key": "value", "int": 1])
                                )
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }

                it("should set promise if Exponea is not configured") {
                    waitUntil { done in
                        exponea.setDefaultProperties(
                            properties: ["key": "value", "int": 1],
                            resolve: { result in
                                expect(result).to(beNil())
                                expect(mockExponea.calls[0].name).to(equal("defaultProperties:set"))
                                expect(mockExponea.calls[0].params[0] as? NSDictionary).to(
                                    equal(["key": "value", "int": 1])
                                )
                                done()
                            },
                            reject: { _, _, _ in  }
                        )
                    }
                }
            }
        }

        context("stop Integration feature") {
            it("should invoke stopIntegration when Exponea is initialized") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.stopIntegration(
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("stopIntegration"))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should not invoke stopIntegration when Exponea is not initialized") {
                mockExponea.isConfiguredValue = false
                waitUntil { done in
                    exponea.stopIntegration(
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(
                                equal("Error: This functionality is unavailable without initialization of SDK")
                            )
                            expect(error?.localizedDescription).to(
                                equal("Error: This functionality is unavailable without initialization of SDK")
                            )
                            done()
                        }
                    )
                }
            }

            it("should not invoke clearLocalCustomerData when Exponea is initialized") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.clearLocalCustomerData(
                        params: [:],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(
                                equal("Error: The functionality is unavailable due to running Integration")
                            )
                            expect(error?.localizedDescription).to(
                                equal("Error: The functionality is unavailable due to running Integration")
                            )
                            done()
                        }
                    )
                }
            }

            it("should invoke clearLocalCustomerData when Exponea is not initialized") {
                mockExponea.isConfiguredValue = false
                waitUntil { done in
                    exponea.clearLocalCustomerData(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("clearLocalCustomerData"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke clearLocalCustomerData with defined appGroup") {
                mockExponea.isConfiguredValue = false
                waitUntil { done in
                    exponea.clearLocalCustomerData(
                        params: ["appGroup": "mock-appGroup"],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("clearLocalCustomerData"))
                            expect(mockExponea.calls[1].params[0] as? String).to(equal("mock-appGroup"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke clearLocalCustomerData with default appGroup") {
                mockExponea.isConfiguredValue = false
                waitUntil { done in
                    exponea.clearLocalCustomerData(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("clearLocalCustomerData"))
                            expect(mockExponea.calls[1].params[0] as? String).to(equal("ExponeaSDK"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
        }
    }
}
