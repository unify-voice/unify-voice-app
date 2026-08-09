package com.unifyvoice.android

import android.content.ClipData
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.io.File
import java.net.URL
import java.util.concurrent.Executors

class ShareMediaModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private val io = Executors.newSingleThreadExecutor()

  override fun getName(): String = "ShareMedia"

  @ReactMethod
  fun share(options: ReadableMap, promise: Promise) {
    val text = options.getString("text")?.trim().orEmpty()
    val url = options.getString("url")?.trim().orEmpty()
    val title = options.getString("title")?.trim().orEmpty().ifEmpty { "Unify Voice" }

    io.execute {
      try {
        val activity = reactContext.currentActivity
        if (activity == null) {
          promise.reject("share", "No activity to present share sheet.")
          return@execute
        }

        val intent = Intent(Intent.ACTION_SEND)
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        if (text.isNotEmpty()) {
          intent.putExtra(Intent.EXTRA_TEXT, text)
          intent.putExtra(Intent.EXTRA_SUBJECT, title)
        }

        if (url.isNotEmpty()) {
          val file = resolveLocalFile(url)
          val uri =
            FileProvider.getUriForFile(
              activity,
              "${activity.packageName}.fileprovider",
              file,
            )
          intent.type = "video/*"
          intent.putExtra(Intent.EXTRA_STREAM, uri)
          intent.clipData = ClipData.newUri(activity.contentResolver, title, uri)
        } else {
          intent.type = "text/plain"
        }

        activity.runOnUiThread {
          activity.startActivity(Intent.createChooser(intent, title))
          promise.resolve(true)
        }
      } catch (err: Exception) {
        promise.reject("share", err.message ?: "Share failed.", err)
      }
    }
  }

  private fun resolveLocalFile(url: String): File {
    val parsed = Uri.parse(url)
    if (parsed.scheme == "file" && parsed.path != null) {
      return File(parsed.path!!)
    }
    val ext =
      parsed.lastPathSegment
        ?.substringAfterLast('.', "")
        ?.takeIf { it.length in 2..5 }
        ?: "mp4"
    val dir = File(reactContext.cacheDir, "share").apply { mkdirs() }
    val out = File(dir, "unify-sign-${System.currentTimeMillis()}.$ext")
    URL(url).openStream().use { input ->
      out.outputStream().use { output -> input.copyTo(output) }
    }
    return out
  }
}
