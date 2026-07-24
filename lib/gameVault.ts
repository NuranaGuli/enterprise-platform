import { prisma } from "@/lib/prisma";
import type {
  Player as PlayerAccount,
  GameProduct,
  PurchaseOrder,
} from "@/lib/generated/prisma";

export type { PlayerAccount, GameProduct, PurchaseOrder };

/* ------------------------------ Game Products ------------------------------ */

export async function listGameProducts(): Promise<GameProduct[]> {
  return prisma.gameProduct.findMany();
}

export async function getGameProductById(id: string): Promise<GameProduct | undefined> {
  const game = await prisma.gameProduct.findUnique({ where: { id } });
  return game ?? undefined;
}

export async function createGameProduct(
  data: Omit<GameProduct, "id">,
): Promise<GameProduct> {
  return prisma.gameProduct.create({ data });
}

export async function updateGameProduct(
  id: string,
  patch: Partial<Omit<GameProduct, "id">>,
): Promise<GameProduct | undefined> {
  try {
    return await prisma.gameProduct.update({ where: { id }, data: patch });
  } catch {
    return undefined;
  }
}

export async function deleteGameProduct(id: string): Promise<boolean> {
  try {
    await prisma.gameProduct.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------ Purchase Orders ------------------------------ */

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  return prisma.purchaseOrder.findMany();
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  const order = await prisma.purchaseOrder.findUnique({ where: { id } });
  return order ?? undefined;
}

export async function createPurchaseOrder(
  data: Omit<PurchaseOrder, "id">,
): Promise<PurchaseOrder> {
  return prisma.purchaseOrder.create({ data });
}

export async function updatePurchaseOrder(
  id: string,
  patch: Partial<Omit<PurchaseOrder, "id">>,
): Promise<PurchaseOrder | undefined> {
  try {
    return await prisma.purchaseOrder.update({ where: { id }, data: patch });
  } catch {
    return undefined;
  }
}

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  try {
    await prisma.purchaseOrder.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------- Players -------------------------------- */

export async function getPlayerById(id: string): Promise<PlayerAccount | undefined> {
  const player = await prisma.player.findUnique({ where: { id } });
  return player ?? undefined;
}

export async function getPlayerByEmail(playerEmail: string): Promise<PlayerAccount | undefined> {
  const player = await prisma.player.findUnique({ where: { playerEmail } });
  return player ?? undefined;
}

export async function createPlayerAccount(
  data: Omit<PlayerAccount, "id" | "accountTier"> & { accountTier?: string },
): Promise<PlayerAccount> {
  return prisma.player.create({
    data: {
      playerEmail: data.playerEmail,
      hashedSecurityKey: data.hashedSecurityKey,
      accountTier: data.accountTier ?? "player",
    },
  });
}

export function omitSecurityKey(player: PlayerAccount): Omit<PlayerAccount, "hashedSecurityKey"> {
  const rest: Partial<PlayerAccount> = { ...player };
  delete rest.hashedSecurityKey;
  return rest as Omit<PlayerAccount, "hashedSecurityKey">;
}
