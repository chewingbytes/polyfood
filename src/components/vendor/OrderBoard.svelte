<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { supabaseBrowser } from "../../utils/supabase-browser";

  export let storeSanityId: string;
  export let initialOrders: any[];

  type Status = "paid" | "preparing" | "ready";

  interface Order {
    id: string;
    short_order_id: string;
    student_name: string;
    status: string;
    collection_time: string | null;
    items: Array<{ name: string; qty: number }>;
    created_at: string;
  }

  let orders: Order[] = [...initialOrders];
  let advancing: Record<string, boolean> = {};
  // Which column tab is active on mobile
  let activeTab: Status = "paid";

  const columns: Array<{
    status: Status;
    emoji: string;
    label: string;
    sublabel: string;
    accentColor: string;
    bgColor: string;
    action: string;
    actionEmoji: string;
    nextStatus: string;
  }> = [
    {
      status: "paid",
      emoji: "🆕",
      label: "New Orders",
      sublabel: "Tap START COOKING when you begin",
      accentColor: "#FF6B6B",
      bgColor: "#2a0000",
      action: "START COOKING",
      actionEmoji: "🍳",
      nextStatus: "preparing",
    },
    {
      status: "preparing",
      emoji: "🍳",
      label: "Cooking Now",
      sublabel: "Tap FOOD IS READY when done",
      accentColor: "#FFD93D",
      bgColor: "#2a2200",
      action: "FOOD IS READY",
      actionEmoji: "✅",
      nextStatus: "ready",
    },
    {
      status: "ready",
      emoji: "✅",
      label: "Ready to Collect",
      sublabel: "Tap COLLECTED when student picks up",
      accentColor: "#4ade80",
      bgColor: "#002a10",
      action: "COLLECTED",
      actionEmoji: "👋",
      nextStatus: "collected",
    },
  ];

  function columnOrders(status: string): Order[] {
    return orders.filter((o) => o.status === status);
  }

  function formatTime(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  async function advance(order: Order, nextStatus: string) {
    advancing = { ...advancing, [order.id]: true };
    await fetch(`/api/vendor/orders/${order.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    orders = orders.map((o) =>
      o.id === order.id ? { ...o, status: nextStatus } : o
    );
    advancing = { ...advancing, [order.id]: false };
  }

  let channel: any;
  let realtimeStatus: "connecting" | "live" | "error" = "connecting";

  onMount(() => {
    channel = supabaseBrowser
      .channel(`store-orders-${storeSanityId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_orders",
          filter: `store_sanity_id=eq.${storeSanityId}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            orders = [...orders, payload.new as Order];
          } else if (payload.eventType === "UPDATE") {
            orders = orders.map((o) =>
              o.id === payload.new.id ? (payload.new as Order) : o
            );
          } else if (payload.eventType === "DELETE") {
            orders = orders.filter((o) => o.id !== payload.old.id);
          }
        }
      )
      .subscribe((status: string, err?: Error) => {
        if (status === "SUBSCRIBED") {
          realtimeStatus = "live";
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          realtimeStatus = "error";
          console.error("[OrderBoard] Realtime subscription error:", status, err);
        }
      });
  });

  onDestroy(() => {
    if (channel) supabaseBrowser.removeChannel(channel);
  });

  $: totalActive = orders.filter((o) => o.status !== "collected").length;
  $: newCount = columnOrders("paid").length;
</script>

<!-- Connection status strip -->
<div style="margin-bottom:1.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
  <div style="display:flex; align-items:center; gap:0.75rem;">
    {#if realtimeStatus === "live"}
      <span style="display:inline-flex;align-items:center;gap:0.5rem;background:#002a10;border:2px solid #4ade80;padding:0.5rem 1rem;font-size:1rem;font-weight:900;color:#4ade80;border-radius:4px;">
        <span style="width:10px;height:10px;background:#4ade80;border-radius:50%;display:inline-block;animation:pulse 2s infinite;"></span>
        Connected — orders update automatically
      </span>
    {:else if realtimeStatus === "error"}
      <span style="display:inline-flex;align-items:center;gap:0.5rem;background:#2a0000;border:2px solid #FF6B6B;padding:0.5rem 1rem;font-size:1rem;font-weight:900;color:#FF6B6B;border-radius:4px;">
        ⚠️ Connection lost — please refresh the page
      </span>
    {:else}
      <span style="display:inline-flex;align-items:center;gap:0.5rem;background:#222;border:2px solid #555;padding:0.5rem 1rem;font-size:1rem;font-weight:700;color:#888;border-radius:4px;">
        Connecting…
      </span>
    {/if}
  </div>

  {#if newCount > 0}
    <div style="background:#FF6B6B;color:#000;padding:0.5rem 1.25rem;font-size:1.125rem;font-weight:900;border-radius:4px;animation:bounce 1s infinite;">
      🔔 {newCount} new order{newCount > 1 ? 's' : ''}!
    </div>
  {/if}
</div>

<!-- Mobile tab switcher (visible on small screens) -->
<div class="tab-bar">
  {#each columns as col}
    {@const count = columnOrders(col.status).length}
    <button
      class="tab-btn"
      on:click={() => (activeTab = col.status)}
      style="
        flex:1;
        padding:0.75rem 0.5rem;
        font-family:inherit;
        font-size:1rem;
        font-weight:900;
        border:none;
        border-bottom: 4px solid {activeTab === col.status ? col.accentColor : 'transparent'};
        background:{activeTab === col.status ? col.bgColor : '#1a1a1a'};
        color:{activeTab === col.status ? col.accentColor : '#666'};
        cursor:pointer;
        transition:all 0.15s;
      "
    >
      {col.emoji} {col.label}
      {#if count > 0}
        <span style="display:inline-block;background:{col.accentColor};color:#000;border-radius:50%;width:1.5rem;height:1.5rem;line-height:1.5rem;font-size:0.875rem;margin-left:0.25rem;">
          {count}
        </span>
      {/if}
    </button>
  {/each}
</div>

<!-- Desktop 3-column grid / Mobile shows active tab only -->
<div class="board-grid">
  {#each columns as col}
    {@const colOrders = columnOrders(col.status)}
    <div class="board-col" class:hidden-mobile={activeTab !== col.status}>
      <!-- Column header -->
      <div style="background:{col.bgColor}; border:3px solid {col.accentColor}; border-radius:4px; padding:1rem 1.25rem; margin-bottom:1rem; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="font-size:1.5rem; font-weight:900; color:{col.accentColor};">
            {col.emoji} {col.label}
          </div>
          <div style="font-size:0.875rem; font-weight:700; color:#888; margin-top:0.25rem;">
            {col.sublabel}
          </div>
        </div>
        <div style="font-size:2.5rem; font-weight:900; color:{col.accentColor}; line-height:1;">
          {colOrders.length}
        </div>
      </div>

      <!-- Order cards -->
      <div style="display:flex; flex-direction:column; gap:1rem;">
        {#each colOrders as order (order.id)}
          <div style="background:#222; border:3px solid {col.accentColor}; border-radius:4px; overflow:hidden;">

            <!-- Order number + time -->
            <div style="background:{col.bgColor}; padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333;">
              <span style="font-size:2rem; font-weight:900; color:{col.accentColor}; letter-spacing:0.05em;">
                {order.short_order_id}
              </span>
              <div style="text-align:right;">
                <div style="font-size:0.875rem; font-weight:700; color:#888;">Collect by</div>
                <div style="font-size:1.25rem; font-weight:900; color:#fff;">{formatTime(order.collection_time)}</div>
              </div>
            </div>

            <!-- Student name -->
            <div style="padding:1rem 1.25rem; border-bottom:2px solid #333; display:flex; align-items:center; gap:0.75rem;">
              <span style="font-size:1.5rem;">👤</span>
              <div>
                <div style="font-size:0.75rem; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.05em;">Student Name</div>
                <div style="font-size:1.25rem; font-weight:900; color:#fff;">{order.student_name}</div>
              </div>
            </div>

            <!-- Items -->
            <div style="padding:1rem 1.25rem; border-bottom:2px solid #333;">
              <div style="font-size:0.75rem; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem;">Items Ordered</div>
              {#each order.items as item}
                <div style="display:flex; align-items:center; gap:0.75rem; padding:0.4rem 0;">
                  <span style="background:{col.accentColor}; color:#000; font-weight:900; font-size:1rem; min-width:2rem; height:2rem; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;">
                    {item.qty}
                  </span>
                  <span style="font-size:1.125rem; font-weight:700; color:#fff;">{item.name}</span>
                </div>
              {/each}
            </div>

            <!-- Action button -->
            <div style="padding:1rem;">
              <button
                on:click={() => advance(order, col.nextStatus)}
                disabled={advancing[order.id]}
                style="
                  width:100%;
                  border:none;
                  background:{advancing[order.id] ? '#333' : col.accentColor};
                  color:{advancing[order.id] ? '#888' : '#000'};
                  padding:1.25rem;
                  font-family:inherit;
                  font-size:1.25rem;
                  font-weight:900;
                  cursor:{advancing[order.id] ? 'not-allowed' : 'pointer'};
                  border-radius:4px;
                  transition:all 0.15s;
                  letter-spacing:0.03em;
                "
              >
                {advancing[order.id] ? "⏳ Updating…" : `${col.actionEmoji} ${col.action}`}
              </button>
            </div>
          </div>
        {:else}
          <div style="border:3px dashed #333; border-radius:4px; padding:3rem 1.5rem; text-align:center;">
            <div style="font-size:2.5rem; margin-bottom:0.75rem; opacity:0.3;">🕐</div>
            <p style="font-size:1rem; font-weight:700; color:#555;">Nothing here yet</p>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

{#if totalActive === 0}
  <div style="background:#1a1a1a; border:3px dashed #333; border-radius:4px; padding:4rem 2rem; text-align:center; margin-top:1rem;">
    <div style="font-size:4rem; margin-bottom:1rem;">😴</div>
    <p style="font-size:1.5rem; font-weight:900; color:#555; margin-bottom:0.5rem;">No active orders</p>
    <p style="font-size:1rem; font-weight:700; color:#444;">New orders will appear here automatically!</p>
  </div>
{/if}

<style>
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .tab-bar {
    display: none;
    margin-bottom: 1rem;
    background: #1a1a1a;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid #333;
  }

  .board-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .tab-bar {
      display: flex;
    }
    .board-grid {
      display: block;
    }
    .board-col {
      display: block;
    }
    .hidden-mobile {
      display: none !important;
    }
  }
</style>

