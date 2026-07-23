import {
    type ChartConfig,
    ChartContainer,
    getColorsCount,
    LoadingIndicator,
} from "@/components/evilcharts/ui/chart";
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
import {
    ChartBackground,
    type BackgroundVariant,
} from "@/components/evilcharts/ui/background";
import {
    createContext,
    use,
    useCallback,
    useId,
    useMemo,
    useState,
    type ComponentProps,
    type ReactNode,
} from "react";
import {
    Bar as RechartsBar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Rectangle,
    ReferenceLine,
    XAxis as RechartsXAxis,
    YAxis as RechartsYAxis,
} from "recharts";
import { type RectRadius } from "recharts/types/shape/Rectangle";

// Constants
const DEFAULT_BAR_RADIUS = 2;
const STACK_ID = "evil-stacked";

type BarVariant =
    | "default"
    | "hatched"
    | "duotone"
    | "duotone-reverse"
    | "gradient"
    | "stripped";
type StackType = "default" | "stacked" | "percent";
type BarLayout = "vertical" | "horizontal";

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

type BarChartContextValue = {
    config: ChartConfig;
    isStacked: boolean;
    isHorizontal: boolean;
    isLoading: boolean;
    barRadius: number;
    dataLength: number;
    selectedDataKey: string | null;
    selectDataKey: (dataKey: string | null) => void;
    isMouseInChart: boolean;
};

const BarChartContext = createContext<BarChartContextValue | null>(null);

