$sourceDir = "d:\KELAS\WAJIB\SMT 7\Framework"
$zipFile = "d:\KELAS\WAJIB\SMT 7\Framework\presensi-asrama.zip"

if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# Create a temporary directory to copy files without node_modules
$tempDir = Join-Path $env:TEMP "presensi-asrama-export"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy Backend
Write-Host "Copying backend..."
Copy-Item -Path "$sourceDir\backend-presensi-asrama" -Destination $tempDir -Recurse -Exclude "node_modules", "dist", ".git", ".next"

# Copy Frontend
Write-Host "Copying frontend..."
Copy-Item -Path "$sourceDir\frontend-presensi-asrama" -Destination $tempDir -Recurse -Exclude "node_modules", "dist", ".git", ".next"

# Zip the temporary directory
Write-Host "Compressing to ZIP..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile

# Clean up temporary directory
Remove-Item $tempDir -Recurse -Force

Write-Host "ZIP file created successfully at: $zipFile"
