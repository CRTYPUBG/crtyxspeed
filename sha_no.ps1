<#
  Güvenlik amacıyla:
  - Bu betik dosyayı indirir, SHA-256 ile doğrular ve Authenticode (dijital imza) bilgisini alır.
  - Eğer hash eşleşiyorsa ve imza bilgisi uygunsa, kullanıcıya bilgi verir.
  - OTOMATİK ÇALIŞTIRMAYI YAPMAZ. Çalıştırma komutu yorum satırı halinde bırakıldı — isteyerek açıp kullanabilirsin.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Url,

    [Parameter(Mandatory=$false)]
    [string]$Destination = "$env:TEMP\downloaded_file",

    # Verilen SHA-256 (senin sağladığın)
    [string]$expectedHash = "582e0e1133a3029d06275b427d51967b447d6d177b6198738c9b4e412ce38de4"
)

try {
    Write-Host "İndirilen dosya: $Destination"
    Write-Host "İndirme başlatılıyor..."

    # İndir
    Invoke-WebRequest -Uri $Url -OutFile $Destination -UseBasicParsing -ErrorAction Stop

    Write-Host "İndirme tamamlandı. Hash hesaplanıyor..."

    # SHA-256 hesapla
    $hashObj = Get-FileHash -Path $Destination -Algorithm SHA256 -ErrorAction Stop
    $actualHash = $hashObj.Hash.ToLower()

    Write-Host "Hesaplanan SHA-256: $actualHash"
    Write-Host "Beklenen SHA-256:   $expectedHash"

    if ($actualHash -ne $expectedHash.ToLower()) {
        Write-Host ""
        Write-Host "UYARI: Hash eşleşmiyor! Dosya beklenen değerden farklı." -ForegroundColor Red
        Write-Host "Bu durumda dosyayı çalıştırmamalısın. Dosyayı güvenli bir ortamda (sandbox/VM) analiz et."
        return
    }

    Write-Host "Hash eşleşiyor. İmzaya bakılıyor..."

    # Authenticode (dijital imza) kontrolü
    $sig = Get-AuthenticodeSignature -FilePath $Destination
    Write-Host "İmza durumu: $($sig.Status)"
    if ($sig.SignerCertificate) {
        Write-Host "Sertifika konusu (Subject): $($sig.SignerCertificate.Subject)"
        Write-Host "Sertifika sağlayıcısı (Issuer): $($sig.SignerCertificate.Issuer)"
        Write-Host "Sertifika geçerlilik: $($sig.SignerCertificate.NotBefore) - $($sig.SignerCertificate.NotAfter)"
    } else {
        Write-Host "Dosya dijital olarak imzalanmamış veya imza bilgisi bulunamadı."
    }

    Write-Host ""
    Write-Host "NOT: Hash eşleşmesi tek başına dosyanın 'güvenli' olduğunu garanti etmez. Dijital imza ve dosyanın kaynağı da önemlidir."
    Write-Host ""

    # Kullanıcı bilgilendirme — çalıştırma YAPMIYORUZ
    Write-Host "Dosya hazır. Aşağıdaki satır çalıştırma örneğidir ve KASTEN yorum satırı halindedir."
    Write-Host "Eğer dosyayı çalıştırmayı TAMAMEN KABUL EDİYORSANIZ, Start-Process satırının başındaki '#' karakterini kaldırarak çalıştırabilirsiniz."
    Write-Host ""
    Write-Host "#Start-Process -FilePath `"$Destination`" -ArgumentList @() -Wait"

    Write-Host ""
    Write-Host "Alternatif (güvenli) öneri: dosyayı önce bir VM veya sandbox ortamında manuel olarak çalıştır ve davranışı gözlemle."

} catch {
    Write-Host "Hata: $($_.Exception.Message)" -ForegroundColor Red
}
