[CmdletBinding()]
param()

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$appName = 'AldenirMed89'
$localAppData = [Environment]::GetFolderPath('LocalApplicationData')
$desktopDirectory = [Environment]::GetFolderPath('DesktopDirectory')
$programsDirectory = [Environment]::GetFolderPath('Programs')
$installDirectory = Join-Path $localAppData $appName
$startMenuDirectory = Join-Path $programsDirectory $appName
$desktopShortcut = Join-Path $desktopDirectory ($appName + '.lnk')

$knownFiles = @(
    'Abrir-Antigravity.cmd',
    'Desinstalar.ps1',
    'AntigravityConsultas.ico',
    'VERSAO.txt'
)

function Remove-KnownFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Remove-Item -LiteralPath $Path -Force
    }
}

try {
    Set-Location ([System.IO.Path]::GetTempPath())

    foreach ($ownedDirectory in @($installDirectory, $startMenuDirectory)) {
        if (Test-Path -LiteralPath $ownedDirectory -PathType Container) {
            $ownedItem = Get-Item -LiteralPath $ownedDirectory -Force
            if (($ownedItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw ('Pasta controlada por junction ou link simbolico: ' + $ownedDirectory)
            }
        }
    }

    Remove-KnownFile -Path $desktopShortcut
    Remove-KnownFile -Path (Join-Path $startMenuDirectory ($appName + '.lnk'))
    Remove-KnownFile -Path (Join-Path $startMenuDirectory ('Desinstalar ' + $appName + '.lnk'))

    if (Test-Path -LiteralPath $startMenuDirectory -PathType Container) {
        $remainingStartItems = @(Get-ChildItem -LiteralPath $startMenuDirectory -Force)
        if ($remainingStartItems.Count -eq 0) {
            Remove-Item -LiteralPath $startMenuDirectory -Force
        }
        else {
            Write-Warning 'A pasta do Menu Iniciar contem itens desconhecidos e foi preservada.'
        }
    }

    foreach ($fileName in $knownFiles) {
        Remove-KnownFile -Path (Join-Path $installDirectory $fileName)
    }

    if (Test-Path -LiteralPath $installDirectory -PathType Container) {
        $remainingInstallItems = @(Get-ChildItem -LiteralPath $installDirectory -Force)
        if ($remainingInstallItems.Count -eq 0) {
            Remove-Item -LiteralPath $installDirectory -Force
        }
        else {
            Write-Warning ('Arquivos desconhecidos foram preservados em: ' + $installDirectory)
        }
    }

    Write-Host ''
    Write-Host 'OK: atalhos e arquivos conhecidos foram removidos.' -ForegroundColor Green
    Write-Host 'Nenhum arquivo pessoal e nenhuma configuracao global do Windows foram alterados.'
    exit 0
}
catch {
    Write-Error ('Falha na desinstalacao: ' + $_.Exception.Message)
    exit 1
}
