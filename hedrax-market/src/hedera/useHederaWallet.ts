import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "initializing" | "ready" | "connecting" | "connected" | "error";

type Adapter = {
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
  getAccountId: () => string | null;
  destroy?: () => Promise<void> | void;
};

function useStableRef<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}

export function useHederaWallet() {
  const [status, setStatus] = useState<Status>("idle");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [err, setErr] = useState<unknown>(null);

  const adapterRef = useRef<Adapter | null>(null);
  useStableRef(status);

  const appMeta = {
    name: "HedraX",
    description: "HedraX early access",
    icons: ["https://c.animaapp.com/mh25bcdiL6JXsX/img/hedraxlogo-2-1.png"],
    url: typeof window !== "undefined" ? window.location.origin : "https://hedrax.io",
  };

  const ensureAdapter = useCallback(async (): Promise<Adapter> => {
    if (adapterRef.current) return adapterRef.current;

    setStatus("initializing");

    let DAppConnector: any,
      HederaSessionEvent: any,
      HederaChainId: any,
      HederaJsonRpcMethod: any,
      LedgerId: any;

    try {
      const mod = await import("@hashgraph/hedera-wallet-connect");
      DAppConnector       = mod?.DAppConnector;
      HederaSessionEvent  = mod?.HederaSessionEvent;
      HederaChainId       = mod?.HederaChainId;
      HederaJsonRpcMethod = mod?.HederaJsonRpcMethod;
      
      const sdkMod = await import("@hashgraph/sdk");
      LedgerId = sdkMod?.LedgerId;
    } catch (e) {
      console.error("[HedraX] Failed to load required modules:", e);
      setErr(e);
      setStatus("error");
      throw e;
    }

    if (typeof DAppConnector !== "function") {
      const msg = new Error("DAppConnector not available");
      setErr(msg);
      setStatus("error");
      throw msg;
    }

    if (!LedgerId) {
      const msg = new Error("LedgerId not available from @hashgraph/sdk");
      setErr(msg);
      setStatus("error");
      throw msg;
    }

    const projectId = "24f627ca64d15e24ba06692cf3b2439d";
    console.log("[HedraX] WC projectId =", projectId);

    let mainnetLedgerId;
    try {
      mainnetLedgerId = LedgerId.MAINNET || LedgerId.Mainnet || LedgerId.fromString("mainnet");
      console.log("[HedraX] Using LedgerId:", mainnetLedgerId);
    } catch (e) {
      console.error("[HedraX] Failed to create mainnet LedgerId:", e);
      setErr(e);
      setStatus("error");
      throw e;
    }

    const wantedMethods = Object.values(HederaJsonRpcMethod ?? {});
    const wantedEvents = [
      HederaSessionEvent?.ChainChanged,
      HederaSessionEvent?.AccountsChanged,
      HederaSessionEvent?.SessionConnected,
      HederaSessionEvent?.SessionDisconnected,
    ].filter(Boolean);

    const supportedChains = [HederaChainId?.Mainnet].filter(Boolean);

    let connector: any;
    try {
      connector = new DAppConnector(
        appMeta,
        mainnetLedgerId,
        projectId,
        wantedMethods,
        wantedEvents,
        supportedChains
      );
    } catch (e) {
      console.error("[HedraX] Failed to construct DAppConnector:", e);
      setErr(e);
      setStatus("error");
      throw e;
    }

    try {
      await connector.init({ logger: "silent" });
      console.log("[HedraX] dAppConnector.init OK (MAINNET)");
    } catch (e) {
      console.error("[HedraX] Error initializing DAppConnector:", e);
      setErr(e);
      setStatus("error");
      throw e;
    }

    const extractAccount = (x: any): string | null => {
      if (!x) return null;
      
      // Try multiple ways to get the account
      const account = 
        x.accountId ||
        x?.account?.accountId ||
        x?.accounts?.[0]?.accountId ||
        x?.accounts?.[0] ||
        x?.accountIds?.[0] ||
        null;
      
      console.log("[HedraX] Extracted account:", account);
      return account;
    };

    const on = (ev: string, cb: (...a: any[]) => void) => {
      try {
        if (ev && typeof connector.on === "function") connector.on(ev, cb);
      } catch {/* no-op */}
    };

    on(HederaSessionEvent?.SessionConnected ?? "SESSION_CONNECTED", (payload: any) => {
      console.log("[HedraX] SESSION_CONNECTED event", payload);
      const acct = extractAccount(payload) || extractAccount(connector);
      if (acct) {
        console.log("[HedraX] Setting accountId from SESSION_CONNECTED:", acct);
        setAccountId(acct);
        setStatus("connected");
      } else {
        setStatus("ready");
      }
    });

    on(HederaSessionEvent?.AccountsChanged ?? "ACCOUNTS_CHANGED", (payload: any) => {
      console.log("[HedraX] ACCOUNTS_CHANGED event", payload);
      const acct = extractAccount(payload) || extractAccount(connector);
      if (acct) {
        console.log("[HedraX] Setting accountId from ACCOUNTS_CHANGED:", acct);
        setAccountId(acct);
        setStatus("connected");
      }
    });

    on(HederaSessionEvent?.SessionDisconnected ?? "SESSION_DISCONNECTED", () => {
      console.log("[HedraX] SESSION_DISCONNECTED event");
      setAccountId(null);
      setStatus("ready");
    });

    const adapter: Adapter = {
      getAccountId: () => {
        try { 
          const acct = extractAccount(connector);
          console.log("[HedraX] getAccountId() returning:", acct);
          return acct;
        }
        catch { return null; }
      },
      connect: async () => {
        setStatus("connecting");
        try {
          console.log("[HedraX] Opening modal for MAINNET");
          
          await connector.openModal?.();

          // Wait a bit for the session to be established
          await new Promise(resolve => setTimeout(resolve, 500));

          // Try multiple ways to get the account
          let acct = 
            (connector as any)?.session?.accounts?.[0] ??
            (connector as any)?.accounts?.[0] ??
            (connector as any)?.accountIds?.[0] ??
            extractAccount(connector);

          console.log("[HedraX] Account after openModal:", acct);

          // If still no account, try to get signers
          if (!acct) {
            try {
              const signers = connector.signers || [];
              console.log("[HedraX] Signers:", signers);
              if (signers.length > 0 && signers[0]?.getAccountId) {
                const accountIdObj = signers[0].getAccountId();
                acct = accountIdObj?.toString() || null;
                console.log("[HedraX] Got account from signer:", acct);
              }
            } catch (e) {
              console.log("[HedraX] Failed to get account from signers:", e);
            }
          }

          if (acct) {
            console.log("[HedraX] Successfully connected with account:", acct);
            setAccountId(acct);
            setStatus("connected");
            return acct;
          }

          // No account => user rejected
          console.log("[HedraX] No account found, treating as user rejection");
          setStatus("ready");
          const err = new Error("USER_REJECTED");
          (err as any).code = "USER_REJECTED";
          throw err;
        } catch (e: any) {
          const msg = (e?.message || "").toLowerCase();
          const isRejected =
            e?.code === "USER_REJECTED" ||
            msg.includes("user rejected") ||
            msg.includes("user closed") ||
            msg.includes("cancel");

          setStatus("ready");

          if (isRejected) {
            const err = new Error("USER_REJECTED");
            (err as any).code = "USER_REJECTED";
            throw err;
          }

          console.error("[HedraX] connector.openModal failed:", e);
          setErr(e);
          throw e;
        }
      },
      disconnect: async () => {
        try { await connector.disconnect?.(); }
        finally {
          setAccountId(null);
          setStatus("ready");
        }
      },
      destroy: async () => {
        try { await connector.disconnect?.(); } catch {}
      },
    };

    // Check initial state
    try {
      const acct = adapter.getAccountId();
      if (acct) {
        setAccountId(acct);
        setStatus("connected");
      } else {
        setStatus("ready");
      }
    } catch {
      setStatus("ready");
    }

    adapterRef.current = adapter;
    return adapter;
  }, []);

  useEffect(() => {
    return () => {
      try { adapterRef.current?.destroy?.(); } catch {}
      adapterRef.current = null;
    };
  }, []);

  const connect = useCallback(async () => {
    const a = await ensureAdapter();
    return a.connect();
  }, [ensureAdapter]);

  const disconnect = useCallback(async () => {
    const a = adapterRef.current || (await ensureAdapter());
    return a.disconnect();
  }, [ensureAdapter]);

  const value = useMemo(
    () => ({ 
      status, 
      accountId, 
      network: "mainnet",
      error: err, 
      connect, 
      disconnect 
    }),
    [status, accountId, err, connect, disconnect]
  );

  return value;
}