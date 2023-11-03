# Set the source and destination directories
$sourceDirectory  = (Get-Location).Path
$destinationDirectory = "U:\DAG\STEFANO\Simulux"

# Use Copy-Item to sync the directories
Copy-Item -Path $sourceDirectory -Destination $destinationDirectory -Recurse -Force 
