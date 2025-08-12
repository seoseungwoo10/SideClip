// Simple validation script for SideClip extension
console.log('🔍 Validating SideClip Extension Structure...');

const fs = require('fs');
const path = require('path');

// Required files
const requiredFiles = [
    'manifest.json',
    'background.js',
    'content.js', 
    'sidepanel.html',
    'sidepanel.css',
    'sidepanel.js',
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png'
];

let allValid = true;

console.log('\n📋 Checking required files:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allValid = false;
});

// Validate manifest.json
console.log('\n📄 Validating manifest.json:');
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    const checks = [
        ['manifest_version', manifest.manifest_version === 3],
        ['name exists', !!manifest.name],
        ['version exists', !!manifest.version],
        ['permissions include storage', manifest.permissions?.includes('storage')],
        ['permissions include sidePanel', manifest.permissions?.includes('sidePanel')],
        ['background service_worker', !!manifest.background?.service_worker],
        ['content_scripts exists', !!manifest.content_scripts],
        ['side_panel configured', !!manifest.side_panel?.default_path],
        ['commands configured', !!manifest.commands]
    ];
    
    checks.forEach(([check, result]) => {
        const status = result ? '✅' : '❌';
        console.log(`${status} ${check}`);
        if (!result) allValid = false;
    });
    
} catch (error) {
    console.log('❌ Error parsing manifest.json:', error.message);
    allValid = false;
}

// Check file sizes (basic validation)
console.log('\n📊 File size check:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const size = stats.size;
        const sizeKB = (size / 1024).toFixed(1);
        
        if (size === 0) {
            console.log(`⚠️  ${file} is empty (0 bytes)`);
        } else if (size < 50 && file.endsWith('.png')) {
            console.log(`⚠️  ${file} might be placeholder (${sizeKB} KB)`);
        } else {
            console.log(`✅ ${file} (${sizeKB} KB)`);
        }
    }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 Extension structure is valid!');
    console.log('📝 Next steps:');
    console.log('   1. Replace placeholder icons with proper PNG files');
    console.log('   2. Load extension in Chrome (chrome://extensions/)'); 
    console.log('   3. Test all functionality');
    console.log('   4. See INSTALLATION.md for detailed setup');
} else {
    console.log('⚠️  Some issues found. Please fix before loading extension.');
}

console.log('='.repeat(50));
