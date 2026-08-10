package com.unifyvoice.android

import android.content.Context
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.OkHttpClient
import java.security.KeyStore
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManagerFactory
import javax.net.ssl.X509TrustManager

/**
 * Galaxy S8 / Android 9 (and similar) do not trust Let's Encrypt YE1 / Root YE.
 * Network Security Config often fails to load compressed PEMs; OkHttp reads them here instead.
 */
class UnifyOkHttpFactory(private val context: Context) : OkHttpClientFactory {
  override fun createNewNetworkModuleClient(): OkHttpClient {
    val trustManager = buildTrustManager()
    val sslContext = SSLContext.getInstance("TLS")
    sslContext.init(null, arrayOf(trustManager), null)
    return OkHttpClientProvider.createClientBuilder(context)
      .sslSocketFactory(sslContext.socketFactory, trustManager)
      .build()
  }

  private fun buildTrustManager(): X509TrustManager {
    val factory = CertificateFactory.getInstance("X.509")
    val extras = KeyStore.getInstance(KeyStore.getDefaultType()).apply { load(null) }
    val ids =
      intArrayOf(
        R.raw.isrg_root_x1,
        R.raw.isrg_root_x2,
        R.raw.isrg_root_ye,
        R.raw.lets_encrypt_ye1,
      )
    ids.forEachIndexed { index, id ->
      context.resources.openRawResource(id).use { stream ->
        val cert = factory.generateCertificate(stream) as X509Certificate
        extras.setCertificateEntry("uv-ca-$index", cert)
      }
    }

    val extraTmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
    extraTmf.init(extras)
    val extraTm = extraTmf.trustManagers.filterIsInstance<X509TrustManager>().first()

    val systemTmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
    systemTmf.init(null as KeyStore?)
    val systemTm = systemTmf.trustManagers.filterIsInstance<X509TrustManager>().first()

    return object : X509TrustManager {
      override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {
        systemTm.checkClientTrusted(chain, authType)
      }

      override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {
        try {
          extraTm.checkServerTrusted(chain, authType)
        } catch (_: Exception) {
          systemTm.checkServerTrusted(chain, authType)
        }
      }

      override fun getAcceptedIssuers(): Array<X509Certificate> =
        extraTm.acceptedIssuers + systemTm.acceptedIssuers
    }
  }
}
