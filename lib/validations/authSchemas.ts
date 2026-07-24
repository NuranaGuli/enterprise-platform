import { z } from "zod";


export const PlayerRegistrationSchema = z
  .object({
    playerEmail: z
      .string()
      .min(1, {
        message: "A valid email address is required to create your account.",
      })
      .email({
        message: "The provided email address format is not recognized.",
      }),

    securityKey: z
      .string()
      .min(8, {
        message: "Your security key must contain at least 8 characters.",
      })
      .max(64, {
        message: "Security key must not exceed 64 characters.",
      })
      .regex(/[A-Z]/, {
        message: "Security key must include at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Security key must include at least one numeric digit.",
      }),

    confirmSecurityKey: z.string().min(1, {
      message: "Please confirm your security key before submitting.",
    }),
  })
  .refine((fields) => fields.securityKey === fields.confirmSecurityKey, {
    message:
      "Security keys do not match — please re-enter both fields.",
    path: ["confirmSecurityKey"],
  });


export const PlayerSignInSchema = z.object({
  playerEmail: z
    .string()
    .min(1, { message: "Email address cannot be left blank." })
    .email({ message: "Please supply a properly formatted email address." }),

  securityKey: z.string().min(1, {
    message: "Security key is required to proceed with authentication.",
  }),
});


export type PlayerRegistrationInput = z.infer<typeof PlayerRegistrationSchema>;
export type PlayerSignInInput = z.infer<typeof PlayerSignInSchema>;
