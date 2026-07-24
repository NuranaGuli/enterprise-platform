"use server";

import { createGameProduct } from "@/lib/gameVault";
import { z } from "zod";

const GameListingSchema = z.object({
  title: z
    .string()
    .min(1, { message: "A game title is required to proceed with listing." }),
  retailPrice: z
    .number()
    .positive({ message: "Retail price must be a positive monetary value." }),
  availableKeys: z
    .number()
    .positive({ message: "Available key count must be greater than zero." }),
  genre: z
    .string()
    .min(1, { message: "Genre classification is mandatory for all listings." }),
  platform: z
    .string()
    .min(1, { message: "Distribution platform must be specified." }),
  ageRating: z
    .string()
    .min(1, { message: "Age rating declaration cannot be omitted." }),
  publisher: z
    .string()
    .min(1, { message: "Publisher information is required." }),
});

export const dispatchGameListing = async (formData: FormData) => {
  const incomingFields = {
    title: formData.get("title") as string,
    retailPrice: Number(formData.get("retailPrice")),
    availableKeys: Number(formData.get("availableKeys")),
    genre: formData.get("genre") as string,
    platform: formData.get("platform") as string,
    ageRating: formData.get("ageRating") as string,
    publisher: formData.get("publisher") as string,
  };

  const schemaCheck = GameListingSchema.safeParse(incomingFields);

  if (!schemaCheck.success) {
    console.error("[CyberKey Vault] Listing dispatch failed:", schemaCheck.error.issues);
    return { committed: false, violations: schemaCheck.error.issues };
  }

  const freshListing = await createGameProduct(schemaCheck.data);
  return { committed: true, listing: freshListing };
};
