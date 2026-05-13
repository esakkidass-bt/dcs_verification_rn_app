package org.tnega.dcsverification

import android.content.Context
import android.os.Build
import android.util.Log
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

object RootChecker {

    private const val TAG = "RootChecker"

    private val binaryPaths = arrayOf(
        "/data/local/",
        "/data/local/bin/",
        "/data/local/xbin/",
        "/sbin/",
        "/su/bin/",
        "/system/bin/",
        "/system/bin/.ext/",
        "/system/bin/failsafe/",
        "/system/sd/xbin/",
        "/system/usr/we-need-root/",
        "/system/xbin/",
        "/system/app/Superuser.apk",
        "/cache",
        "/data",
        "/dev"
    )

    fun detectTestKeys(): Boolean {
        val buildTags = Build.TAGS
        return buildTags?.contains("test-keys") == true
    }

    fun checkForSuBinary(): Boolean {
        return checkForBinary("su")
    }

    fun checkForBusyBoxBinary(): Boolean {
        return checkForBinary("busybox")
    }

    private fun checkForBinary(filename: String): Boolean {
        for (path in binaryPaths) {
            val file = File(path, filename)
            if (file.exists()) {
                Log.d(TAG, "Found binary at: ${file.absolutePath}")
                return true
            }
        }
        return false
    }

    fun checkSuExists(): Boolean {
        var process: Process? = null
        return try {
            process = Runtime.getRuntime().exec(arrayOf("/system/xbin/which", "su"))
            BufferedReader(InputStreamReader(process.inputStream)).use { reader ->
                val line = reader.readLine()
                line != null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking for su binary", e)
            false
        } finally {
            process?.destroy()
        }
    }
}