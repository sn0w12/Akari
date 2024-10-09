export function compareVersions(str1: string, str2: string): boolean {
    // Replace "-" with "." in both strings
    const num1 = parseFloat(str1.replace(/-/g, "."));
    const num2 = parseFloat(str2.replace(/-/g, "."));

    // Check if both values are integers
    if (Number.isInteger(num1) && Number.isInteger(num2)) {
        // Check if the first value is 1 larger than the second
        return num1 === num2 + 1;
    }

    // Check for ".5" decimal case, round down and compare
    const floorNum1 = Math.floor(num1);
    const floorNum2 = Math.floor(num2);

    if (num1 % 1 === 0.5 && num2 % 1 === 0.5) {
        // Compare after rounding down
        return floorNum1 === floorNum2 + 1;
    }

    // Otherwise, check if the first value is 0.1 larger than the second
    const diff = num1 - num2;
    return diff === 0.1;
}
