import {
    type ChartConfig,
    ChartContainer,
    getColorsCount,
    LoadingIndicator,
} from "@/components/evilcharts/ui/chart";
import {
    CartesianGrid,
    Curve,
    Line as RechartsLine,
    LineChart as RechartsLineChart,
    XAxis as RechartsXAxis,
    YAxis as RechartsYAxis,
    type CurveProps,
} from "recharts";
import {
    ChartTooltip,
    ChartTooltipContent,
    type TooltipRoundness,
    type TooltipVariant,
} from "@/components/evilcharts/ui/tooltip";
import {
    ChartLegend,
    ChartLegendContent,
    type ChartLegendVariant,
} from "@/components/evilcharts/ui/legend";
import { ChartDot, type DotVariant } from "@/components/evilcharts/ui/dot";
import {
    Children,
    createContext,
    isValidElement,
    use,
    useCallback,
    useId,
    useMemo,
    useState,
    type ComponentProps,
    type FC,
    type ReactElement,
    type ReactNode,
} from "react";

// Constants
const STROKE_WIDTH = 1;

type CurveType = ComponentProps<typeof RechartsLine>["type"];
type LineDotProp = ComponentProps<typeof RechartsLine>["dot"];
type LineActiveDotProp = ComponentProps<typeof RechartsLine>["activeDot"];
type StrokeVariant = "solid" | "dashed";

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

type LineChartContextValue = {
    config: ChartConfig;
    curveType: CurveType;
    isLoading: boolean;
    selectedDataKey: string | null;
    selectDataKey: (dataKey: string | null) => void;
};

const LineChartContext = createContext<LineChartContextValue | null>(null);

