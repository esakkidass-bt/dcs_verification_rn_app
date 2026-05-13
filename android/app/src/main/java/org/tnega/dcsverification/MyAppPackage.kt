package org.tnega.dcsverification

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class MyAppPackage : ReactPackage {
    override fun createViewManagers(
            reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules: MutableList<NativeModule> = ArrayList()

        modules.add(BasicFunctions(reactContext))
        modules.add(DeviceIdModule(reactContext))
        modules.add(ImageManipulationModule(reactContext))
        modules.add(DarkZipFileModule(reactContext))
        modules.add(AppSecurityModule(reactContext))
        modules.add(PlayIntegrityModule(reactContext))

        return modules
    }
}
