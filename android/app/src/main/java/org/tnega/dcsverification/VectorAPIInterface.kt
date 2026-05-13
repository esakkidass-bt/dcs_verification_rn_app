package org.tnega.dcsverification

import okhttp3.MultipartBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface VectorAPIInterface {
    @Multipart
    @POST("vector_tiles")
    fun getvector_tiles(
        @Header("X-USER-ID") userId: String,
        @Header("X-DEVICE-ID") deviceId: String,
        @Header("X-APP-KEY") appKey: String,
        @Part file: List<MultipartBody.Part>
    ): Call<ResponseBody?>?
}
