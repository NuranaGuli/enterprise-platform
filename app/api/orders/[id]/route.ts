import { getPurchaseOrderById, updatePurchaseOrder, deletePurchaseOrder } from "@/lib/gameVault";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locatedOrder = await getPurchaseOrderById(id);

  if (!locatedOrder) {
    return NextResponse.json(
      { error: "Purchase order not found for the given identifier." },
      { status: 404 }
    );
  }

  return NextResponse.json(locatedOrder);
};

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  let amendmentData;
  try {
    amendmentData = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed payload — JSON structure expected." },
      { status: 400 }
    );
  }

  const orderToAmend = await updatePurchaseOrder(id, amendmentData);
  if (!orderToAmend) {
    return NextResponse.json(
      { error: "Cannot amend — order record does not exist." },
      { status: 404 }
    );
  }

  return NextResponse.json(orderToAmend);
};

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const deleted = await deletePurchaseOrder(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Cancellation failed — no matching order record found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ cancelledOrderId: id });
};
