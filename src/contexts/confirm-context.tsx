import {
    ConfirmVariant,
    ResponsiveConfirmDialog,
} from "@/components/ui/confirm";
import * as React from "react";

const DEFAULT_CONFIRM_HOST_ID = "default";

export interface ConfirmOptions {
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;
    variant?: ConfirmVariant;
    hostId?: string;
}

export type ConfirmTarget =
    | string
    | {
          hostId?: string;
      };

interface ConfirmRequest extends ConfirmOptions {
    id: number;
    resolve: (value: boolean) => void;
}

interface ConfirmContextType {
    confirm: (
        options: ConfirmOptions,
        target?: ConfirmTarget,
    ) => Promise<boolean>;
    registerHost: (hostId: string) => () => void;
    registerMountedHost: (hostId: string) => () => void;
    settleHostRequest: (hostId: string, id: number, value: boolean) => void;
    getHostRequest: (hostId: string) => ConfirmRequest | undefined;
}

type ConfirmHostProps = {
    hostId: string;
};

const ConfirmContext = React.createContext<ConfirmContextType | undefined>(
    undefined,
);
const useSafeLayoutEffect =
    typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function getTargetHostId(options: ConfirmOptions, target?: ConfirmTarget) {
    if (typeof target === "string") return target;
    return target?.hostId ?? options.hostId;
}

function useConfirmContext() {
    const context = React.useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
}

export function useConfirm() {
    const context = useConfirmContext();
    const localHostId = React.useId();

    useSafeLayoutEffect(() => {
        return context.registerHost(localHostId);
    }, [context, localHostId]);

    const confirm = React.useCallback(
        (options: ConfirmOptions, target?: ConfirmTarget) => {
            return context.confirm(options, {
                hostId: getTargetHostId(options, target) ?? localHostId,
            });
        },
        [context, localHostId],
    );

    return {
        confirm,
        ConfirmHost: React.useCallback(
            () => <ConfirmHost hostId={localHostId} />,
            [localHostId],
        ),
        ConfirmDialog: React.useCallback(
            () => <ConfirmHost hostId={localHostId} />,
            [localHostId],
        ),
        hostId: localHostId,
    };
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const requestIdRef = React.useRef(0);
    const hostCountsRef = React.useRef(new Map<string, number>());
    const mountedHostCountsRef = React.useRef(new Map<string, number>());
    const [requests, setRequests] = React.useState<
        Record<string, ConfirmRequest[]>
    >({});
    const [, forceUpdate] = React.useReducer((value: number) => value + 1, 0);

    const registerHost = React.useCallback((hostId: string) => {
        hostCountsRef.current.set(
            hostId,
            (hostCountsRef.current.get(hostId) ?? 0) + 1,
        );
        forceUpdate();

        return () => {
            const nextCount = (hostCountsRef.current.get(hostId) ?? 1) - 1;

            if (nextCount > 0) {
                hostCountsRef.current.set(hostId, nextCount);
            } else {
                hostCountsRef.current.delete(hostId);
            }
            forceUpdate();
        };
    }, []);

    const registerMountedHost = React.useCallback((hostId: string) => {
        mountedHostCountsRef.current.set(
            hostId,
            (mountedHostCountsRef.current.get(hostId) ?? 0) + 1,
        );
        forceUpdate();

        return () => {
            const nextCount =
                (mountedHostCountsRef.current.get(hostId) ?? 1) - 1;

            if (nextCount > 0) {
                mountedHostCountsRef.current.set(hostId, nextCount);
            } else {
                mountedHostCountsRef.current.delete(hostId);
            }
            forceUpdate();
        };
    }, []);

    const confirm = React.useCallback(
        (options: ConfirmOptions, target?: ConfirmTarget) => {
            const hostId =
                getTargetHostId(options, target) ?? DEFAULT_CONFIRM_HOST_ID;

            return new Promise<boolean>((resolve) => {
                const request = {
                    ...options,
                    hostId,
                    id: ++requestIdRef.current,
                    resolve,
                };

                setRequests((currentRequests) => ({
                    ...currentRequests,
                    [hostId]: [...(currentRequests[hostId] ?? []), request],
                }));
            });
        },
        [],
    );

    const settleHostRequest = React.useCallback(
        (hostId: string, id: number, value: boolean) => {
            let resolvedRequest: ConfirmRequest | undefined;

            setRequests((currentRequests) => {
                const hostRequests = currentRequests[hostId] ?? [];
                const request = hostRequests.find((item) => item.id === id);
                if (!request) return currentRequests;

                resolvedRequest = request;
                const nextHostRequests = hostRequests.filter(
                    (item) => item.id !== id,
                );

                if (nextHostRequests.length === 0) {
                    const nextRequests = { ...currentRequests };
                    delete nextRequests[hostId];
                    return nextRequests;
                }

                return {
                    ...currentRequests,
                    [hostId]: nextHostRequests,
                };
            });

            resolvedRequest?.resolve(value);
        },
        [],
    );

    const getHostRequest = React.useCallback(
        (hostId: string) => {
            return requests[hostId]?.[0];
        },
        [requests],
    );

    const value = React.useMemo(
        () => ({
            confirm,
            registerHost,
            registerMountedHost,
            settleHostRequest,
            getHostRequest,
        }),
        [
            confirm,
            getHostRequest,
            registerHost,
            registerMountedHost,
            settleHostRequest,
        ],
    );

    const fallbackHostIds = Array.from(
        new Set([...hostCountsRef.current.keys(), ...Object.keys(requests)]),
    ).filter(
        (hostId) =>
            hostId !== DEFAULT_CONFIRM_HOST_ID &&
            !mountedHostCountsRef.current.has(hostId),
    );

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <DefaultConfirmHost />
            {fallbackHostIds.map((hostId) => (
                <ConfirmRenderer key={hostId} hostId={hostId} />
            ))}
        </ConfirmContext.Provider>
    );
}

