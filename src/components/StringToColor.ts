export function stringToColor(raw: string, saturation = 100, lightness = 75): string {
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = raw.charCodeAt(i) + ((hash << 6) - hash);
        hash = hash & hash;
    }
    return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`;
}