<#
.SYNOPSIS
    Gera imagens PLACEHOLDER de exemplo.

.DESCRIPTION
    ATENÇÃO: este script NUNCA sobrescreve uma imagem que você já colocou no
    projeto. Por padrão ele pula qualquer arquivo que já exista. Só use -Forcar
    para regerar algo de propósito.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\gerar-placeholders.ps1
    powershell -ExecutionPolicy Bypass -File .\scripts\gerar-placeholders.ps1 -Forcar
#>
param([switch]$Forcar)

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$dirBlocos = Join-Path $PSScriptRoot "..\public\blocos"
$dirElementos = Join-Path $PSScriptRoot "..\public\elementos"
$dirRaiz = Join-Path $PSScriptRoot "..\public"
New-Item -ItemType Directory -Force -Path $dirBlocos, $dirElementos, $dirRaiz | Out-Null

function Nova-Canvas([int]$w, [int]$h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    return @($bmp, $g)
}

function Desenhar-Tracejado($g, $x, $y, $w, $h, $cor, $espessura) {
    $caneta = New-Object System.Drawing.Pen($cor, $espessura)
    $caneta.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $g.DrawRectangle($caneta, $x, $y, $w, $h)
    $caneta.Dispose()
}

function Texto($g, $conteudo, $fonte, $cor, $cx, $cy, $largura) {
    $brush = New-Object System.Drawing.SolidBrush($cor)
    $formato = New-Object System.Drawing.StringFormat
    $formato.Alignment = [System.Drawing.StringAlignment]::Center
    $formato.LineAlignment = [System.Drawing.StringAlignment]::Center
    $ret = New-Object System.Drawing.RectangleF([single]($cx - $largura / 2), [single]($cy - 40), [single]$largura, 80)
    $g.DrawString($conteudo, $fonte, $brush, $ret, $formato)
    $formato.Dispose()
    $brush.Dispose()
}

function Salvar($canvas, $caminho) {
    # PROTEÇÃO: nunca sobrescreve uma imagem que já existe, a não ser com -Forcar.
    if ((Test-Path -LiteralPath $caminho) -and (-not $Forcar)) {
        Write-Host "  -- PULADO (existe): $caminho"
        $canvas[1].Dispose()
        $canvas[0].Dispose()
        return
    }
    $canvas[1].Dispose()
    $canvas[0].Save($caminho, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas[0].Dispose()
    Write-Host "  -> $caminho"
}

function Fonte($nome, $tamanho, $estilo) {
    return New-Object System.Drawing.Font($nome, $tamanho, $estilo)
}

function Solido($r, $g, $a) {
    return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($a, $r, $g, $a))
}

# ================================================================= FUNDOS ====
$funds = @(
    @{ arquivo = "bloco-1.png"; c1 = [System.Drawing.Color]::FromArgb(255, 24, 34, 68); c2 = [System.Drawing.Color]::FromArgb(255, 96, 62, 148); titulo = "BLOCO 1"; sub = "/blocos/bloco-1.png   1600 x 1000" },
    @{ arquivo = "bloco-2.png"; c1 = [System.Drawing.Color]::FromArgb(255, 12, 66, 72); c2 = [System.Drawing.Color]::FromArgb(255, 22, 118, 128); titulo = "BLOCO 2"; sub = "/blocos/bloco-2.png   1600 x 1000" }
)

Write-Host "Fundos:"
foreach ($item in $funds) {
    $canvas = Nova-Canvas 1600 1000
    $g = $canvas[1]
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle(0, 0, 1600, 1000)),
        $item.c1, $item.c2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($brush, 0, 0, 1600, 1000)
    $brush.Dispose()
    Desenhar-Tracejado $g 40 40 1520 920 ([System.Drawing.Color]::FromArgb(120, 255, 255, 255)) 3
    $ft = Fonte "Arial" 92 ([System.Drawing.FontStyle]::Bold)
    $fs = Fonte "Consolas" 28 ([System.Drawing.FontStyle]::Regular)
    Texto $g $item.titulo $ft ([System.Drawing.Color]::FromArgb(235, 255, 255, 255)) 800 460 1200
    Texto $g $item.sub $fs ([System.Drawing.Color]::FromArgb(185, 255, 255, 255)) 800 570 1200
    $ft.Dispose(); $fs.Dispose()
    Salvar $canvas (Join-Path $dirBlocos $item.arquivo)
}

# ============================================================== ELEMENTOS ====
# IMPORTANTE: os elementos sao desenhados SEM MARGEM TRANSPARENTE, ou seja, a
# caixa da imagem (o que o `width` do config controla) coincide com o desenho.
# Assim o `left/top` do config posiciona exatamente o que voce ve.
Write-Host "Elementos:"