function useBarChart() {
    const context = use(BarChartContext);

    if (!context) {
        throw new Error(
            "Bar chart parts (<Bar />, <XAxis />, …) must be used within <EvilBarChart />",
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

type EvilBarChartBaseProps<
    TData extends Record<string, unknown>,
    TConfig extends Record<string, ChartConfig[string]>,
> = {
    config: TConfig & ValidateConfigKeys<TData, TConfig>;
    data: TData[];
    className?: string;
    chartProps?: ComponentProps<typeof RechartsBarChart>;
    stackType?: StackType;
    layout?: BarLayout;
    barRadius?: number;
    barGap?: number;
    barCategoryGap?: number;
    backgroundVariant?: BackgroundVariant;
    defaultSelectedDataKey?: string | null;
    onSelectionChange?: (selectedDataKey: string | null) => void;
    isLoading?: boolean;
    children?: ReactNode;
};

type EvilBarChartProps<
    TData extends Record<string, unknown>,
    TConfig extends Record<string, ChartConfig[string]>,
> = EvilBarChartBaseProps<TData, TConfig>;

export function EvilBarChart<
    TData extends Record<string, unknown>,
    TConfig extends Record<string, ChartConfig[string]>,
>({
    config,
    data,
    children,
    className,
    chartProps,
    stackType = "default",
    layout = "vertical",
    barRadius = DEFAULT_BAR_RADIUS,
    barGap,
    barCategoryGap,
    backgroundVariant,
    defaultSelectedDataKey = null,
    onSelectionChange,
    isLoading = false,
}: EvilBarChartProps<TData, TConfig>) {
    const chartId = useId().replace(/:/g, "");
    const [selectedDataKey, setSelectedDataKey] = useState<string | null>(
        defaultSelectedDataKey,
    );
    const [isMouseInChart, setIsMouseInChart] = useState(false);

    const isStacked = stackType === "stacked" || stackType === "percent";
    const isHorizontal = layout === "horizontal";

    const selectDataKey = useCallback(
        (newSelectedDataKey: string | null) => {
            setSelectedDataKey(newSelectedDataKey);
            onSelectionChange?.(newSelectedDataKey);
        },
        [onSelectionChange],
    );

    const contextValue = useMemo<BarChartContextValue>(
        () => ({
            config,
            isStacked,
            isHorizontal,
            isLoading,
            barRadius,
            dataLength: data.length,
            selectedDataKey,
            selectDataKey,
            isMouseInChart,
        }),
        [
            config,
            isStacked,
            isHorizontal,
            isLoading,
            barRadius,
            data.length,
            selectedDataKey,
            selectDataKey,
            isMouseInChart,
        ],
    );

    return (
        <BarChartContext value={contextValue}>
            <ChartContainer className={className} config={config}>
                <LoadingIndicator isLoading={isLoading} />
                <RechartsBarChart
                    id={chartId}
                    accessibilityLayer
                    layout={isHorizontal ? "vertical" : "horizontal"}
                    data={data}
                    barGap={barGap}
                    barCategoryGap={barCategoryGap}
                    stackOffset={stackType === "percent" ? "expand" : undefined}
                    onMouseEnter={() => setIsMouseInChart(true)}
                    onMouseLeave={() => setIsMouseInChart(false)}
                    {...chartProps}
                >
                    {backgroundVariant && (
                        <ChartBackground variant={backgroundVariant} />
                    )}
                    <ReferenceLine color="white" />
                    {children}
                </RechartsBarChart>
            </ChartContainer>
        </BarChartContext>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type BarProps = {
    dataKey: string;
    variant?: BarVariant;
    radius?: number;
    isClickable?: boolean;
    enableHoverHighlight?: boolean;
    glowing?: boolean;
    bufferBar?: boolean;
    barProps?: ComponentProps<typeof RechartsBar>;
};

export function Bar({
    dataKey,
    variant = "default",
    radius,
    isClickable = false,
    enableHoverHighlight = false,
    glowing = false,
    bufferBar = false,
    barProps,
}: BarProps) {
    const {
        config,
        isStacked,
        isLoading,
        barRadius: defaultRadius,
        dataLength,
        selectedDataKey,
        selectDataKey,
        isMouseInChart,
    } = useBarChart();
    const id = useId().replace(/:/g, "");

    if (isLoading) return null;

    const resolvedRadius = radius ?? defaultRadius;
    const isSelected = selectedDataKey === dataKey;

    const customBarProps = {
        id,
        dataKey,
        variant,
        barRadius: resolvedRadius,
        glowing,
        bufferBar,
        isClickable,
        enableHoverHighlight,
        isMouseInChart,
        selectedDataKey,
        dataLength,
        onClick: () => {
            if (!isClickable) return;
            selectDataKey(isSelected ? null : dataKey);
        },
    };

    return (
        <>
            <RechartsBar
                dataKey={dataKey}
                stackId={isStacked ? STACK_ID : undefined}
                fill={`url(#${id}-colors-${dataKey})`}
                radius={resolvedRadius}
                isAnimationActive={false}
                style={
                    isClickable || enableHoverHighlight
                        ? { cursor: "pointer" }
                        : undefined
                }
                shape={(props: unknown) => (
                    <CustomBar
                        {...(props as BarShapeProps)}
                        {...customBarProps}
                    />
                )}
                activeBar={(props: unknown) => (
                    <CustomBar
                        {...(props as BarShapeProps)}
                        {...customBarProps}
                        isActive
                    />
                )}
                {...barProps}
            />
            <defs>
                <ColorGradient id={id} dataKey={dataKey} config={config} />
                {variant === "hatched" && (
                    <HatchedPattern id={id} dataKey={dataKey} />
                )}
                {variant === "duotone" && (
                    <DuotonePattern id={id} dataKey={dataKey} config={config} />
                )}
                {variant === "duotone-reverse" && (
                    <DuotoneReversePattern
                        id={id}
                        dataKey={dataKey}
                        config={config}
                    />
                )}
                {variant === "gradient" && (
                    <GradientPattern id={id} dataKey={dataKey} />
                )}
                {variant === "stripped" && (
                    <StrippedPattern id={id} dataKey={dataKey} />
                )}
                {bufferBar && (
                    <BufferHatchedPattern id={id} dataKey={dataKey} />
                )}
                {glowing && <GlowFilter id={id} dataKey={dataKey} />}
            </defs>
        </>
    );
}

type XAxisProps = ComponentProps<typeof RechartsXAxis>;

export function XAxis({
    tickLine = false,
    axisLine = false,
    tickMargin = 8,
    minTickGap = 8,
    type,
    ...props
}: XAxisProps) {
    const { isLoading, isHorizontal } = useBarChart();

    if (isLoading) return null;

    return (
        <RechartsXAxis
            tickLine={tickLine}
            axisLine={axisLine}
            tickMargin={tickMargin}
            minTickGap={minTickGap}
            type={type ?? (isHorizontal ? "number" : "category")}
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
    type,
    ...props
}: YAxisProps) {
    const { isLoading, isHorizontal } = useBarChart();

    if (isLoading) return null;

    return (
        <RechartsYAxis
            tickLine={tickLine}
            axisLine={axisLine}
            tickMargin={tickMargin}
            minTickGap={minTickGap}
            width={width}
            type={type ?? (isHorizontal ? "category" : "number")}
            {...props}
        />
    );
}

type GridProps = ComponentProps<typeof CartesianGrid>;

export function Grid({
    strokeDasharray = "3 3",
    vertical,
    horizontal,
    ...props
}: GridProps) {
    const { isHorizontal } = useBarChart();

    return (
        <CartesianGrid
            strokeDasharray={strokeDasharray}
            vertical={vertical ?? isHorizontal}
            horizontal={horizontal ?? !isHorizontal}
            {...props}
        />
    );
}

type TooltipProps = {
    variant?: TooltipVariant;
    roundness?: TooltipRoundness;
    defaultIndex?: number;
};

export function Tooltip({ variant, roundness, defaultIndex }: TooltipProps) {
    const { isLoading, selectedDataKey } = useBarChart();

    if (isLoading) return null;

    return (
        <ChartTooltip
            cursor={false}
            defaultIndex={defaultIndex}
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
    const { selectedDataKey, selectDataKey } = useBarChart();

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
// Custom bar shape
// ─────────────────────────────────────────────────────────────────────────────

type BarShapeProps = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    fillOpacity?: number;
    dataKey?: string;
    index?: number;
    [key: string]: unknown;
};

type CustomBarProps = {
    id: string;
    dataKey: string;
    variant: BarVariant;
    barRadius: number;
    glowing?: boolean;
    bufferBar?: boolean;
    isClickable?: boolean;
    enableHoverHighlight?: boolean;
    isMouseInChart?: boolean;
    selectedDataKey?: string | null;
    isActive?: boolean;
    dataLength?: number;
    onClick?: () => void;
} & BarShapeProps;

const CustomBar = (props: CustomBarProps) => {
    const {
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        id,
        dataKey,
        variant,
        barRadius,
        glowing,
        bufferBar,
        isClickable,
        enableHoverHighlight,
        isMouseInChart,
        selectedDataKey,
        isActive,
        dataLength = 0,
        onClick,
    } = props;

    const index = typeof props.index === "number" ? props.index : -1;
    const isLastBar = bufferBar && dataLength > 0 && index === dataLength - 1;
    const isStripped = variant === "stripped";

    const fill = isLastBar
        ? `url(#${id}-buffer-hatched-${dataKey})`
        : getVariantFill(variant, id, dataKey);
    const filter = glowing ? `url(#${id}-bar-glow-${dataKey})` : undefined;

    const fillOpacity = getBarOpacity({
        isClickable,
        selectedDataKey,
        dataKey,
        enableHoverHighlight,
        isMouseInChart,
        isActive,
    });
    const cursorStyle =
        isClickable || enableHoverHighlight ? { cursor: "pointer" } : undefined;

    const radius: RectRadius = isStripped
        ? [barRadius, barRadius, 0, 0]
        : barRadius;

    const visibleBar = (
        <>
            <Rectangle
                x={x}
                y={y}
                width={width}
                opacity={fillOpacity}
                height={Math.max(0, height - 3)}
                radius={radius}
                fill={fill}
                filter={filter}
                stroke={isLastBar ? `url(#${id}-colors-${dataKey})` : undefined}
                strokeWidth={isLastBar ? 1 : undefined}
            />
            {isStripped && (
                <Rectangle
                    x={x}
                    y={y - 4}
                    width={width}
                    height={2}
                    radius={1}
                    fill={`url(#${id}-colors-${dataKey})`}
                />
            )}
        </>
    );

    return (
        <g style={cursorStyle} onClick={onClick}>
            <Rectangle {...props} fill="transparent" />
            {visibleBar}
        </g>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Selection + fill helpers
// ─────────────────────────────────────────────────────────────────────────────

const getVariantFill = (
    variant: BarVariant,
    id: string,
    dataKey: string,
): string => {
    switch (variant) {
        case "hatched":
            return `url(#${id}-hatched-${dataKey})`;
        case "duotone":
            return `url(#${id}-duotone-${dataKey})`;
        case "duotone-reverse":
            return `url(#${id}-duotone-reverse-${dataKey})`;
        case "gradient":
            return `url(#${id}-gradient-${dataKey})`;
        case "stripped":
            return `url(#${id}-stripped-${dataKey})`;
        default:
            return `url(#${id}-colors-${dataKey})`;
    }
};

const getBarOpacity = ({
    isClickable,
    selectedDataKey,
    dataKey,
    enableHoverHighlight,
    isMouseInChart,
    isActive,
}: {
    isClickable?: boolean;
    selectedDataKey?: string | null;
    dataKey: string;
    enableHoverHighlight?: boolean;
    isMouseInChart?: boolean;
    isActive?: boolean;
}) => {
    const isSelectedDataKey =
        selectedDataKey === null || selectedDataKey === dataKey;
    const clickOpacity =
        isClickable && selectedDataKey !== null
            ? isSelectedDataKey
                ? 1
                : 0.3
            : 1;

    if (enableHoverHighlight && isMouseInChart) {
        return isActive ? clickOpacity : clickOpacity * 0.3;
    }

    return clickOpacity;
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
        <linearGradient id={`${id}-colors-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
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

const HatchedPattern = ({ id, dataKey }: StyleProps) => {
    return (
        <>
            <pattern
                id={`${id}-hatched-mask-pattern`}
                x="0"
                y="0"
                width="5"
                height="5"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-45)"
            >
                <rect width="5" height="5" fill="white" fillOpacity={0.3} />
                <rect width="1.5" height="5" fill="white" fillOpacity={1} />
            </pattern>
            <mask id={`${id}-hatched-mask-${dataKey}`}>
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-hatched-mask-pattern)`}
                />
            </mask>
            <pattern
                id={`${id}-hatched-${dataKey}`}
                patternUnits="userSpaceOnUse"
                width="100%"
                height="100%"
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-colors-${dataKey})`}
                    mask={`url(#${id}-hatched-mask-${dataKey})`}
                />
            </pattern>
        </>
    );
};

const BufferHatchedPattern = ({ id, dataKey }: StyleProps) => {
    return (
        <>
            <pattern
                id={`${id}-buffer-hatched-mask-pattern`}
                x="0"
                y="0"
                width="5"
                height="5"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-45)"
            >
                <rect width="5" height="5" fill="black" fillOpacity={0} />
                <rect width="1" height="5" fill="white" fillOpacity={1} />
            </pattern>
            <mask id={`${id}-buffer-hatched-mask-${dataKey}`}>
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-buffer-hatched-mask-pattern)`}
                />
            </mask>
            <pattern
                id={`${id}-buffer-hatched-${dataKey}`}
                patternUnits="userSpaceOnUse"
                width="100%"
                height="100%"
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-colors-${dataKey})`}
                    mask={`url(#${id}-buffer-hatched-mask-${dataKey})`}
                />
            </pattern>
        </>
    );
};

const DuotonePattern = ({
    id,
    dataKey,
    config,
}: StyleProps & { config: ChartConfig }) => {
    const colorsCount = getColorsCount(config[dataKey] ?? {});

    return (
        <>
            <linearGradient
                id={`${id}-duotone-mask-gradient-${dataKey}`}
                gradientUnits="objectBoundingBox"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
            >
                <stop offset="50%" stopColor="white" stopOpacity={0.4} />
                <stop offset="50%" stopColor="white" stopOpacity={1} />
            </linearGradient>
            <linearGradient
                id={`${id}-duotone-colors-${dataKey}`}
                gradientUnits="objectBoundingBox"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
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
            <mask
                id={`${id}-duotone-mask-${dataKey}`}
                maskContentUnits="objectBoundingBox"
            >
                <rect
                    x="0"
                    y="0"
                    width="1"
                    height="1"
                    fill={`url(#${id}-duotone-mask-gradient-${dataKey})`}
                />
            </mask>
            <pattern
                id={`${id}-duotone-${dataKey}`}
                patternUnits="objectBoundingBox"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1"
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-duotone-colors-${dataKey})`}
                    mask={`url(#${id}-duotone-mask-${dataKey})`}
                />
            </pattern>
        </>
    );
};

const DuotoneReversePattern = ({
    id,
    dataKey,
    config,
}: StyleProps & { config: ChartConfig }) => {
    const colorsCount = getColorsCount(config[dataKey] ?? {});

    return (
        <>
            <linearGradient
                id={`${id}-duotone-reverse-mask-gradient-${dataKey}`}
                gradientUnits="objectBoundingBox"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
            >
                <stop offset="50%" stopColor="white" stopOpacity={1} />
                <stop offset="50%" stopColor="white" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient
                id={`${id}-duotone-reverse-colors-${dataKey}`}
                gradientUnits="objectBoundingBox"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
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
            <mask
                id={`${id}-duotone-reverse-mask-${dataKey}`}
                maskContentUnits="objectBoundingBox"
            >
                <rect
                    x="0"
                    y="0"
                    width="1"
                    height="1"
                    fill={`url(#${id}-duotone-reverse-mask-gradient-${dataKey})`}
                />
            </mask>
            <pattern
                id={`${id}-duotone-reverse-${dataKey}`}
                patternUnits="objectBoundingBox"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1"
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-duotone-reverse-colors-${dataKey})`}
                    mask={`url(#${id}-duotone-reverse-mask-${dataKey})`}
                />
            </pattern>
        </>
    );
};

const GradientPattern = ({ id, dataKey }: StyleProps) => {
    return (
        <>
            <linearGradient
                id={`${id}-gradient-mask-gradient`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
                <stop offset="20%" stopColor="white" stopOpacity={1} />
                <stop offset="90%" stopColor="white" stopOpacity={0} />
            </linearGradient>
            <mask id={`${id}-gradient-mask-${dataKey}`}>
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-gradient-mask-gradient)`}
                />
            </mask>
            <pattern
                id={`${id}-gradient-${dataKey}`}
                patternUnits="userSpaceOnUse"
                width="100%"
                height="100%"
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-colors-${dataKey})`}
                    mask={`url(#${id}-gradient-mask-${dataKey})`}
                />
            </pattern>
        </>
    );
};

const StrippedPattern = ({ id, dataKey }: StyleProps) => {
    return (
        <>
            <linearGradient
                id={`${id}-stripped-mask-gradient`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
                <stop offset="0%" stopColor="white" stopOpacity={0.2} />
                <stop offset="100%" stopColor="white" stopOpacity={0.2} />
            </linearGradient>
            <mask id={`${id}-stripped-mask-${dataKey}`}>
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-stripped-mask-gradient)`}
                />
            </mask>
            <pattern
                id={`${id}-stripped-${dataKey}`}
                patternUnits="userSpaceOnUse"
                width="100%"
                height="100%"
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${id}-colors-${dataKey})`}
                    mask={`url(#${id}-stripped-mask-${dataKey})`}
                />
            </pattern>
        </>
    );
};

const GlowFilter = ({ id, dataKey }: StyleProps) => {
    return (
        <filter id={`${id}-bar-glow-${dataKey}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 0.5 0"
                result="glow"
            />
            <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    );
};


