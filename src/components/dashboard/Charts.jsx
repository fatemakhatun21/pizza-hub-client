const COLORS = ["#C93425", "#F0A64A", "#6B625C", "#7CAE7A", "#B06AB3"];

function normalize(data = []) {
    return data
        .map((item) => ({
            label: item.label ?? "",
            value: Number(item.value) || 0,
        }))
        .slice(0, 12);
}

function EmptyChart() {
    return (
        <div className="flex h-44 items-center justify-center rounded-xl bg-[#FFF8ED] text-sm text-[#6B625C]">
            No data yet
        </div>
    );
}

export function BarChart({ data, title }) {
    const items = normalize(data);

    if (!items.length) return <EmptyChart />;

    const max = Math.max(...items.map((item) => item.value), 1);
    const width = 560;
    const height = 180;
    const padding = { top: 14, right: 12, bottom: 34, left: 34 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const step = plotWidth / items.length;
    const barWidth = Math.min(42, step * 0.6);

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-[#25201D]">
                {title || "Overview"}
            </h3>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-44 w-full"
                role="img"
                aria-label={title || "Bar chart"}
            >
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padding.top + plotHeight * ratio;

                    return (
                        <line
                            key={ratio}
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={y}
                            y2={y}
                            stroke="#F1E4D8"
                            strokeWidth="1"
                        />
                    );
                })}

                {items.map((item, index) => {
                    const barHeight = (item.value / max) * plotHeight;
                    const x = padding.left + step * index + (step - barWidth) / 2;
                    const y = padding.top + plotHeight - barHeight;

                    return (
                        <g key={`${item.label}-${index}`}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 2)}
                                rx="6"
                                fill={COLORS[index % COLORS.length]}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={height - 12}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#6B625C"
                            >
                                {item.label}
                            </text>
                            <text
                                x={x + barWidth / 2}
                                y={Math.max(y - 6, 12)}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill="#25201D"
                            >
                                {item.value}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export function LineChart({ data, title }) {
    const items = normalize(data);

    if (!items.length) return <EmptyChart />;

    const width = 560;
    const height = 180;
    const padding = { top: 18, right: 16, bottom: 34, left: 34 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const max = Math.max(...items.map((item) => item.value), 1);
    const step = items.length > 1 ? plotWidth / (items.length - 1) : 0;

    const points = items.map((item, index) => ({
        x: padding.left + step * index,
        y: padding.top + plotHeight - (item.value / max) * plotHeight,
        item,
    }));

    const line = points
        .map((point) => `${point.x},${point.y}`)
        .join(" ");

    const area = `${padding.left},${padding.top + plotHeight} ${line} ${
        padding.left + (items.length > 1 ? plotWidth : 0)
    },${padding.top + plotHeight}`;

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-[#25201D]">
                {title || "Trend"}
            </h3>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-44 w-full"
                role="img"
                aria-label={title || "Line chart"}
            >
                <polygon points={area} fill="#FCE8DD" />

                {[0, 0.5, 1].map((ratio) => {
                    const y = padding.top + plotHeight * ratio;

                    return (
                        <line
                            key={ratio}
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={y}
                            y2={y}
                            stroke="#F1E4D8"
                            strokeWidth="1"
                        />
                    );
                })}

                <polyline
                    points={line}
                    fill="none"
                    stroke="#C93425"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {points.map((point, index) => (
                    <g key={`${point.item.label}-${index}`}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="#C93425"
                        />
                        <text
                            x={point.x}
                            y={height - 12}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6B625C"
                        >
                            {point.item.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

export function DonutChart({ data, title }) {
    const items = normalize(data).filter((item) => item.value > 0);

    if (!items.length) return <EmptyChart />;

    const total = items.reduce((sum, item) => sum + item.value, 0);
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    const segments = items.reduce((accumulator, item, index) => {
        const length = (item.value / total) * circumference;
        const previous = accumulator[accumulator.length - 1];
        const offset = previous ? previous.offset + previous.length : 0;

        return [...accumulator, { ...item, index, length, offset }];
    }, []);

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-[#25201D]">
                {title || "Breakdown"}
            </h3>

            <div className="flex flex-wrap items-center gap-6">
                <svg
                    viewBox="0 0 140 140"
                    className="h-36 w-36 -rotate-90"
                    role="img"
                    aria-label={title || "Donut chart"}
                >
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="#F1E4D8"
                        strokeWidth="18"
                    />

                    {segments.map((segment) => (
                        <circle
                            key={`${segment.label}-${segment.index}`}
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke={COLORS[segment.index % COLORS.length]}
                            strokeWidth="18"
                            strokeDasharray={`${segment.length} ${
                                circumference - segment.length
                            }`}
                            strokeDashoffset={-segment.offset}
                        />
                    ))}
                </svg>

                <ul className="space-y-2 text-sm text-[#6B625C]">
                    {items.map((item, index) => (
                        <li
                            key={`${item.label}-legend-${index}`}
                            className="flex items-center gap-2"
                        >
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: COLORS[index % COLORS.length],
                                }}
                            />
                            <span className="capitalize">{item.label}</span>
                            <strong className="ml-auto text-[#25201D]">
                                {item.value}
                            </strong>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
