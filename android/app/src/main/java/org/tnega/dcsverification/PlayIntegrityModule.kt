package org.tnega.dcsverification

import android.util.Log
import com.facebook.react.bridge.*
import com.google.android.play.core.integrity.*
import java.io.IOException
import okhttp3.*
import okhttp3.Callback
import org.json.JSONArray

class PlayIntegrityModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PlayIntegrityModule"

    @ReactMethod
    fun checkIntegrity(nonceUrl: String, validateUrl: String, promise: Promise) {
        fetchNonce(nonceUrl) { nonce ->
            if (nonce == null) {
                promise.reject("NONCE_ERROR", "Failed to get nonce from $nonceUrl")
                return@fetchNonce
            }

            val integrityManager: IntegrityManager = IntegrityManagerFactory.create(reactContext)

            Log.d("PlayIntegrityModule", "Nonce: $nonce")

            val request =
                    IntegrityTokenRequest.builder()
                            .setCloudProjectNumber(
                                    223286223777
                            ) // 🔁 Replace with your real GCP Project Number (as Long)
                            .setNonce(nonce)
                            .build()

            integrityManager
                    .requestIntegrityToken(request)
                    .addOnSuccessListener { response ->
                        val token = response.token()
                        Log.d("PlayIntegrityModule", "Token: $token")
                        sendTokenToBackend(validateUrl, token, promise)
                    }
                    .addOnFailureListener { e ->
                        Log.e("PlayIntegrityModule", "Integrity check failed: ${e.message}")
                        promise.reject("TOKEN_ERROR", e.message, e)
                    }
        }
    }

    private fun fetchNonce(nonceUrl: String, callback: (String?) -> Unit) {
        val request =
                Request.Builder().url(nonceUrl).addHeader("X-APP-KEY", "crop\$urvey!").get().build()

        OkHttpClient()
                .newCall(request)
                .enqueue(
                        object : Callback {
                            override fun onFailure(call: Call, e: IOException) {
                                callback(null)
                            }

                            override fun onResponse(call: Call, response: Response) {
                                val responseBody = response.body?.string()
                                try {
                                    val jsonArray = JSONArray(responseBody)
                                    val data = jsonArray.getJSONObject(0).getJSONObject("data")
                                    val rawNonce = data.getString("nonce")

                                    // Convert to web-safe base64 (no-wrap, web-safe encoding)
                                    val decoded =
                                            android.util.Base64.decode(
                                                    rawNonce,
                                                    android.util.Base64.DEFAULT
                                            )
                                    val webSafeNonce =
                                            android.util.Base64.encodeToString(
                                                    decoded,
                                                    android.util.Base64.NO_PADDING or
                                                            android.util.Base64.NO_WRAP or
                                                            android.util.Base64.URL_SAFE
                                            )

                                    Log.d("PlayIntegrityModule", "Nonce (WebSafe): $webSafeNonce")
                                    callback(webSafeNonce)
                                } catch (e: Exception) {
                                    Log.e(
                                            "NonceParse",
                                            "Failed to parse or encode nonce: ${e.message}"
                                    )
                                    callback(null)
                                }
                            }
                        }
                )
    }

   private fun sendTokenToBackend(validateUrl: String, token: String, promise: Promise) {
    val formBody = FormBody.Builder().add("token", token).build()

    val request =
            Request.Builder()
                    .url(validateUrl)
                    .addHeader("X-APP-KEY", "crop\$urvey!")
                    .addHeader("Content-Type", "application/x-www-form-urlencoded")
                    .post(formBody)
                    .build()

    OkHttpClient()
            .newCall(request)
            .enqueue(
                    object : Callback {
                        override fun onFailure(call: Call, e: IOException) {
                            promise.reject("VALIDATION_ERROR", e.message, e)
                        }

                        override fun onResponse(call: Call, response: Response) {
                            val responseStr = response.body?.string()
                            try {
                                val jsonArray = JSONArray(responseStr)
                                val dataObj = jsonArray.getJSONObject(0).getJSONObject("data")
                                val tokenPayload = dataObj.getJSONObject("tokenPayloadExternal")
                                val appIntegrity = tokenPayload.getJSONObject("appIntegrity")
                                val certArray = appIntegrity.getJSONArray("certificateSha256Digest")

                                // Take first digest (if multiple present)
                                val certDigest = certArray.getString(0)

                                // Prepare result map for RN
                                val result = Arguments.createMap()
                                result.putString("rawResponse", responseStr)
                                result.putString("certificateSha256Digest", certDigest)

                                Log.d("PlayIntegrityModule", "Digest: $certDigest")
                                promise.resolve(result)
                            } catch (e: Exception) {
                                Log.e("PlayIntegrityModule", "Parse error: ${e.message}")
                                promise.reject("PARSE_ERROR", e.message, e)
                            }
                        }
                    }
            )
}

}
