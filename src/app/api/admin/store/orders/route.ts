import { NextResponse } from "next/server";
import { listOrders, orderStatuses, updateOrderStatus } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, orders: listOrders(), statuses: orderStatuses });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao carregar pedidos." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) throw new Error("Pedido e status são obrigatórios.");
    const order = updateOrderStatus(body.id, body.status);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao atualizar pedido." },
      { status: 400 }
    );
  }
}
