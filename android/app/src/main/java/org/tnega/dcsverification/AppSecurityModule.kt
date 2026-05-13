package org.tnega.dcsverification

import android.content.pm.PackageManager
import com.facebook.react.bridge.*

class AppSecurityModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppSecurity"

    @ReactMethod
    fun isDeviceSecure(blacklistedPackages: ReadableArray, promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val installedPackages = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)

            val installedPackageNames = installedPackages.map { it.packageName }

            for (i in 0 until blacklistedPackages.size()) {
                val blacklistedPackage = blacklistedPackages.getString(i)
                if (installedPackageNames.contains(blacklistedPackage)) {
                    // Found a blacklisted app
                    promise.resolve(false)
                    return
                }
            }

            // No blacklisted apps found
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SECURITY_ERROR", "Failed to check for blacklisted packages", e)
        }
    }
}