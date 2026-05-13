package org.tnega.dcsverification

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.os.Environment
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

class ImageManipulationModule (reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ImageManipulationModule"
    }

    @ReactMethod
    fun testFunction(promise: Promise){
        Log.d("ImageManipulationModule", "ter")
        promise.resolve("ter")
    }

    @ReactMethod
    fun addTextToImage(imagePath: String, text: String, outDir: String, filename: String, callback: Callback) {
        Log.d("ImageManipulationModule", "addTextToImage called with imagePath: $imagePath, text: $text, outDir: $outDir")

        try {
            // Remove 'file://' if present to get the actual file path
            val actualPath = if (imagePath.startsWith("file://")) {
                imagePath.substring(7)  // Remove 'file://'
            } else {
                imagePath  // Use the path as is
            }

            // Decode the image from the actual file path
            val bitmap = BitmapFactory.decodeFile(actualPath)

            if (bitmap == null) {
                Log.e("ImageManipulationModule", "Failed to decode image at path: $actualPath")
                callback.invoke("Failed to decode image")
                return
            }

            Log.d("ImageManipulationModule", "Image decoded successfully, adding text.")
            val modifiedBitmap = addTextToBitmap(bitmap, text)

            // Ensure the output directory exists
            val outputDir = File(outDir)
            if (!outputDir.exists()) {
                val dirCreated = outputDir.mkdirs()  // Create the directory if it doesn't exist
                if (dirCreated) {
                    Log.d("ImageManipulationModule", "Created output directory: ${outputDir.absolutePath}")
                } else {
                    Log.e("ImageManipulationModule", "Failed to create output directory.")
                    callback.invoke("Failed to create output directory")
                    return
                }
            }

            val outputFile = File(outputDir, filename)

            // Save the modified image to the provided output directory
            saveBitmapToFile(modifiedBitmap, outputFile)

            // Log success and return the file path
            Log.d("ImageManipulationModule", "Image saved to: ${outputFile.absolutePath}")
            callback.invoke(null, outputFile.absolutePath) // Returning the saved image path
        } catch (e: Exception) {
            // Log any exceptions
            Log.e("ImageManipulationModule", "Error occurred while adding text to image", e)
            callback.invoke(e.message)
        }
    }
private fun addTextToBitmap(bitmap: Bitmap, text: String): Bitmap {
    val width = bitmap.width
    val height = bitmap.height
    val modifiedBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true)

    val canvas = Canvas(modifiedBitmap)
    val paint = Paint().apply {
        color = Color.WHITE // Text color
        textSize = 10f // Font size 10
        isAntiAlias = true
        textAlign = Paint.Align.LEFT
    }

    val bgPaint = Paint().apply {
        color = Color.argb((0.2f * 255).toInt(), 219, 219, 219) // Convert RGBA to ARGB
        style = Paint.Style.FILL
    }

    val padding = 10f // Padding for text box
    val maxTextWidth = width - 20f // Ensure text fits inside image with margins

    // Wrap text dynamically based on image width
    val wrappedText = wrapText(text, paint, maxTextWidth)
    val lineHeight = paint.textSize // **No extra space between lines**
    val textHeight = lineHeight * wrappedText.size + padding * 2 // Total height

    val x = 10f // Left margin
    var y = height - 10f // Bottom margin

    val boxLeft = x - padding
    val boxTop = y - textHeight
    val boxRight = x + maxTextWidth + padding
    val boxBottom = y + padding

    // Draw background box
    canvas.drawRect(boxLeft, boxTop, boxRight, boxBottom, bgPaint)

    // Draw wrapped text inside the box
    y -= padding // Adjust for padding
    for (line in wrappedText.reversed()) { // Draw from bottom to top
        canvas.drawText(line, x, y, paint)
        y -= lineHeight // **No extra space between lines**
    }

    return modifiedBitmap
}

/**
 * Function to wrap text based on max width
 */
private fun wrapText(text: String, paint: Paint, maxWidth: Float): List<String> {
    val words = text.split(" ")
    val lines = mutableListOf<String>()
    var currentLine = ""

    for (word in words) {
        val testLine = if (currentLine.isEmpty()) word else "$currentLine $word"
        if (paint.measureText(testLine) <= maxWidth) {
            currentLine = testLine
        } else {
            lines.add(currentLine) // Store current line and start a new one
            currentLine = word
        }
    }
    if (currentLine.isNotEmpty()) {
        lines.add(currentLine)
    }

    return lines
}


    private fun saveBitmapToFile(bitmap: Bitmap, file: File) {
        try {
            val fileOutputStream = FileOutputStream(file)
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fileOutputStream)
            fileOutputStream.flush()
            fileOutputStream.close()
            Log.d("ImageManipulationModule", "Bitmap saved to file: ${file.absolutePath}")
        } catch (e: IOException) {
            Log.e("ImageManipulationModule", "Error saving bitmap to file", e)
        }
    }
}
