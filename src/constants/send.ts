import { SendStatus } from "@/contexts/ActivityProvider/ActivityProvider"

export const SEND_STATUS: { [key in SendStatus]: SendStatus } = {
  success: "success",
  processing: "processing",
  failed: "failed",
}
