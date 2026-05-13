package org.tnega.dcsverification

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

import com.facebook.react.bridge.Arguments

import android.content.Context
import android.location.Location
import android.location.LocationManager

import android.location.Criteria
import android.location.LocationListener
import android.os.Build
import android.os.Bundle
import android.os.Looper

import android.util.Log

import java.lang.Exception

class BasicFunctions(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BasicFunctions" // Name of the module
    }

    @ReactMethod
    fun forceExitApp() {
        reactApplicationContext.currentActivity?.finishAffinity()
    }

    @ReactMethod
    fun checkDeveloperOptionEnabled() {
        Utils.checkDeveloperOptionEnabled(reactApplicationContext.currentActivity)
    }

//    location
    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        try {
            val locationManager = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager

            val providers = locationManager.getProviders(true)
            var bestLocation: Location? = null

            for (provider in providers) {
                try {
                    val location = locationManager.getLastKnownLocation(provider)
                    if (location != null && (bestLocation == null || location.accuracy < bestLocation.accuracy)) {
                        bestLocation = location
                    }
                } catch (e: SecurityException) {
                    promise.reject("LOCATION_ERROR", "Missing location permissions", e)
                    return
                }
            }

            if (bestLocation != null) {
                val locationMap = Arguments.createMap()
                locationMap.putDouble("latitude", bestLocation.latitude)
                locationMap.putDouble("longitude", bestLocation.longitude)
                locationMap.putDouble("accuracy", bestLocation.accuracy.toDouble())
                promise.resolve(locationMap)
            } else {
                promise.reject("LOCATION_NOT_FOUND", "Unable to fetch location")
            }
        } catch (e: Exception) {
            promise.reject("LOCATION_EXCEPTION", "Error while getting location", e)
        }
    }


//    @ReactMethod
//    fun getVerifiedLocation(promise: Promise) {
//        try {
//            val locationManager = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
//            val providers = locationManager.getProviders(true)
//
//            var bestLocation: Location? = null
//            var isMocked = false
//
//            Log.d("getVerifiedLocation", "Available providers: $providers")
//
//            for (provider in providers) {
//                val location = try {
////                    locationManager.getLastKnownLocation(provider)
//                    locationManager.requestSingleUpdate(
//                        Criteria().apply { accuracy = Criteria.ACCURACY_FINE },
//                        object : LocationListener {
//                            override fun onLocationChanged(location: Location) {
//                                // handle success
//                            }
//
//                            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
//                            override fun onProviderEnabled(provider: String) {}
//                            override fun onProviderDisabled(provider: String) {}
//                        },
//                        null
//                    )
//                } catch (e: SecurityException) {
//                    Log.e("getVerifiedLocation", "SecurityException for $provider: ${e.message}")
//                    null
//                }
//
//                Log.d("getVerifiedLocation", "Provider: $provider, Location: ${location?.toString() ?: "null"}")
//
//                if (location != null) {
//                    if (bestLocation == null || location.accuracy < bestLocation.accuracy) {
//                        bestLocation = location
//                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
//                            isMocked = location.isFromMockProvider
//                        }
//                    }
//                }
//            }
//
//            Log.d("getVerifiedLocation", "Best location: ${bestLocation?.toString() ?: "null"}")
//
//            Log.d("bestLocation", bestLocation?.toString() ?: "null")
//            if (bestLocation != null) {
//                val locationMap = Arguments.createMap()
//                locationMap.putDouble("latitude", bestLocation.latitude)
//                locationMap.putDouble("longitude", bestLocation.longitude)
//                locationMap.putDouble("accuracy", bestLocation.accuracy.toDouble())
//                locationMap.putDouble("timestamp", bestLocation.time.toDouble())
//                locationMap.putBoolean("isMocked", isMocked)
//
//                promise.resolve(locationMap)
//            } else {
//                promise.reject("LOCATION_NOT_FOUND", "Could not fetch a valid location.")
//            }
//        } catch (e: Exception) {
//            promise.reject("LOCATION_ERROR", "Error while retrieving location", e)
//        }
//    }



    @ReactMethod
    fun getVerifiedLocation(promise: Promise) {
        try {
            val locationManager = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager

            val criteria = Criteria().apply {
                accuracy = Criteria.ACCURACY_FINE
            }

            val locationListener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    val locationMap = Arguments.createMap()
                    locationMap.putDouble("latitude", location.latitude)
                    locationMap.putDouble("longitude", location.longitude)
                    locationMap.putDouble("accuracy", location.accuracy.toDouble())
                    locationMap.putDouble("timestamp", location.time.toDouble())

                    val isMocked = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                        location.isFromMockProvider
                    } else false

                    locationMap.putBoolean("isMocked", isMocked)

                    promise.resolve(locationMap)

                    // Optional: remove listener if you don’t want continuous updates
                    locationManager.removeUpdates(this)
                }

                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {
                    promise.reject("LOCATION_PROVIDER_DISABLED", "Location provider disabled.")
                    locationManager.removeUpdates(this)
                }
            }

            locationManager.requestSingleUpdate(criteria, locationListener, Looper.getMainLooper())

        } catch (e: SecurityException) {
            promise.reject("LOCATION_PERMISSION_ERROR", "Missing location permission", e)
        } catch (e: Exception) {
            promise.reject("LOCATION_ERROR", "Failed to get location", e)
        }
    }
}
