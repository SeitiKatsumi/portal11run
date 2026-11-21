param(
    [string] $Base = 'https://11run.com.br/global',
    [string] $User = 'admin11run'
)
$ErrorActionPreference = 'Stop'
if ($Base -ne 'https://11run.com.br/global') { throw 'Este script atua apenas na prévia /global.' }
if (!$env:PILOT_ACCESS_PASSWORD -or !$env:PILOT_WP_PASSWORD) { throw 'Defina PILOT_ACCESS_PASSWORD e PILOT_WP_PASSWORD temporariamente.' }

$source = $PSScriptRoot
$packageDir = New-Item -ItemType Directory -Path (Join-Path ([IO.Path]::GetTempPath()) ('11run-editorial-' + [guid]::NewGuid().ToString('N')))
$themeDir = New-Item -ItemType Directory -Path (Join-Path $packageDir.FullName 'onze-portal')
$pluginDir = New-Item -ItemType Directory -Path (Join-Path $packageDir.FullName '11run-migration')
$payloadDir = New-Item -ItemType Directory -Path (Join-Path $pluginDir.FullName 'generated')
Copy-Item -LiteralPath @("$source/theme/functions.php","$source/theme/index.php","$source/theme/style.css") -Destination $themeDir.FullName
Copy-Item -LiteralPath @("$source/migration/import.php","$source/migration/modules.php","$source/migration/portal.js","$source/generated/legacy.css") -Destination $pluginDir.FullName
Copy-Item -LiteralPath "$source/generated/content.json" -Destination $payloadDir.FullName
$themeZip = Join-Path $packageDir.FullName 'onze-portal.zip'
$pluginZip = Join-Path $packageDir.FullName '11run-migration.zip'
Compress-Archive -LiteralPath $themeDir.FullName -DestinationPath $themeZip
Compress-Archive -LiteralPath $pluginDir.FullName -DestinationPath $pluginZip

