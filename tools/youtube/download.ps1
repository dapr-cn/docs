$config = (Get-Content "config.json" | ConvertFrom-Json)

$config

$config.video | ForEach-Object {
    $v = $_
    $youtubeId = $v.source
    $url = "https://www.youtube.com/watch?v=$youtubeId"
    Write-Output $url
    youtube-dl $url
}