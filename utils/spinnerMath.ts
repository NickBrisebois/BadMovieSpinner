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
    '#ff0080', // Hot Pink
    '#00ff80', // Bright Green
    '#8000ff', // Electric Purple
    '#ff8000', // Bright Orange
    '#0080ff', // Electric Blue
    '#ffff00', // Bright Yellow
    '#ff4040', // Neon Red
    '#00ffff', // Cyan/Aqua
    '#ff80ff', // Bright Magenta
    '#80ff00', // Chartreuse
    '#ff0040', // Deep Pink
    '#4080ff', // Sky Blue
    '#ff8040', // Coral
    '#8040ff', // Blue Purple
    '#40ff80', // Spring Green
    '#ffff80', // Light Yellow
    '#ff4000', // Red Orange
    '#0040ff', // Pure Blue
    '#80ff80', // Light Green
    '#ff00ff', // Pure Magenta
]

function getPersonColour(personName: string, people: string[]): string {
    const personIndex = people.indexOf(personName)
    return personColours[personIndex % personColours.length]
}

export { getMovieAngles, describeArc, getTextX, getTextY, getPersonColour, polarToCartesian }
