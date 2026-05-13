package org.tnega.dcsverification

import android.content.Context
import android.os.Build
import android.provider.Settings
import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
class DeviceIdModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext), ReactPackage {

    override fun getName(): String {
        return "DeviceIdModule"
    }

    override fun createNativeModules(p0: ReactApplicationContext): MutableList<NativeModule> {
        TODO("Not yet implemented")
    }

    override fun createViewManagers(
            p0: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> {
        TODO("Not yet implemented")
    }

    @ReactMethod
    fun getDeviceId(promise: Promise) {
        val context: Context = reactApplicationContext
        val deviceId: String =
                Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        promise.resolve(deviceId)
    }

    @ReactMethod
    fun getDeviceMakeModel(promise: Promise) {
        try {
            val make = Build.MANUFACTURER // e.g., "Samsung"
            val model = Build.MODEL // e.g., "SM-G991B"
            val deviceInfo = "$make-$model"
            promise.resolve(deviceInfo)
        } catch (e: Exception) {
            promise.reject("DEVICE_INFO_ERROR", "Unable to fetch make and model", e)
        }
    }
}
