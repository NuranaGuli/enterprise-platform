import { listPurchaseOrders, createPurchaseOrder } from "@/lib/gameVault";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma";

const OrderSubmissionSchema = z.object({
  gameId: z.string().min(1, { message: "A valid game identifier is required." }),
  unitCount: z.number().positive({ message: "Unit count must be at least one." }),
  deliveryState: z.string().min(1, { message: "Delivery state must be declared at order creation." }),
  customerId: z.string().min(1, { message: "Customer identifier is mandatory." }),
  grandTotal: z.number().positive({ message: "Grand total must reflect a positive value." }),
});

export const GET = async () => {
  return NextResponse.json(await listPurchaseOrders());
};

export const POST = async (request: Request) => {
  const requestBody = await request.json();
  const schemaResult = OrderSubmissionSchema.safeParse(requestBody);

  if (!schemaResult.success) {
    return NextResponse.json(
      { error: schemaResult.error.issues },
      { status: 422 }
    );
  }

  try {
    const committedOrder = await createPurchaseOrder(schemaResult.data);
    return NextResponse.json(committedOrder, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      // Foreign key constraint failed — gameId or customerId doesn't
      // reference an existing GameProduct / Player row.
      const field = (err.meta?.field_name as string | undefined) ?? "";
      const invalidField = field.includes("customerId")
        ? "customerId"
        : "gameId";

      return NextResponse.json(
        {
          error: `No matching ${invalidField === "gameId" ? "game" : "player"} was found for the given ${invalidField}. Double-check the ID and try again.`,
        },
        { status: 404 }
      );
    }

    console.error("[CyberKey] Failed to create purchase order:", err);
    return NextResponse.json(
      { error: "Unexpected error while creating the purchase order." },
      { status: 500 }
    );
  }
};
