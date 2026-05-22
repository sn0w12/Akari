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
    isHostRegistered: (hostId: string) => boolean;
    settleHostRequest: (hostId: string, id: number, value: boolean) => void;
    getHostRequest: (hostId: string) => ConfirmRequest | undefined;
}

type ConfirmHostProps = {
    hostId: string;
    onMountChange?: (mounted: boolean) => void;
};

const ConfirmContext = React.createContext<ConfirmContextType | undefined>(
    undefined,
);
const ConfirmVersionContext = React.createContext(0);

function getTargetHostId(options: ConfirmOptions, target?: ConfirmTarget) {
    if (typeof target === "string") return target;
    return target?.hostId ?? options.hostId;
}

function useConfirmContext() {
    const context = React.use(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
}

export function useConfirm() {
    const context = useConfirmContext();
    const localHostId = React.useId();
    const isLocalHostMountedRef = React.useRef(false);

    const handleLocalHostMountChange = React.useCallback((mounted: boolean) => {
        isLocalHostMountedRef.current = mounted;
    }, []);

    const confirm = React.useCallback(
        (options: ConfirmOptions, target?: ConfirmTarget) => {
            const requestedHostId = getTargetHostId(options, target);
            const hostId =
                requestedHostId ??
                (isLocalHostMountedRef.current
                    ? localHostId
                    : DEFAULT_CONFIRM_HOST_ID);

            return context.confirm(options, { hostId });
        },
        [context, localHostId],
    );

    return {
        confirm,
        ConfirmHost: React.useCallback(
            () => (
                <ConfirmHost
                    hostId={localHostId}
                    onMountChange={handleLocalHostMountChange}
                />
            ),
            [handleLocalHostMountChange, localHostId],
        ),
        ConfirmDialog: React.useCallback(
            () => (
                <ConfirmHost
                    hostId={localHostId}
                    onMountChange={handleLocalHostMountChange}
                />
            ),
            [handleLocalHostMountChange, localHostId],
        ),
        hostId: localHostId,
    };
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const requestIdRef = React.useRef(0);
    const hostCountsRef = React.useRef(new Map<string, number>());
    const requestsRef = React.useRef<Record<string, ConfirmRequest[]>>({});
    const [version, forceUpdate] = React.useReducer(
        (value: number) => value + 1,
        0,
    );

    const flushHost = React.useCallback((hostId: string) => {
        const requests = requestsRef.current[hostId] ?? [];
        delete requestsRef.current[hostId];
        for (const request of requests) {
            request.resolve(false);
        }
        forceUpdate();
    }, []);

    const registerHost = React.useCallback(
        (hostId: string) => {
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
                    if (hostId !== DEFAULT_CONFIRM_HOST_ID) {
                        flushHost(hostId);
                    }
                }
                forceUpdate();
            };
        },
        [flushHost],
    );

    const isHostRegistered = React.useCallback((hostId: string) => {
        if (hostId === DEFAULT_CONFIRM_HOST_ID) return true;
        return hostCountsRef.current.has(hostId);
    }, []);

    const confirm = React.useCallback(
        (options: ConfirmOptions, target?: ConfirmTarget) => {
            const requestedHostId = getTargetHostId(options, target);
            const hostId =
                requestedHostId && isHostRegistered(requestedHostId)
                    ? requestedHostId
                    : DEFAULT_CONFIRM_HOST_ID;

            return new Promise<boolean>((resolve) => {
                const request = {
                    ...options,
                    hostId,
                    id: ++requestIdRef.current,
                    resolve,
                };

                requestsRef.current = {
                    ...requestsRef.current,
                    [hostId]: [...(requestsRef.current[hostId] ?? []), request],
                };
                forceUpdate();
            });
        },
        [isHostRegistered],
    );

    const settleHostRequest = React.useCallback(
        (hostId: string, id: number, value: boolean) => {
            const requests = requestsRef.current[hostId] ?? [];
            const request = requests.find((item) => item.id === id);
            if (!request) return;

            const nextRequests = requests.filter((item) => item.id !== id);
            requestsRef.current = {
                ...requestsRef.current,
                [hostId]: nextRequests,
            };
            request.resolve(value);
            forceUpdate();
        },
        [],
    );

    const getHostRequest = React.useCallback((hostId: string) => {
        return requestsRef.current[hostId]?.[0];
    }, []);

    const value = React.useMemo(
        () => ({
            confirm,
            registerHost,
            isHostRegistered,
            settleHostRequest,
            getHostRequest,
        }),
        [
            confirm,
            getHostRequest,
            isHostRegistered,
            registerHost,
            settleHostRequest,
        ],
    );

    return (
        <ConfirmContext.Provider value={value}>
            <ConfirmVersionContext.Provider value={version}>
                {children}
                <DefaultConfirmHost />
            </ConfirmVersionContext.Provider>
        </ConfirmContext.Provider>
    );
}

function DefaultConfirmHost() {
    return <ConfirmHost hostId={DEFAULT_CONFIRM_HOST_ID} />;
}

function ConfirmHost({ hostId, onMountChange }: ConfirmHostProps) {
    const context = useConfirmContext();

    React.useEffect(() => {
        onMountChange?.(true);
        const unregisterHost = context.registerHost(hostId);
        return () => {
            onMountChange?.(false);
            unregisterHost();
        };
    }, [context, hostId, onMountChange]);

    return <ConfirmRenderer hostId={hostId} />;
}

function ConfirmRenderer({ hostId }: { hostId: string }) {
    const context = useConfirmContext();
    React.use(ConfirmVersionContext);
    const request = context.getHostRequest(hostId);

    const settle = React.useCallback(
        (value: boolean) => {
            if (!request) return;
            context.settleHostRequest(hostId, request.id, value);
        },
        [context, hostId, request],
    );

    return (
        <ResponsiveConfirmDialog
            open={!!request}
            onOpenChange={(open) => {
                if (!open) settle(false);
            }}
            title={request?.title ?? ""}
            description={request?.description}
            confirmText={request?.confirmText ?? "Confirm"}
            cancelText={request?.cancelText ?? "Cancel"}
            variant={request?.variant ?? "default"}
            onConfirm={() => settle(true)}
            onCancel={() => settle(false)}
        />
    );
}
