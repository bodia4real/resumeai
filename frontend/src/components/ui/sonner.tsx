import { useEffect, useState } from "react"

interface SonnerToast {
  id: string
  message: string
  type?: "success" | "error" | "info" | "loading"
}

let toastCount = 0

export function toast(message: string, type: string = "default") {
  console.log(`[Toast ${type}]: ${message}`)
}

export const Toaster = () => null
