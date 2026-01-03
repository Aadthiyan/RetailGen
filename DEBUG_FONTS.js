// DEBUG: Check what fonts are actually loaded
// Run this in browser console:

// 1. Check all loaded fonts
console.log('All loaded fonts:');
document.fonts.forEach(font => {
    console.log(`- ${font.family} (${font.style}, ${font.weight})`);
});

// 2. Check if specific font is loaded
const checkFont = async (fontName) => {
    const loaded = await document.fonts.check(`40px "${fontName}"`);
    console.log(`Font "${fontName}" loaded:`, loaded);
};

// Test fonts
checkFont('Oswald');
checkFont('Anton');
checkFont('Bebas Neue');
checkFont('Inter');

// 3. Check computed style of dropdown
const dropdown = document.querySelector('select');
if (dropdown) {
    const style = window.getComputedStyle(dropdown);
    console.log('Dropdown font-family:', style.fontFamily);
}

// 4. Try to load font manually
document.fonts.load('40px "Oswald"').then(() => {
    console.log('Oswald loaded manually');
}).catch(err => {
    console.error('Failed to load Oswald:', err);
});
