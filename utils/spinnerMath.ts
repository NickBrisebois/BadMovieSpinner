function getMovieAngles(
    globalIndex: number,
    anglePerMovie: number,
): { startAngle: number; endAngle: number } {
    const startAngle = globalIndex * anglePerMovie
    const endAngle = (globalIndex + 1) * anglePerMovie
    return { startAngle, endAngle }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return [
        'M',
        cx,
        cy,
        'L',
        start.x,
        start.y,
        'A',
        r,
        r,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
        'Z',
    ].join(' ')
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians),
    }
}

function getTextX(startAngle: number, endAngle: number, size: number) {
    const a = (startAngle + endAngle) / 2 - 90
    return size / 2 + (size / 3.2) * Math.cos((a * Math.PI) / 180)
}

function getTextY(startAngle: number, endAngle: number, size: number) {
    const a = (startAngle + endAngle) / 2 - 90
    return size / 2 + (size / 3.2) * Math.sin((a * Math.PI) / 180)
}

const personColours = [
    '#a94fca', // Purple
    '#ff6b9d', // Pink
    '#4ecdc4', // Teal
    '#45b7d1', // Blue
    '#f9ca24', // Yellow
    '#f0932b', // Orange
    '#eb4d4b', // Red
    '#6c5ce7', // Violet
]

function getPersonColour(personName: string, people: string[]): string {
    const personIndex = people.indexOf(personName)
    return personColours[personIndex % personColours.length]
}

function getPersonLabelX(personIndex: number, size: number, people: string[]): number {
    const angle = ((personIndex + 0.5) * (360 / people.length) * Math.PI) / 180
    return size / 2 + (size / 2 + 20) * Math.cos(angle)
}

function getPersonLabelY(personIndex: number, size: number, people: string[]): number {
    const angle = ((personIndex + 0.5) * (360 / people.length) * Math.PI) / 180
    return size / 2 + (size / 2 + 20) * Math.sin(angle)
}

function getPersonLabelRotation(personIndex: number, people: string[]): number {
    const angle = (personIndex + 0.5) * (360 / people.length)
    return angle > 90 && angle < 270 ? angle + 180 : angle
}

export {
    getMovieAngles,
    describeArc,
    getTextX,
    getTextY,
    getPersonColour,
    getPersonLabelX,
    getPersonLabelY,
    getPersonLabelRotation,
    polarToCartesian,
}