function DefaultConfirmHost() {
    return <ConfirmHost hostId={DEFAULT_CONFIRM_HOST_ID} />;
}

function ConfirmHost({ hostId }: ConfirmHostProps) {
    const context = useConfirmContext();

    useSafeLayoutEffect(() => {
        const unregisterHost = context.registerMountedHost(hostId);
        return () => {
            unregisterHost();
        };
    }, [context, hostId]);

    return <ConfirmRenderer hostId={hostId} />;
}

function ConfirmRenderer({ hostId }: { hostId: string }) {
    const context = useConfirmContext();
    const request = context.getHostRequest(hostId);
    const [displayedRequest, setDisplayedRequest] = React.useState<
        ConfirmRequest | undefined
    >(request);
    const clearDisplayedRequestTimeoutRef = React.useRef<
        ReturnType<typeof setTimeout> | undefined
    >(undefined);

    React.useEffect(() => {
        if (request) {
            if (clearDisplayedRequestTimeoutRef.current) {
                clearTimeout(clearDisplayedRequestTimeoutRef.current);
                clearDisplayedRequestTimeoutRef.current = undefined;
            }
            setDisplayedRequest(request);
            return;
        }

        if (!displayedRequest || clearDisplayedRequestTimeoutRef.current) {
            return;
        }

        clearDisplayedRequestTimeoutRef.current = setTimeout(() => {
            setDisplayedRequest(undefined);
            clearDisplayedRequestTimeoutRef.current = undefined;
        }, 200);
    }, [displayedRequest, request]);

    React.useEffect(() => {
        return () => {
            if (clearDisplayedRequestTimeoutRef.current) {
                clearTimeout(clearDisplayedRequestTimeoutRef.current);
            }
        };
    }, []);

    const activeRequest = request ?? displayedRequest;

    const settle = React.useCallback(
        (value: boolean) => {
            if (!activeRequest) return;
            context.settleHostRequest(hostId, activeRequest.id, value);
        },
        [activeRequest, context, hostId],
    );

    return (
        <ResponsiveConfirmDialog
            open={!!request}
            onOpenChange={(open) => {
                if (!open) settle(false);
            }}
            title={activeRequest?.title ?? ""}
            description={activeRequest?.description}
            confirmText={activeRequest?.confirmText ?? "Confirm"}
            cancelText={activeRequest?.cancelText ?? "Cancel"}
            variant={activeRequest?.variant ?? "default"}
            onConfirm={() => settle(true)}
            onCancel={() => settle(false)}
        />
    );
}
