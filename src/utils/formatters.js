export const formatName = (value) => {
    if (!value) return '';
    // Remove numbers and special characters (keep letters, spaces, and hyphens)
    // For Polish, we keep a-zA-Z and Polish characters.
    let cleanValue = value.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]/g, '');

    // Automatically first letter is capital others are small.
    return cleanValue.split(/([\s-])/).map(part => {
        if (!part || part.match(/[\s-]/)) return part; // keep separators
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join('');
};
