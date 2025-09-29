$url = "https://github.com/CRTYPUBG/crtyxspeed/releases/download/crtyxspeedV1/CrtyXSpeed.Network.Optimizer.Setup.1.0.0.exe"
$destination = "C:\temp\dosya.zip"

Invoke-WebRequest -Uri $url -OutFile $destination

$hash = Get-FileHash -Path $destination -Algorithm SHA256
Write-Host "Dosyanın hash değeri: $($hash.Hash)"

$expectedHash = "582e0e1133a3029d06275b427d51967b447d6d177b6198738c9b4e412ce38de4"
if ($hash.Hash -eq $expectedHash) {
    Write-Host "Hash eşleşiyor. Dosya güvenli görünüyor."
} else {
    Write-Host "Hash eşleşmiyor! Dosya değiştirilmiş veya güvenli değil."
}
