import { NextResponse } from "next/server";

export const POST = async () => {
  const serverResponse = NextResponse.json({
    message: "Player session terminated. See you next game! 👋",
  });
  serverResponse.cookies.delete("gk_token");
  return serverResponse;
};
