$ErrorActionPreference = "Stop"

$outputDir = "output"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$inputFile = "CSharp.md"

if (-not (Test-Path $inputFile)) {
    Write-Error "File '$inputFile' not found."
    exit 1
}

$pandocArgs = @(
    "--metadata-file=metadata.yaml"

    "--pdf-engine=lualatex"
    "--from=markdown+lists_without_preceding_blankline"
    "--wrap=preserve"
    "--highlight-style=espresso"
    "--number-sections"
    "--table-of-contents"
    "--output=$outputDir/CSharp.pdf"
)

Write-Host "Compiling $inputFile..."
pandoc @pandocArgs $inputFile
Write-Host "Done -> $outputDir/CSharp.pdf"