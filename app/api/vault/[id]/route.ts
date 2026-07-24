import { getGameProductById, updateGameProduct, deleteGameProduct, listGameProducts } from "@/lib/gameVault";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locatedGame = await getGameProductById(id);

  if (!locatedGame) {
    return NextResponse.json(
      { error: "No vault entry found for the specified game identifier." },
      { status: 404 }
    );
  }

  return NextResponse.json(locatedGame);
};

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  let updateFields;
  try {
    updateFields = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body is malformed — valid JSON is required." },
      { status: 400 }
    );
  }

  const targetGame = await updateGameProduct(id, updateFields);
  if (!targetGame) {
    return NextResponse.json(
      { error: "Vault entry unavailable — cannot apply update to non-existent record." },
      { status: 404 }
    );
  }

  return NextResponse.json(targetGame);
};

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const deleted = await deleteGameProduct(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Removal failed — vault entry does not exist." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    delistedId: id,
    remainingCount: (await listGameProducts()).length,
  });
};
