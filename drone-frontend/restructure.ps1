# CropMonitor Frontend - Automated Restructuring Script
# This script automates the folder restructuring process
# Run from: drone-frontend/

Write-Host "=== CropMonitor Folder Restructuring Script ===" -ForegroundColor Cyan
Write-Host "This script will reorganize your React project structure" -ForegroundColor Cyan
Write-Host ""

# Function to create directory if it doesn't exist
function Create-DirectoryIfNotExists {
    param($Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
        Write-Host "✓ Created: $Path" -ForegroundColor Green
    }
}

# Function to move file
function Move-FileIfExists {
    param($Source, $Destination)
    if (Test-Path $Source) {
        $destDir = Split-Path $Destination -Parent
        Create-DirectoryIfNotExists $destDir
        Move-Item $Source $Destination -Force
        Write-Host "✓ Moved: $Source → $Destination" -ForegroundColor Green
    } else {
        Write-Host "⚠ Skipped (not found): $Source" -ForegroundColor Yellow
    }
}

# Function to create index.js file
function Create-IndexFile {
    param($Path, $ExportName)
    $content = "export { default } from './$ExportName';"
    Set-Content -Path $Path -Value $content
    Write-Host "✓ Created index: $Path" -ForegroundColor Green
}

# Confirm before proceeding
Write-Host "⚠️  WARNING: This will move files and create new folders" -ForegroundColor Yellow
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "  1. Committed your current code to git" -ForegroundColor Yellow
Write-Host "  2. Created a backup of src/ folder" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=== Phase 1: Creating Folder Structure ===" -ForegroundColor Cyan

# Create assets folders
Create-DirectoryIfNotExists "src/assets/images"
Create-DirectoryIfNotExists "src/assets/icons"
Create-DirectoryIfNotExists "src/assets/styles"

# Create component folders
Create-DirectoryIfNotExists "src/components/layout/Navbar"
Create-DirectoryIfNotExists "src/components/layout/Sidebar"
Create-DirectoryIfNotExists "src/components/ui/Logo"
Create-DirectoryIfNotExists "src/components/prediction/ImageUpload"
Create-DirectoryIfNotExists "src/components/prediction/PredictionCard"
Create-DirectoryIfNotExists "src/components/reports/ReportTable"
Create-DirectoryIfNotExists "src/components/auth/DemoLoginCard"

# Create page folders
Create-DirectoryIfNotExists "src/pages/auth/Login"
Create-DirectoryIfNotExists "src/pages/auth/Register"
Create-DirectoryIfNotExists "src/pages/dashboard/Dashboard"
Create-DirectoryIfNotExists "src/pages/dashboard/Analytics"
Create-DirectoryIfNotExists "src/pages/upload/UploadPage"
Create-DirectoryIfNotExists "src/pages/reports/Reports"
Create-DirectoryIfNotExists "src/pages/admin/AdminPanel"

Write-Host ""
Write-Host "=== Phase 2: Moving Components ===" -ForegroundColor Cyan

# Move layout components
Move-FileIfExists "src/components/Navbar.jsx" "src/components/layout/Navbar/Navbar.jsx"
Move-FileIfExists "src/components/Sidebar.jsx" "src/components/layout/Sidebar/Sidebar.jsx"

# Move UI components
Move-FileIfExists "src/components/Logo.jsx" "src/components/ui/Logo/Logo.jsx"

# Move prediction components
Move-FileIfExists "src/components/ImageUpload.jsx" "src/components/prediction/ImageUpload/ImageUpload.jsx"
Move-FileIfExists "src/components/PredictionCard.jsx" "src/components/prediction/PredictionCard/PredictionCard.jsx"

# Move reports components
Move-FileIfExists "src/components/ReportTable.jsx" "src/components/reports/ReportTable/ReportTable.jsx"

# Move auth components
Move-FileIfExists "src/components/DemoLoginCard.jsx" "src/components/auth/DemoLoginCard/DemoLoginCard.jsx"

Write-Host ""
Write-Host "=== Phase 3: Moving Pages ===" -ForegroundColor Cyan

# Move auth pages
Move-FileIfExists "src/pages/Login.jsx" "src/pages/auth/Login/Login.jsx"
Move-FileIfExists "src/pages/Register.jsx" "src/pages/auth/Register/Register.jsx"

# Move dashboard pages
Move-FileIfExists "src/pages/Dashboard.jsx" "src/pages/dashboard/Dashboard/Dashboard.jsx"
Move-FileIfExists "src/pages/Analytics.jsx" "src/pages/dashboard/Analytics/Analytics.jsx"

