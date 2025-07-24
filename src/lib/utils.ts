export function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    
    if (!match) {
        throw new Error(`Invalid duration format: ${durationStr}. Expected format: <number><unit> (e.g., 1s, 5m, 1h)`);
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
        case 'ms':
            return value;
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        default:
            throw new Error(`Unsupported time unit: ${unit}`);
    }
}

export function formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    
    if (hours > 0) {
        return `${hours}h${minutes}m${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export function parsePublishedDate(dateString: string | undefined): Date | null {
    if (!dateString) {
        return null;
    }
    
    try {
        // Try parsing the date string
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date format: ${dateString}`);
            return null;
        }
        
        return date;
    } catch (error) {
        console.warn(`Error parsing date: ${dateString}`, error);
        return null;
    }
}