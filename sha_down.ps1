# Animasyonlu uzaktan çalıştırma
param(
    [string]$Url,
    [string]$Mode = "download",
    [switch]$Animated = $true
)

function Show-Animation {
    param([string]$Text)
    
    $frames = @("⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷")
    $colors = @("Red", "Yellow", "Green", "Cyan", "Blue", "Magenta")
    
    for ($i = 0; $i -lt 24; $i++) {
        $frame = $frames[$i % $frames.Length]
        $color = $colors[$i % $colors.Length]
        Write-Host "`r$frame $Text" -ForegroundColor $color -NoNewline
        Start-Sleep -Milliseconds 100
    }
    Write-Host "`r✓ $Text Tamamlandı" -ForegroundColor Green
}

function Show-ProgressBar {
    param([string]$Activity, [int]$Seconds = 5)
    
    for ($i = 0; $i -le 100; $i += 5) {
        Write-Progress -Activity $Activity -Status "%$i tamamlandı" -PercentComplete $i
        Start-Sleep -Milliseconds ($Seconds * 10)
    }
    Write-Progress -Activity $Activity -Completed
}

function Invoke-AnimatedDownload {
    param([string]$ScriptUrl)
    
    try {
        # İndirme animasyonu
        Show-Animation "Script indiriliyor..."
        
        # Script içeriğini al
        $scriptContent = Invoke-WebRequest -Uri $ScriptUrl -UseBasicParsing
        
        # Yükleme animasyonu
        Show-ProgressBar "Script yükleniyor" -Seconds 3
        
        # Çalıştırma animasyonu
        Write-Host ""
        Write-Host "🎬 Script çalıştırılıyor..." -ForegroundColor Magenta
        Write-Host "═" * 50 -ForegroundColor Cyan
        
        # Scripti çalıştır
        Invoke-Expression $scriptContent
        
        Write-Host "═" * 50 -ForegroundColor Cyan
        Write-Host "✨ Script başarıyla tamamlandı!" -ForegroundColor Green
        
    } catch {
        Write-Host ""
        Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ASCII banner
Write-Host "
╔══════════════════════════════════════╗
║        🚀 ANİMASYONLU LOADER        ║
║      Uzaktan Script Çalıştırıcı     ║
╚══════════════════════════════════════╝
" -ForegroundColor Cyan

# Ana işlem
if ($Url) {
    if ($Animated) {
        Invoke-AnimatedDownload -ScriptUrl $Url
    } else {
        # Animasyonsuz normal çalıştırma
        iex (irm -Uri $Url -UseBasicParsing)
    }
} else {
    # Demo modu - kendi kendini çalıştır
    Write-Host "Demo modu: Kendi URL'sini kullanıyor..." -ForegroundColor Yellow
    $demoUrl = "https://raw.githubusercontent.com/CRTYPUBG/crtyxspeed/refs/heads/main/sha_down.ps1"
    Invoke-AnimatedDownload -ScriptUrl $demoUrl
}

# Ek animasyon efektleri
function Show-SuccessAnimation {
    $chars = @("█", "▓", "▒", "░")
    Write-Host "`n"
    for ($i = 0; $i -lt 20; $i++) {
        $char = $chars[$i % $chars.Length]
        Write-Host "`r$char" -ForegroundColor ("Green", "Yellow", "Cyan")[$i % 3] -NoNewline
        Start-Sleep -Milliseconds 50
    }
    Write-Host "`r🎉 İşlem tamam! " -ForegroundColor Green
}

Show-SuccessAnimation
