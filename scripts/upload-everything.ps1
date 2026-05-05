# Upload the new logo + 20 monthly compounding banners to R2.
#
# One-shot wrapper around the Node uploaders so you don't have to type
# multiple commands. Spaces in 'C:\Users\DEV NARSI\...' are handled via
# quoted-string arg passing — PowerShell forwards each path as a single
# token to node, and the .mjs scripts read it from process.argv as-is.
#
# Usage (from anywhere — script resolves the repo from its own location):
#   powershell -ExecutionPolicy Bypass -File "C:\Users\DEV NARSI\Projects\turboloop-hub\scripts\upload-everything.ps1"
#
# Optional override paths:
#   -LogoPath  <abs path to PNG>
#   -EnDir     <abs path to English banners folder>
#   -DeDir     <abs path to German banners folder>

[CmdletBinding()]
param(
    [string]$LogoPath = "C:\Users\DEV NARSI\Downloads\turboloop_icon_transparent.png",
    [string]$EnDir   = "C:\Users\DEV NARSI\Downloads\TurboLoop_Monthly_Banners",
    [string]$DeDir   = "C:\Users\DEV NARSI\Downloads\TurboLoop_Monthly_German_Banners"
)

$ErrorActionPreference = "Stop"

# Locate the repo root (the parent of scripts/, where this file lives).
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
$RepoRoot = Split-Path -Parent $ScriptDir

Write-Host "TurboLoop R2 uploader" -ForegroundColor Cyan
Write-Host "  repo: $RepoRoot"
Write-Host ""

# Sanity-check inputs upfront so we fail fast instead of half-finishing.
$problems = @()
if (-not (Test-Path -LiteralPath $LogoPath))     { $problems += "Logo not found: $LogoPath" }
if (-not (Test-Path -LiteralPath $EnDir))         { $problems += "EN folder not found: $EnDir" }
if (-not (Test-Path -LiteralPath $DeDir))         { $problems += "DE folder not found: $DeDir" }
if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot ".env"))) {
    $problems += ".env not found at repo root (need R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)"
}
if ($problems.Count -gt 0) {
    Write-Host "Cannot proceed:" -ForegroundColor Red
    $problems | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

Push-Location -LiteralPath $RepoRoot
try {
    # ─── 1. Logo ─────────────────────────────────────────────────────────
    Write-Host "[1/3] Uploading logo" -ForegroundColor Cyan
    & node "scripts/upload-logo.mjs" "$LogoPath"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Logo upload failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host ""

    # ─── 2. English banners ──────────────────────────────────────────────
    Write-Host "[2/3] Uploading English banners" -ForegroundColor Cyan
    & node "scripts/upload-banners-from-folder.mjs" "--lang" "en" "--dir" "$EnDir"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "English banner upload failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host ""

    # ─── 3. German banners ───────────────────────────────────────────────
    Write-Host "[3/3] Uploading German banners" -ForegroundColor Cyan
    & node "scripts/upload-banners-from-folder.mjs" "--lang" "de" "--dir" "$DeDir"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "German banner upload failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "All done." -ForegroundColor Green
Write-Host "  Logo: branding/turboloop-logo.png"
Write-Host "  Banners: monthly-banners/monthly-{en,de}-{50,100,500,1000,1500,2000,5000,10000,50000,grand-master}.png"
Write-Host ""
Write-Host "Hard-refresh the site once to bypass Cloudflare edge cache for the logo swap."
