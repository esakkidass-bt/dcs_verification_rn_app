package org.tnega.dcsverification

import android.app.Activity
import android.app.AlertDialog
import android.provider.Settings
import android.util.Log

object Utils {

    fun isDeveloperOptionsEnabled(context: Activity?): Boolean {
        return try {
            // Use structural equality (==) for Kotlin
            Settings.Global.getInt(
                    context?.contentResolver,
                    Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                    0
            ) == 1
        } catch (e: Settings.SettingNotFoundException) {
            Log.e("DeveloperOptionsCheck", "Developer options setting not found", e)
            false // Default to false if setting not found
        }
    }

    fun checkDeveloperOptionEnabled(context: Activity?) {
        if (Utils.isDeveloperOptionsEnabled(context)) {
            Utils.showAlert(
                    "Developer Options Enabled",
                    "Please disable Developer Options to use this app.",
                    context
            )
        }
    }

    fun checkRoot(context: Activity?) {
        if (RootChecker.detectTestKeys() ||
                        RootChecker.checkForBusyBoxBinary() ||
                        RootChecker.checkForSuBinary() ||
                        RootChecker.checkSuExists()
        ) {
            showAlert(
                    "Rooted Device",
                    "You can't use this app because your device is rooted!",
                    context
            )
        }
    }

    fun showAlert(title: String, message: String, context: Activity?) {
        try {
            AlertDialog.Builder(context)
                    .setTitle(title)
                    .setMessage(message)
                    .setCancelable(false)
                    .setPositiveButton("OK") { _, _ ->
                        // Optionally close the app or navigate to home screen
                        context?.finishAffinity()
                    }
                    .show()
        } catch (e: Exception) {
            Log.e("Utils", "Error showing alert", e)
        }
    }
}
