export const FONT_LIBRARY = {
    // TOP 5 POSTER FONTS (Most Recommended)
    posterFonts: [
        { name: 'Bebas Neue', value: 'Bebas Neue', category: 'display', rating: 5, tailwind: 'font-bebas' },
        { name: 'Anton', value: 'Anton', category: 'display', rating: 5, tailwind: 'font-anton' },
        { name: 'Oswald', value: 'Oswald', category: 'display', rating: 5, tailwind: 'font-oswald' },
        { name: 'Montserrat', value: 'Montserrat', category: 'sans-serif', rating: 4, tailwind: 'font-montserrat' },
        { name: 'Poppins', value: 'Poppins', category: 'sans-serif', rating: 4, tailwind: 'font-poppins' },
    ],

    // All Sans-Serif Fonts
    sansSerif: [
        { name: 'Inter', value: 'Inter', category: 'sans-serif', tailwind: 'font-inter' },
        { name: 'Open Sans', value: 'Open Sans', category: 'sans-serif', tailwind: 'font-opensans' },
        { name: 'Source Sans 3', value: 'Source Sans 3', category: 'sans-serif', tailwind: 'font-sourcesans' },
        { name: 'Roboto', value: 'Roboto', category: 'sans-serif', tailwind: 'font-roboto' },
        { name: 'Ubuntu', value: 'Ubuntu', category: 'sans-serif', tailwind: 'font-ubuntu' },
        { name: 'Outfit', value: 'Outfit', category: 'sans-serif', tailwind: 'font-outfit' },
        { name: 'Montserrat', value: 'Montserrat', category: 'sans-serif', rating: 4, tailwind: 'font-montserrat' },
        { name: 'Poppins', value: 'Poppins', category: 'sans-serif', rating: 4, tailwind: 'font-poppins' },
        { name: 'Raleway', value: 'Raleway', category: 'sans-serif', tailwind: 'font-raleway' },
    ],

    // Display Fonts (Best for Posters)
    display: [
        { name: 'Bebas Neue ⭐', value: 'Bebas Neue', category: 'display', rating: 5, tailwind: 'font-bebas' },
        { name: 'Anton ⭐', value: 'Anton', category: 'display', rating: 5, tailwind: 'font-anton' },
        { name: 'Oswald ⭐', value: 'Oswald', category: 'display', rating: 5, tailwind: 'font-oswald' },
        { name: 'Righteous', value: 'Righteous', category: 'display', tailwind: 'font-righteous' },
        { name: 'Archivo Black', value: 'Archivo Black', category: 'display', tailwind: 'font-archivoblack' },
        { name: 'Russo One', value: 'Russo One', category: 'display', tailwind: 'font-russoone' },
        { name: 'Barlow Condensed', value: 'Barlow Condensed', category: 'display', tailwind: 'font-barlowcondensed' },
        { name: 'Fjalla One', value: 'Fjalla One', category: 'display', tailwind: 'font-fjallaone' },
        { name: 'Bangers', value: 'Bangers', category: 'display', tailwind: 'font-bangers' },
    ],

    // Serif Fonts
    serif: [
        { name: 'Playfair Display', value: 'Playfair Display', category: 'serif', tailwind: 'font-playfair' },
        { name: 'Lora', value: 'Lora', category: 'serif', tailwind: 'font-lora' },
        { name: 'Merriweather', value: 'Merriweather', category: 'serif', tailwind: 'font-merriweather' },
    ],

    // Script/Handwriting Fonts
    script: [
        { name: 'Dancing Script', value: 'Dancing Script', category: 'script', tailwind: 'font-dancing' },
        { name: 'Pacifico', value: 'Pacifico', category: 'script', tailwind: 'font-pacifico' },
        { name: 'Lobster', value: 'Lobster', category: 'script', tailwind: 'font-lobster' },
        { name: 'Permanent Marker', value: 'Permanent Marker', category: 'script', tailwind: 'font-permanentmarker' },
    ],
};

// Get all fonts in a flat array
export const ALL_FONTS = [
    ...FONT_LIBRARY.sansSerif,
    ...FONT_LIBRARY.display,
    ...FONT_LIBRARY.serif,
    ...FONT_LIBRARY.script,
].filter((font, index, self) =>
    index === self.findIndex((f) => f.value === font.value)
);

// Get recommended poster fonts
export const RECOMMENDED_POSTER_FONTS = FONT_LIBRARY.posterFonts;

// Font categories for dropdown
export const FONT_CATEGORIES = [
    { id: 'recommended', name: '⭐ Recommended for Posters', fonts: FONT_LIBRARY.posterFonts },
    { id: 'display', name: '🎯 Display (Headlines)', fonts: FONT_LIBRARY.display },
    { id: 'sans-serif', name: 'Sans-Serif (Body Text)', fonts: FONT_LIBRARY.sansSerif },
    { id: 'serif', name: 'Serif (Classic)', fonts: FONT_LIBRARY.serif },
    { id: 'script', name: '✍️ Script (Decorative)', fonts: FONT_LIBRARY.script },
];
