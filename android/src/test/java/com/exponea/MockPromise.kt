package com.exponea

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import org.junit.Assert.fail

open class MockPromise(val onResolved: (MockPromise) -> Unit, val onRejected: (MockPromise) -> Unit) : Promise {
    enum class PromiseStatus {
        pending,
        fulfilled,
        rejected
    }

    var status: PromiseStatus = PromiseStatus.pending
    var result: Any? = null
    var errorName: String? = null
    var errorMessage: String? = null
    var errorThrowable: Throwable? = null
    var errorMap: WritableMap? = null

    override fun resolve(result: Any?) {
        this.status = PromiseStatus.fulfilled
        this.result = result
        onResolved(this)
    }

    override fun reject(errorName: String?, errorMessage: String?, errorThrowable: Throwable?, errorMap: WritableMap?) {
        this.status = PromiseStatus.rejected
        this.errorName = errorName
        this.errorMessage = errorMessage
        this.errorThrowable = errorThrowable
        this.errorMap = errorMap
        onRejected(this)
    }

    override fun reject(errorName: String, errorMessage: String?) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorName: String) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorName: String, errorThrowable: Throwable?) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorName: String, errorMessage: String?, errorThrowable: Throwable?) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorThrowable: Throwable) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorThrowable: Throwable, errorMap: WritableMap) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorName: String, errorMap: WritableMap) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorName: String, errorThrowable: Throwable?, errorMap: WritableMap) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }

    override fun reject(errorName: String, errorMessage: String?, errorMap: WritableMap) {
        reject(errorName, errorMessage, errorThrowable, errorMap)
    }
}

class MockResolvingPromise(onResolved: (MockPromise) -> Unit) :
    MockPromise(onResolved, {
        fail("Expected promise to be resolved but error occurred: {${it.errorThrowable?.localizedMessage}}")
    })

class MockRejectingPromise(onRejected: (MockPromise) -> Unit) :
    MockPromise({ fail("Expected promise to be rejected") }, onRejected)