function useLineChart() {
    const context = use(LineChartContext);

    if (!context) {
        throw new Error(
            "Line chart parts (<Line />, <XAxis />, …) must be used within <EvilLineChart />",
        );
    }

    return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

type ValidateConfigKeys<TData, TConfig> = {
    [K in keyof TConfig]: K extends keyof TData ? ChartConfig[string] : never;
};

type EvilLineChartBaseProps<
    TData extends Record<string, unknown>,
    TConfig extends Record<string, ChartConfig[string]>,
> = {
    config: TConfig & ValidateConfigKeys<TData, TConfig>;
    data: TData[];
    children: ReactNode;
    className?: string;
    chartProps?: ComponentProps<typeof RechartsLineChart>;
    curveType?: CurveType;
    defaultSelectedDataKey?: string | null;
    onSelectionChange?: (selectedDataKey: string | null) => void;
    isLoading?: boolean;
};

type EvilLineChartProps<
    TData extends Record<string, unknown>,
    TConfig extends Record<string, ChartConfig[string]>,
> = EvilLineChartBaseProps<TData, TConfig>;

export function EvilLineChart<
    TData extends Record<string, unknown>,
    TConfig extends Record<string, ChartConfig[string]>,
>({
    config,
    data,
    children,
    className,
    chartProps,
    curveType = "linear",
    defaultSelectedDataKey = null,
    onSelectionChange,
    isLoading = false,
}: EvilLineChartProps<TData, TConfig>) {
    const chartId = useId().replace(/:/g, "");
    const [selectedDataKey, setSelectedDataKey] = useState<string | null>(
        defaultSelectedDataKey,
    );

    const selectDataKey = useCallback(
        (newSelectedDataKey: string | null) => {
            setSelectedDataKey(newSelectedDataKey);
            onSelectionChange?.(newSelectedDataKey);
        },
        [onSelectionChange],
    );

    const contextValue = useMemo<LineChartContextValue>(
        () => ({
            config,
            curveType,
            isLoading,
            selectedDataKey,
            selectDataKey,
        }),
        [config, curveType, isLoading, selectedDataKey, selectDataKey],
    );

    return (
        <LineChartContext value={contextValue}>
            <ChartContainer className={className} config={config}>
                <LoadingIndicator isLoading={isLoading} />
                <RechartsLineChart
                    id={chartId}
                    accessibilityLayer
                    data={data}
                    {...chartProps}
                >
                    {children}
                </RechartsLineChart>
            </ChartContainer>
        </LineChartContext>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type LineProps = {
    dataKey: string;
    strokeVariant?: StrokeVariant;
    curveType?: CurveType;
    connectNulls?: boolean;
    isClickable?: boolean;
    glowing?: boolean;
    enableBufferLine?: boolean;
    children?: ReactNode;
    lineProps?: ComponentProps<typeof RechartsLine>;
};

export function Line({
    dataKey,
    strokeVariant = "solid",
    curveType,
    connectNulls = false,
    isClickable = false,
    glowing = false,
    enableBufferLine = false,
    children,
    lineProps,
}: LineProps) {
    const {
        config,
        curveType: defaultCurve,
        isLoading,
        selectedDataKey,
        selectDataKey,
    } = useLineChart();
    const id = useId().replace(/:/g, "");

    if (isLoading) return null;

    const resolvedCurve = curveType ?? defaultCurve;

    const isSelected = selectedDataKey === dataKey;
    const opacity = getOpacity(selectedDataKey, dataKey);

    const { dot, activeDot } = resolveDots(children, id, dataKey, opacity.dot);

    const isDashed = strokeVariant === "dashed";

    return (
        <>
            <g key={dataKey}>
                {isClickable && (
                    <RechartsLine
                        type={resolvedCurve}
                        dataKey={dataKey}
                        connectNulls={connectNulls}
                        stroke="transparent"
                        strokeWidth={15}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                        legendType="none"
                        tooltipType="none"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            selectDataKey(isSelected ? null : dataKey)
                        }
                    />
                )}
                <RechartsLine
                    type={resolvedCurve}
                    dataKey={dataKey}
                    connectNulls={connectNulls}
                    strokeOpacity={opacity.stroke}
                    stroke={`url(#${id}-colors-${dataKey})`}
                    filter={glowing ? `url(#${id}-glow-${dataKey})` : undefined}
                    dot={dot}
                    activeDot={activeDot}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={isDashed ? "5 5" : undefined}
                    shape={enableBufferLine ? bufferLineShape : undefined}
                    isAnimationActive={false}
                    style={isClickable ? { cursor: "pointer" } : {}}
                    onClick={() => {
                        if (!isClickable) return;
                        selectDataKey(isSelected ? null : dataKey);
                    }}
                    {...lineProps}
                />
            </g>
            <defs>
                <ColorGradient id={id} dataKey={dataKey} config={config} />
                {glowing && <GlowFilter id={id} dataKey={dataKey} />}
            </defs>
        </>
    );
}

type DotProps = {
    variant?: DotVariant;
};

export const Dot: FC<DotProps> = () => null;

export const ActiveDot: FC<DotProps> = () => null;

type XAxisProps = ComponentProps<typeof RechartsXAxis>;

export function XAxis({
    tickLine = false,
    axisLine = false,
    tickMargin = 8,
    minTickGap = 8,
    ...props
}: XAxisProps) {
    const { isLoading } = useLineChart();

    if (isLoading) return null;

    return (
        <RechartsXAxis
            tickLine={tickLine}
            axisLine={axisLine}
            tickMargin={tickMargin}
            minTickGap={minTickGap}
            {...props}
        />
    );
}

type YAxisProps = ComponentProps<typeof RechartsYAxis>;

export function YAxis({
    tickLine = false,
    axisLine = false,
    tickMargin = 8,
    minTickGap = 8,
    width = "auto",
    ...props
}: YAxisProps) {
    const { isLoading } = useLineChart();

    if (isLoading) return null;

    return (
        <RechartsYAxis
            tickLine={tickLine}
            axisLine={axisLine}
            tickMargin={tickMargin}
            minTickGap={minTickGap}
            width={width}
            {...props}
        />
    );
}

type GridProps = ComponentProps<typeof CartesianGrid>;

export function Grid({
    vertical = false,
    strokeDasharray = "3 3",
    ...props
}: GridProps) {
    return (
        <CartesianGrid
            vertical={vertical}
            strokeDasharray={strokeDasharray}
            {...props}
        />
    );
}

type TooltipProps = {
    variant?: TooltipVariant;
    roundness?: TooltipRoundness;
    defaultIndex?: number;
    cursor?: boolean;
};

export function Tooltip({
    variant,
    roundness,
    defaultIndex,
    cursor = true,
}: TooltipProps) {
    const { isLoading, selectedDataKey } = useLineChart();

    if (isLoading) return null;

    return (
        <ChartTooltip
            defaultIndex={defaultIndex}
            cursor={
                cursor
                    ? { strokeDasharray: "3 3", strokeWidth: STROKE_WIDTH }
                    : false
            }
            content={
                <ChartTooltipContent
                    selected={selectedDataKey}
                    roundness={roundness}
                    variant={variant}
                />
            }
        />
    );
}

type LegendProps = {
    variant?: ChartLegendVariant;
    align?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    isClickable?: boolean;
};

export function Legend({
    variant,
    align = "right",
    verticalAlign = "top",
    isClickable = false,
}: LegendProps) {
    const { selectedDataKey, selectDataKey } = useLineChart();

    return (
        <ChartLegend
            verticalAlign={verticalAlign}
            align={align}
            content={
                <ChartLegendContent
                    selected={selectedDataKey}
                    onSelectChange={selectDataKey}
                    isClickable={isClickable}
                    variant={variant}
                />
            }
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Selection + dot helpers
// ─────────────────────────────────────────────────────────────────────────────

const getOpacity = (selectedDataKey: string | null, dataKey: string) => {
    if (selectedDataKey === null) {
        return { stroke: 1, dot: 1 };
    }

    return selectedDataKey === dataKey
        ? { stroke: 1, dot: 1 }
        : { stroke: 0.3, dot: 0.3 };
};

const resolveDots = (
    children: ReactNode,
    id: string,
    dataKey: string,
    dotOpacity: number,
): { dot: LineDotProp; activeDot: LineActiveDotProp } => {
    let dot: LineDotProp = false;
    let activeDot: LineActiveDotProp = false;

    Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;

        if (child.type === Dot) {
            const { variant } = (child as ReactElement<DotProps>).props;
            dot = (
                <ChartDot
                    type={variant}
                    dataKey={dataKey}
                    chartId={id}
                    fillOpacity={dotOpacity}
                />
            );
        }

        if (child.type === ActiveDot) {
            const { variant } = (child as ReactElement<DotProps>).props;
            activeDot = (
                <ChartDot
                    type={variant}
                    dataKey={dataKey}
                    chartId={id}
                    fillOpacity={dotOpacity}
                />
            );
        }
    });

    return { dot, activeDot };
};

// ─────────────────────────────────────────────────────────────────────────────
// Buffer line
// ─────────────────────────────────────────────────────────────────────────────

type CurvePoint = NonNullable<NonNullable<CurveProps["points"]>[number]>;
type DrawableCurvePoint = CurvePoint & { x: number; y: number };

const isDrawableCurvePoint = (
    point: CurvePoint,
): point is DrawableCurvePoint => {
    return typeof point.x === "number" && typeof point.y === "number";
};

const BUFFER_DASH_SIZE = 4;
const BUFFER_GAP_SIZE = 3;

const findLengthAtX = (
    path: SVGPathElement,
    totalLength: number,
    targetX: number,
): number => {
    let lo = 0;
    let hi = totalLength;
    while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        const pt = path.getPointAtLength(mid);
        if (pt.x < targetX) lo = mid;
        else hi = mid;
    }
    return (lo + hi) / 2;
};

const bufferLineShape = (props: CurveProps) => {
    const { points, ...rest } = props;

    if (!points || points.length < 2) {
        return <Curve {...props} />;
    }

    const drawablePoints = points.filter(isDrawableCurvePoint);

    if (drawablePoints.length < 2) {
        return <Curve {...props} />;
    }

    const splitX = drawablePoints[drawablePoints.length - 2].x;

    const gRef = (g: SVGGElement | null) => {
        if (!g) return;
        const path = g.querySelector("path");
        if (!path) return;

        const totalLength = path.getTotalLength();
        const solidLength = findLengthAtX(path, totalLength, splitX);
        const lastSegmentLength = totalLength - solidLength;

        const reps =
            Math.ceil(
                lastSegmentLength / (BUFFER_DASH_SIZE + BUFFER_GAP_SIZE),
            ) + 1;
        const dashedPart = Array.from(
            { length: reps },
            () => `${BUFFER_DASH_SIZE} ${BUFFER_GAP_SIZE}`,
        ).join(" ");

        path.setAttribute("stroke-dasharray", `${solidLength} 0 ${dashedPart}`);
    };

    return (
        <g ref={gRef}>
            <Curve {...rest} points={drawablePoints} />
        </g>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions
// ─────────────────────────────────────────────────────────────────────────────

type StyleProps = {
    id: string;
    dataKey: string;
};

const ColorGradient = ({
    id,
    dataKey,
    config,
}: StyleProps & { config: ChartConfig }) => {
    const colorsCount = getColorsCount(config[dataKey] ?? {});

    return (
        <linearGradient
            id={`${id}-colors-${dataKey}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
        >
            {colorsCount === 1 ? (
                <>
                    <stop offset="0%" stopColor={`var(--color-${dataKey}-0)`} />
                    <stop
                        offset="100%"
                        stopColor={`var(--color-${dataKey}-0)`}
                    />
                </>
            ) : (
                Array.from({ length: colorsCount }, (_, index) => {
                    const offset = `${(index / (colorsCount - 1)) * 100}%`;
                    return (
                        <stop
                            key={offset}
                            offset={offset}
                            stopColor={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`}
                        />
                    );
                })
            )}
        </linearGradient>
    );
};

const GlowFilter = ({ id, dataKey }: StyleProps) => {
    return (
        <filter
            id={`${id}-glow-${dataKey}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
        >
            <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="10"
                result="blur"
            />
            <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 2 0"
                result="glow"
            />
            <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    );
};