# Move upload pages
Move-FileIfExists "src/pages/UploadPage.jsx" "src/pages/upload/UploadPage/UploadPage.jsx"

# Move reports pages
Move-FileIfExists "src/pages/Reports.jsx" "src/pages/reports/Reports/Reports.jsx"

# Move admin pages
Move-FileIfExists "src/pages/AdminPanel.jsx" "src/pages/admin/AdminPanel/AdminPanel.jsx"

Write-Host ""
Write-Host "=== Phase 4: Moving Assets ===" -ForegroundColor Cyan

# Move styles
Move-FileIfExists "src/index.css" "src/assets/styles/index.css"

Write-Host ""
Write-Host "=== Phase 5: Creating Index Files ===" -ForegroundColor Cyan

# Create component index files
Create-IndexFile "src/components/layout/Navbar/index.js" "Navbar"
Create-IndexFile "src/components/layout/Sidebar/index.js" "Sidebar"
Create-IndexFile "src/components/ui/Logo/index.js" "Logo"
Create-IndexFile "src/components/prediction/ImageUpload/index.js" "ImageUpload"
Create-IndexFile "src/components/prediction/PredictionCard/index.js" "PredictionCard"
Create-IndexFile "src/components/reports/ReportTable/index.js" "ReportTable"
Create-IndexFile "src/components/auth/DemoLoginCard/index.js" "DemoLoginCard"

# Create barrel exports for component categories
Set-Content -Path "src/components/layout/index.js" -Value @"
export { default as Navbar } from './Navbar';
export { default as Sidebar } from './Sidebar';
"@
Write-Host "✓ Created: src/components/layout/index.js" -ForegroundColor Green

Set-Content -Path "src/components/ui/index.js" -Value @"
export { default as Logo } from './Logo';
"@
Write-Host "✓ Created: src/components/ui/index.js" -ForegroundColor Green

Set-Content -Path "src/components/prediction/index.js" -Value @"
export { default as ImageUpload } from './ImageUpload';
export { default as PredictionCard } from './PredictionCard';
"@
Write-Host "✓ Created: src/components/prediction/index.js" -ForegroundColor Green

Set-Content -Path "src/components/reports/index.js" -Value @"
export { default as ReportTable } from './ReportTable';
"@
Write-Host "✓ Created: src/components/reports/index.js" -ForegroundColor Green

Set-Content -Path "src/components/auth/index.js" -Value @"
export { default as DemoLoginCard } from './DemoLoginCard';
"@
Write-Host "✓ Created: src/components/auth/index.js" -ForegroundColor Green

# Create page index files
Create-IndexFile "src/pages/auth/Login/index.js" "Login"
Create-IndexFile "src/pages/auth/Register/index.js" "Register"
Create-IndexFile "src/pages/dashboard/Dashboard/index.js" "Dashboard"
Create-IndexFile "src/pages/dashboard/Analytics/index.js" "Analytics"
Create-IndexFile "src/pages/upload/UploadPage/index.js" "UploadPage"
Create-IndexFile "src/pages/reports/Reports/index.js" "Reports"
Create-IndexFile "src/pages/admin/AdminPanel/index.js" "AdminPanel"

# Create barrel exports for page categories
Set-Content -Path "src/pages/auth/index.js" -Value @"
export { default as Login } from './Login';
export { default as Register } from './Register';
"@
Write-Host "✓ Created: src/pages/auth/index.js" -ForegroundColor Green

Set-Content -Path "src/pages/dashboard/index.js" -Value @"
export { default as Dashboard } from './Dashboard';
export { default as Analytics } from './Analytics';
"@
Write-Host "✓ Created: src/pages/dashboard/index.js" -ForegroundColor Green

Set-Content -Path "src/pages/upload/index.js" -Value @"
export { default as UploadPage } from './UploadPage';
"@
Write-Host "✓ Created: src/pages/upload/index.js" -ForegroundColor Green

Set-Content -Path "src/pages/reports/index.js" -Value @"
export { default as Reports } from './Reports';
"@
Write-Host "✓ Created: src/pages/reports/index.js" -ForegroundColor Green

Set-Content -Path "src/pages/admin/index.js" -Value @"
export { default as AdminPanel } from './AdminPanel';
"@
Write-Host "✓ Created: src/pages/admin/index.js" -ForegroundColor Green

# Create main pages index
Set-Content -Path "src/pages/index.js" -Value @"
// Auth pages
export * from './auth';

// Dashboard pages
export * from './dashboard';

// Upload pages
export * from './upload';

// Reports pages
export * from './reports';

// Admin pages
export * from './admin';
"@
Write-Host "✓ Created: src/pages/index.js" -ForegroundColor Green