$credential = [pscredential]::new('previa', (ConvertTo-SecureString $env:PILOT_ACCESS_PASSWORD -AsPlainText -Force))
$session = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
function Invoke-Pilot([string] $Path, [hashtable] $Extra = @{}) {
    return Invoke-WebRequest -Uri ($Base + $Path) -Authentication Basic -Credential $credential -WebSession $session -SkipHttpErrorCheck -TimeoutSec 45 @Extra
}
function Get-Field([string] $Html, [string] $Name) {
    $pattern = '<input[^>]*\bname=["'']' + [regex]::Escape($Name) + '["''][^>]*\bvalue=["'']([^"'']*)["'']'
    $match = [regex]::Match($Html, $pattern, 'IgnoreCase')
    if (!$match.Success) { throw "Campo esperado não encontrado: $Name." }
    return [Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
}
function Install-WordPressZip([string] $Kind, [string] $Page, [string] $Zip) {
    $upload = Invoke-Pilot $Page
    $form = [regex]::Matches($upload.Content, '<form\b.*?</form>', 'Singleline') |
        Where-Object { $_.Value.Contains("upload-$Kind") -and $_.Value.Contains($Kind + 'zip') } |
        Select-Object -First 1
    if (!$form) { throw "Formulário de instalação de $Kind indisponível." }
    $values = @{
        _wpnonce = Get-Field $form.Value '_wpnonce'
        _wp_http_referer = '/global' + $Page
    }
    $values[$Kind + 'zip'] = Get-Item -LiteralPath $Zip
    $result = Invoke-Pilot "/wp-admin/update.php?action=upload-$Kind" @{ Method = 'Post'; Form = $values }
    $replace = [regex]::Matches($result.Content, 'href=["'']([^"'']+)["'']') |
        ForEach-Object { [Net.WebUtility]::HtmlDecode($_.Groups[1].Value) } |
        Where-Object { $_ -match "update\.php\?.*action=upload-$Kind" -and $_ -match "[?&]overwrite=update-$Kind(?:&|$)" } |
        Select-Object -First 1
    if ($replace) {
        $target = [uri]::new(([uri] "$Base/wp-admin/update.php"), $replace)
        if ($target.Scheme -ne 'https' -or $target.Host -ne '11run.com.br' -or $target.AbsolutePath -ne '/global/wp-admin/update.php') {
            throw 'Destino de atualização inesperado.'
        }
        $result = Invoke-Pilot ('/wp-admin/update.php' + $target.Query)
    }
    if ($result.StatusCode -ne 200 -or $result.Content -match 'Installation failed|Já existe|Destination folder already exists|error installing') {
        throw "O WordPress recusou o pacote $Kind (HTTP $($result.StatusCode))."
    }
    return $result.Content
}

$null = Invoke-Pilot '/wp-login.php'
$null = Invoke-Pilot '/wp-login.php' @{ Method = 'Post'; Body = @{
    log = $User; pwd = $env:PILOT_WP_PASSWORD; redirect_to = "$Base/wp-admin/"; testcookie = '1'
} }
$panel = Invoke-Pilot '/wp-admin/plugins.php'
if ($panel.StatusCode -ne 200 -or $panel.Content -notmatch 'plugins\.php\?') {
    throw 'Não foi possível autenticar com o WordPress.'
}

$themePanel = Invoke-Pilot '/wp-admin/themes.php'
$themeVersion = [regex]::Match((Get-Content -Raw -LiteralPath "$source/theme/style.css"), 'Version:\s*([\d.]+)').Groups[1].Value
$installedTheme = [regex]::Match($themePanel.Content, '"id":"onze-portal"[^}]*"version":"([^"]+)"')
if (!$installedTheme.Success -or $installedTheme.Groups[1].Value -ne $themeVersion) {
    $null = Install-WordPressZip 'theme' '/wp-admin/theme-install.php?upload' $themeZip
}
$expectedVersion = [regex]::Match((Get-Content -Raw -LiteralPath "$source/migration/import.php"), 'Version:\s*([\d.]+)').Groups[1].Value
$installed = [regex]::Match($panel.Content, '<tr\b[^>]*data-slug="11run-migration".*?</tr>', 'Singleline')
if (!$installed.Success -or !$installed.Value.Contains($expectedVersion)) {
    $null = Install-WordPressZip 'plugin' '/wp-admin/plugin-install.php?tab=upload' $pluginZip
}

$panel = Invoke-Pilot '/wp-admin/plugins.php'
$activation = [regex]::Matches($panel.Content, 'href=["'']([^"'']+)["'']') |
    ForEach-Object { [Net.WebUtility]::HtmlDecode($_.Groups[1].Value) } |
    Where-Object { $_ -match 'plugins\.php\?' -and $_ -match '[?&]action=activate&' -and $_ -match 'plugin=11run-migration(?:%2F|/)import\.php' } |
    Select-Object -First 1
if ($activation) {
    $target = [uri]::new(([uri] "$Base/wp-admin/plugins.php"), $activation)
    if ($target.Scheme -ne 'https' -or $target.Host -ne '11run.com.br' -or $target.AbsolutePath -ne '/global/wp-admin/plugins.php') {
        throw 'Destino de ativação inesperado.'
    }
    $null = Invoke-Pilot ('/wp-admin/plugins.php' + $target.Query)
}

$offset = 0
do {
    $page = Invoke-Pilot "/wp-admin/tools.php?page=onze-migration&offset=$offset"
    if ($page.Content -notmatch 'Importar próximo lote') { throw 'A ferramenta de migração não está ativa.' }
    $nonce = Get-Field $page.Content '_wpnonce'
    $response = Invoke-Pilot '/wp-admin/admin-post.php' @{ Method = 'Post'; Body = @{
        action = 'onze_migrate'; _wpnonce = $nonce; offset = $offset; json = '1'
    } }
    $batch = $response.Content | ConvertFrom-Json
    if (!$batch.success) { throw "Falha no lote $($offset): $($batch.data.message)" }
    Write-Output ('Lote: ' + ($batch.data | ConvertTo-Json -Compress))
    if ($batch.data.next -le $offset -and $offset -lt $batch.data.total) { throw 'A importação deixou de avançar.' }
    $offset = [int] $batch.data.next
} while ($offset -lt $batch.data.total)
