[CmdletBinding()]
param()

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$appName = 'Antigravity Consultas'
$sourceDirectory = $PSScriptRoot
$localAppData = [Environment]::GetFolderPath('LocalApplicationData')
$desktopDirectory = [Environment]::GetFolderPath('DesktopDirectory')
$programsDirectory = [Environment]::GetFolderPath('Programs')
$installDirectory = Join-Path $localAppData $appName
$startMenuDirectory = Join-Path $programsDirectory $appName
$desktopShortcut = Join-Path $desktopDirectory ($appName + '.lnk')
$startShortcut = Join-Path $startMenuDirectory ($appName + '.lnk')
$uninstallShortcut = Join-Path $startMenuDirectory ('Desinstalar ' + $appName + '.lnk')

$payloadFiles = @(
    'Abrir-Antigravity.cmd',
    'Desinstalar.ps1',
    'AntigravityConsultas.ico',
    'VERSAO.txt'
)

function New-AntigravityShortcut {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ShortcutPath,
        [Parameter(Mandatory = $true)]
        [string]$TargetPath,
        [string]$Arguments = '',
        [string]$Description = '',
        [string]$WorkingDirectory = '',
        [string]$IconLocation = ''
    )

    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($ShortcutPath)
    $shortcut.TargetPath = $TargetPath
    $shortcut.Arguments = $Arguments
    $shortcut.Description = $Description
    $shortcut.WorkingDirectory = $WorkingDirectory
    $shortcut.WindowStyle = 1
    if ($IconLocation) {
        $shortcut.IconLocation = $IconLocation
    }
    $shortcut.Save()
}

try {
    if (-not $localAppData -or -not $desktopDirectory -or -not $programsDirectory) {
        throw 'O Windows nao informou as pastas do perfil atual.'
    }

    foreach ($ownedDirectory in @($installDirectory, $startMenuDirectory)) {
        if (Test-Path -LiteralPath $ownedDirectory -PathType Container) {
            $ownedItem = Get-Item -LiteralPath $ownedDirectory -Force
            if (($ownedItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw ('Pasta controlada por junction ou link simbolico: ' + $ownedDirectory)
            }
        }
    }

    foreach ($fileName in $payloadFiles) {
        $sourcePath = Join-Path $sourceDirectory $fileName
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
            throw ('Arquivo obrigatorio ausente: ' + $fileName)
        }
    }

    New-Item -ItemType Directory -Path $installDirectory -Force | Out-Null
    New-Item -ItemType Directory -Path $startMenuDirectory -Force | Out-Null

    foreach ($fileName in $payloadFiles) {
        $sourcePath = Join-Path $sourceDirectory $fileName
        $destinationPath = Join-Path $installDirectory $fileName
        Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
    }

    $launcherPath = Join-Path $installDirectory 'Abrir-Antigravity.cmd'
    $iconPath = Join-Path $installDirectory 'AntigravityConsultas.ico'
    $uninstallerPath = Join-Path $installDirectory 'Desinstalar.ps1'
    $powerShellPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'

    New-AntigravityShortcut `
        -ShortcutPath $desktopShortcut `
        -TargetPath $launcherPath `
        -Description 'Abrir o Antigravity Consultas no navegador padrao.' `
        -WorkingDirectory $installDirectory `
        -IconLocation ($iconPath + ',0')

    New-AntigravityShortcut `
        -ShortcutPath $startShortcut `
        -TargetPath $launcherPath `
        -Description 'Abrir o Antigravity Consultas no navegador padrao.' `
        -WorkingDirectory $installDirectory `
        -IconLocation ($iconPath + ',0')

    $uninstallArguments = '-NoLogo -NoProfile -ExecutionPolicy Bypass -File "' + $uninstallerPath + '"'
    New-AntigravityShortcut `
        -ShortcutPath $uninstallShortcut `
        -TargetPath $powerShellPath `
        -Arguments $uninstallArguments `
        -Description 'Remover os atalhos e arquivos locais do Antigravity Consultas.' `
        -WorkingDirectory $installDirectory `
        -IconLocation ($iconPath + ',0')

    Write-Host ''
    Write-Host 'OK: Antigravity Consultas instalado para o usuario atual.' -ForegroundColor Green
    Write-Host ('Pasta local: ' + $installDirectory)
    Write-Host 'Atalhos: Desktop e Menu Iniciar.'
    Write-Host 'Nenhum dado de paciente, credencial ou telemetria foi configurado.'
    exit 0
}
catch {
    Write-Error ('Falha na instalacao: ' + $_.Exception.Message)
    Write-Host 'Nenhuma permissao administrativa foi alterada.'
    Write-Host 'Execute DESINSTALAR.cmd para remover um estado parcial, se necessario.'
    exit 1
}
