import { NextResponse } from "next/server";
import { updateGameProduct } from "@/lib/gameVault";

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { availableKeys } = await request.json();

  const targetGame = await updateGameProduct(id, { availableKeys });

  if (!targetGame) {
    return NextResponse.json(
      { error: "Allocation adjustment failed — game entry not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(targetGame);
};
