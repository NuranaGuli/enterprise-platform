import { NextResponse } from "next/server";
import { listGameProducts, createGameProduct } from "@/lib/gameVault";
import { z } from "zod";

const GameVaultEntrySchema = z.object({
  title: z.string().min(1, { message: "Game title must not be blank." }),
  retailPrice: z.number().positive({ message: "Retail price must exceed zero." }),
  availableKeys: z.number().positive({ message: "Key count must be a positive integer." }),
  genre: z.string().min(1, { message: "Genre field cannot be left empty." }),
  platform: z.string().min(1, { message: "Distribution platform is required." }),
  ageRating: z.string().min(1, { message: "Age rating is a mandatory field." }),
  publisher: z.string().min(1, { message: "Publisher name cannot be omitted." }),
});

export const GET = async () => {
  return NextResponse.json(await listGameProducts());
};

export const POST = async (request: Request) => {
  const incomingBody = await request.json();
  const validationOutcome = GameVaultEntrySchema.safeParse(incomingBody);

  if (!validationOutcome.success) {
    return NextResponse.json(
      { error: validationOutcome.error.issues },
      { status: 422 }
    );
  }

  const newVaultEntry = await createGameProduct(validationOutcome.data);
  return NextResponse.json(newVaultEntry, { status: 201 });
};
