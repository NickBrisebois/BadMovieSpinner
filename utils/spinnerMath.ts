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

export { getMovieAngles, describeArc, getTextX, getTextY }