Write-Host ""
Write-Host "=== Phase 6: Updating Import Statements ===" -ForegroundColor Cyan

# Get all .jsx and .js files in src (excluding node_modules)
$files = Get-ChildItem -Path "src" -Include "*.jsx","*.js" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }

$updateCount = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Update component imports - handle various relative path depths
    $content = $content -replace "from '\.\./components/Navbar'", "from '../components/layout/Navbar'"
    $content = $content -replace "from '\.\./\.\./components/Navbar'", "from '../../components/layout/Navbar'"
    $content = $content -replace "from '\./components/Navbar'", "from './components/layout/Navbar'"
    
    $content = $content -replace "from '\.\./components/Sidebar'", "from '../components/layout/Sidebar'"
    $content = $content -replace "from '\.\./\.\./components/Sidebar'", "from '../../components/layout/Sidebar'"
    $content = $content -replace "from '\./components/Sidebar'", "from './components/layout/Sidebar'"
    
    $content = $content -replace "from '\.\./components/Logo'", "from '../components/ui/Logo'"
    $content = $content -replace "from '\.\./\.\./components/Logo'", "from '../../components/ui/Logo'"
    $content = $content -replace "from '\./components/Logo'", "from './components/ui/Logo'"
    
    $content = $content -replace "from '\.\./components/ImageUpload'", "from '../components/prediction/ImageUpload'"
    $content = $content -replace "from '\.\./\.\./components/ImageUpload'", "from '../../components/prediction/ImageUpload'"
    
    $content = $content -replace "from '\.\./components/PredictionCard'", "from '../components/prediction/PredictionCard'"
    $content = $content -replace "from '\.\./\.\./components/PredictionCard'", "from '../../components/prediction/PredictionCard'"
    
    $content = $content -replace "from '\.\./components/ReportTable'", "from '../components/reports/ReportTable'"
    $content = $content -replace "from '\.\./\.\./components/ReportTable'", "from '../../components/reports/ReportTable'"
    
    $content = $content -replace "from '\.\./components/DemoLoginCard'", "from '../components/auth/DemoLoginCard'"
    $content = $content -replace "from '\.\./\.\./components/DemoLoginCard'", "from '../../components/auth/DemoLoginCard'"
    
    # Update page imports
    $content = $content -replace "from '\.\./pages/Login'", "from '../pages/auth/Login'"
    $content = $content -replace "from '\.\./pages/Register'", "from '../pages/auth/Register'"
    $content = $content -replace "from '\.\./pages/Dashboard'", "from '../pages/dashboard/Dashboard'"
    $content = $content -replace "from '\.\./pages/Analytics'", "from '../pages/dashboard/Analytics'"
    $content = $content -replace "from '\.\./pages/UploadPage'", "from '../pages/upload/UploadPage'"
    $content = $content -replace "from '\.\./pages/Reports'", "from '../pages/reports/Reports'"
    $content = $content -replace "from '\.\./pages/AdminPanel'", "from '../pages/admin/AdminPanel'"
    
    # Update CSS imports
    $content = $content -replace "import '\./index\.css'", "import './assets/styles/index.css'"
    
    # Save if changed
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content
        Write-Host "✓ Updated imports in: $($file.Name)" -ForegroundColor Green
        $updateCount++
    }
}

Write-Host "Updated $updateCount files" -ForegroundColor Green

Write-Host ""
Write-Host "=== Phase 7: Cleanup Old Folders ===" -ForegroundColor Cyan

# Remove old empty folders if they exist and are empty
$foldersToCheck = @(
    "src/components",
    "src/pages"
)

foreach ($folder in $foldersToCheck) {
    if (Test-Path $folder) {
        $items = Get-ChildItem $folder -Recurse -File
        if ($items.Count -eq 0) {
            # Folder is empty or only has empty subfolders
            Write-Host "Note: Old $folder folder structure can be removed manually if needed" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== ✅ RESTRUCTURING COMPLETE! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the changes" -ForegroundColor White
Write-Host "  2. Run: npm start" -ForegroundColor White
Write-Host "  3. Test all functionality" -ForegroundColor White
Write-Host "  4. Commit changes if everything works" -ForegroundColor White
Write-Host ""
Write-Host "If something broke:" -ForegroundColor Yellow
Write-Host "  1. Check the console for import errors" -ForegroundColor White
Write-Host "  2. Manually fix remaining import paths" -ForegroundColor White
Write-Host "  3. Refer to FOLDER_RESTRUCTURE_GUIDE.md for details" -ForegroundColor White
Write-Host ""
