package org.tnega.dcsverification

import android.content.Context
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import okhttp3.MultipartBody
import okhttp3.MultipartBody.Builder
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.util.zip.ZipInputStream

class DarkZipFileModule internal constructor(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    private val _context: Context = context
    override fun getName(): String {
        return "DarkZipFileModule"
    }

    private val TAG = this.name

    @get:ReactMethod(isBlockingSynchronousMethod = true)
    val directoryPath: String
        get() {
            val path = _context.filesDir.absolutePath
            Log.d(TAG, "f:getDirectoryPath > $path")
            return path
        }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isFileExist(filePath: String): Boolean {
        val file = File(filePath)
        val isExist = file.exists()
        Log.d(TAG, "f:isFileExist >  filePath > $isExist")
        return isExist
    }


    @ReactMethod
    fun downloadTiles(
        apiEndpoint: String,
        userId: String,
        deviceId: String,
        appKey: String,
        type: String,
        dCode: String,
        tCode: String,
        vCode: String,
        fileName: String,
        destDirName: String,
        onError: Callback,
        onSuccess: Callback
    ) {
        if (VectorAPIClient.getClient(apiEndpoint) == null) {
            return
        }

        val apiInterface: VectorAPIInterface = VectorAPIClient.getClient(apiEndpoint).create(
            VectorAPIInterface::class.java
        )
        val builder: Builder = Builder().setType(MultipartBody.FORM)
        builder.addFormDataPart("type", type)
            .addFormDataPart("district_code", dCode)
            .addFormDataPart("taluk_code", tCode)
            .addFormDataPart("village_code", vCode)

        val requestBody: MultipartBody = builder.build()
        Log.d("downloadTiles", apiInterface.toString())

            apiInterface.getvector_tiles(userId, deviceId, appKey, requestBody.parts)?.enqueue(object : retrofit2.Callback<ResponseBody?> {
            override fun onResponse(call: Call<ResponseBody?>, response: Response<ResponseBody?>) {
                if (response.isSuccessful) {
                    saveFile(response.body()!!, fileName, destDirName, onError, onSuccess)
                } else {
                    onError.invoke()
                }
            }

            override fun onFailure(call: Call<ResponseBody?>, t: Throwable) {
                onError.invoke()
            }
        })
    }


    fun saveFile(
        body: ResponseBody,
        fileName: String,
        destDirName: String,
        onError: Callback,
        onSuccess: Callback
    ) {
        var input: InputStream? = null
        try {
            val zipFilePath = directoryPath + '/'.toString() + fileName
            input = body.byteStream()

            val fos = FileOutputStream(zipFilePath)

            val bytesIn = ByteArray(4096)
            var read = 0
            Log.d("saveFile", "init")
            while ((input.read(bytesIn).also { read = it }) != -1) {
                fos.write(bytesIn, 0, read)
            }
            Log.d("saveFile", "completed")
            unzipV2(fileName, destDirName, onError, onSuccess)
        } catch (ex: Exception) {
            Log.e("saveFile", ex.toString())
            onError.invoke()
        }
    }

    @ReactMethod
    fun getDeviceId(promise: Promise) {
        val context: Context = reactApplicationContext
        val deviceId =
            Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        promise.resolve(deviceId)
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun unzipV2(fileName: String, destDirName: String, onError: Callback, onSuccess: Callback) {
        try {
            val zipFilePath = directoryPath + '/'.toString() + fileName
            val destDirectory = File(directoryPath + '/'.toString() + destDirName)
            val destDir = File(destDirectory.toString())
            if (!destDir.exists()) {
                destDir.mkdir()
            }
            val zipIn = ZipInputStream(FileInputStream(zipFilePath))
            var entry = zipIn.nextEntry
            // iterates over entries in the zip file
            while (entry != null) {
                println(entry.name)
                val filePath = destDirectory.toString() + File.separator + entry.name
                if (!entry.isDirectory) {
                    // if the entry is a file, extracts it
                    extractFile(zipIn, filePath)
                } else {
                    // if the entry is a directory, make the directory
                    val dir = File(filePath)
                    dir.mkdir()
                }
                zipIn.closeEntry()
                entry = zipIn.nextEntry
            }
            zipIn.close()
            deleteFile(fileName, onError, onSuccess)
        } catch (ex: Exception) {
            onError.invoke()
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun deleteFile(fileName: String, onError: Callback, onSuccess: Callback) {
        try {
            val file = File(directoryPath + '/'.toString() + fileName)
            val isDeleted = file.delete()

            if (!isDeleted) {
                Log.d("deleteFile", "Not Deleted")
                onError.invoke()
            } else {
                Log.d("deleteFile", "Deleted")
                onSuccess.invoke()
            }
        } catch (ex: Exception) {
            Log.e("deleteFile", ex.toString())
            onError.invoke()
        }
    }

    @ReactMethod
    fun isDeveloperModeEnabled(promise: Promise) {
        val context: Context = reactApplicationContext
        val devOptions = Settings.Secure.getInt(
            context.contentResolver,
            Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
            0
        )
        val isDeveloperModeEnabled = (devOptions == 1)
        promise.resolve(isDeveloperModeEnabled)
    }

    companion object {
        @Throws(IOException::class)
        fun extractFile(zipIn: ZipInputStream, filePath: String) {
            val file = File(filePath)
            if (!file.parentFile.exists()) {
                file.parentFile.mkdirs()
            }
            val bos = BufferedOutputStream(FileOutputStream(filePath))
            val bytesIn = ByteArray(4096)
            var read = 0
            while ((zipIn.read(bytesIn).also { read = it }) != -1) {
                bos.write(bytesIn, 0, read)
            }
            bos.close()
        }
    }
}