# titulo.png
$canvas = Nova-Canvas 1600 520
$g = $canvas[1]
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 255, 255, 255))
$g.FillRectangle($brush, 0, 0, 1600, 520)
$brush.Dispose()
Desenhar-Tracejado $g 10 10 1580 500 ([System.Drawing.Color]::FromArgb(110, 40, 40, 60)) 4
$ft = Fonte "Arial" 118 ([System.Drawing.FontStyle]::Bold)
Texto $g "TITULO" $ft ([System.Drawing.Color]::FromArgb(255, 30, 30, 50)) 800 260 1400
$ft.Dispose()
Salvar $canvas (Join-Path $dirElementos "titulo.png")

# nuvem.png
$canvas = Nova-Canvas 1000 620
$g = $canvas[1]
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(175, 255, 255, 255))
$g.FillEllipse($brush, 400, 20, 260, 260)
$g.FillEllipse($brush, 250, 120, 230, 230)
$g.FillEllipse($brush, 560, 130, 230, 230)
$g.FillRectangle($brush, 320, 190, 380, 170)
$brush.Dispose()
$ft = Fonte "Arial" 50 ([System.Drawing.FontStyle]::Bold)
Texto $g "NUVEM" $ft ([System.Drawing.Color]::FromArgb(150, 20, 20, 30)) 500 180 700
$ft.Dispose()
Salvar $canvas (Join-Path $dirElementos "nuvem.png")

# selo.png
$canvas = Nova-Canvas 700 700
$g = $canvas[1]
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 214, 92))
$g.FillEllipse($brush, 4, 4, 692, 692)
$brush.Dispose()
$caneta = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 40, 40, 40), 10)
$g.DrawEllipse($caneta, 4, 4, 692, 692)
$caneta.Dispose()
$ft = Fonte "Arial" 118 ([System.Drawing.FontStyle]::Bold)
Texto $g "100%" $ft ([System.Drawing.Color]::FromArgb(255, 40, 40, 40)) 350 350 620
$ft.Dispose()
Salvar $canvas (Join-Path $dirElementos "selo.png")

# grafico.png
$canvas = Nova-Canvas 1300 900
$g = $canvas[1]
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(75, 10, 20, 40))
$g.FillRectangle($brush, 0, 0, 1300, 900)
$brush.Dispose()
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 120, 200, 255))
$alturas = @(300, 480, 380, 620, 540)
for ($i = 0; $i -lt $alturas.Count; $i++) {
    $x = 70 + $i * 240
    $h = $alturas[$i]
    $g.FillRectangle($brush, $x, (820 - $h), 160, $h)
}
$brush.Dispose()
$caneta = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(190, 255, 255, 255), 5)
$g.DrawRectangle($caneta, 0, 0, 1300, 900)
$caneta.Dispose()
$ft = Fonte "Arial" 74 ([System.Drawing.FontStyle]::Bold)
Texto $g "GRAFICO" $ft ([System.Drawing.Color]::FromArgb(200, 20, 20, 30)) 650 110 1000
$ft.Dispose()
Salvar $canvas (Join-Path $dirElementos "grafico.png")

# destaque.png
$canvas = Nova-Canvas 1200 520
$g = $canvas[1]
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.FillRectangle($brush, 0, 0, 1200, 520)
$brush.Dispose()
$caneta = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 255, 90, 60), 16)
$g.DrawRectangle($caneta, 0, 0, 1200, 520)
$caneta.Dispose()
$ft = Fonte "Arial" 94 ([System.Drawing.FontStyle]::Bold)
Texto $g "DESTAQUE" $ft ([System.Drawing.Color]::FromArgb(255, 40, 40, 40)) 600 260 1100
$ft.Dispose()
Salvar $canvas (Join-Path $dirElementos "destaque.png")

# ================================================================== LOGO ====
# Placeholder do logo da navbar (branco, sobre a barra roxa).
Write-Host "Logo:"
$canvas = Nova-Canvas 360 120
$g = $canvas[1]
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.FillEllipse($brush, 8, 24, 72, 72)
$g.FillRectangle($brush, 92, 44, 260, 12)
$g.FillRectangle($brush, 92, 70, 170, 12)
$brush.Dispose()
$ft = Fonte "Arial" 30 ([System.Drawing.FontStyle]::Bold)
Texto $g "LOGO" $ft ([System.Drawing.Color]::FromArgb(255, 255, 255, 255)) 222 30 200
$ft.Dispose()
Salvar $canvas (Join-Path $dirRaiz "logo.png")

Write-Host "Pronto."
