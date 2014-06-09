function isValidRatio(fgColor, bgColor, minRatio) {
    return minRatio < getContrastRatio(fgColor, bgColor);
}

function getContrastRatio(fgColor, bgColor) {
    var fgLuminosity = getLuminosity(fgColor);
    var bgLuminosity = getLuminosity(bgColor);
    if (fgLuminosity > bgLuminosity) {
        return computeContrast(fgLuminosity, bgLuminosity);
    } else {
        return computeContrast(bgLuminosity, fgLuminosity);
    }
};

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function getLuminosity(color) {
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(hexToRgb(color));
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    var luminosity =
        getComposantValue(red) * 0.2126
        + getComposantValue(green) * 0.7152
        + getComposantValue(blue) * 0.0722;
    return luminosity;
}

function getComposantValue(composant) {
    var rsgb = composant / 255;
    if (rsgb <= 0.03928) {
        return rsgb / 12.92;
    } else {
        return Math.pow(((rsgb + 0.055) / 1.055), 2.4);
    }
}

function computeContrast(lighter, darker) {
    return ((lighter + 0.05) / (darker + 0.05));
}

exports.getContrastRatio = getContrastRatio;
exports.isValidRatio = isValidRatio;