/*****************************/
/* Moon phase calculations */
/*****************************/

const SYNODIC_MONTH_DAYS = 29.53058867; // Average synodic month in days

// Leeway around phase boundaries (in days). The moon phase model is simplified, so
// we intentionally allow a small window where people would still perceive a "new"
// or "full" moon even if the calculated phase is slightly off.
const NEW_MOON_LEEWAY_DAYS = 1.5;
const FULL_MOON_LEEWAY_DAYS = 2.1;

// Calculates the moon phase (0 = new moon, 0.5 = full moon, 1 = new moon again)
// Simplified calculation based on days since a known new moon
export function getMoonPhase(date) {
    // Known new moon reference: January 11, 2024 11:57 UTC
    const referenceDate = new Date(Date.UTC(2024, 0, 11, 11, 57));
    
    // Calculate days difference (can be negative if date is before reference)
    const daysDiff = (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Get phase in 0-1 range using modulo
    // Handle negative values by adding synodicMonth before modulo
    let phase = daysDiff % SYNODIC_MONTH_DAYS;
    if (phase < 0) {
        phase += SYNODIC_MONTH_DAYS;
    }
    
    // Normalize to 0-1
    const normalizedPhase = phase / SYNODIC_MONTH_DAYS;
    
    return normalizedPhase;
}

// Gets the angle (in radians) for moon position relative to sun
// 0 = same side as sun (new moon), π = opposite side (full moon)
export function getMoonPhaseAngle(date) {
    const phase = getMoonPhase(date);
    // Convert phase (0-1) to angle (0-2π)
    // New moon (0) = 0, Full moon (0.5) = π
    return phase * 2 * Math.PI;
}

// Gets a human-readable name for the moon phase
export function getMoonPhaseName(date) {
    const phase = getMoonPhase(date);
    
    const newMoonThreshold = NEW_MOON_LEEWAY_DAYS / SYNODIC_MONTH_DAYS;
    const fullMoonThreshold = FULL_MOON_LEEWAY_DAYS / SYNODIC_MONTH_DAYS;

    // New moon is the phase closest to 0 (or 1 when wrapping).
    const distanceToNewMoon = Math.min(phase, 1 - phase);
    if (distanceToNewMoon <= newMoonThreshold) {
        return 'New Moon';
    }

    // Full moon is the phase closest to 0.5.
    const distanceToFullMoon = Math.abs(phase - 0.5);
    if (distanceToFullMoon <= fullMoonThreshold) {
        return 'Full Moon';
    }

    if (phase < 0.22) {
        return 'Waxing Crescent';
    } else if (phase < 0.28) {
        return 'First Quarter';
    } else if (phase < 0.47) {
        return 'Waxing Gibbous';
    } else if (phase < 0.72) {
        return 'Waning Gibbous';
    } else if (phase < 0.78) {
        return 'Last Quarter';
    } else {
        return 'Waning Crescent';
    }
}
