import * as React from "react"

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const limit = 1
const listeners: Array<(toast: ToasterToast) => void> = []

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  React.useEffect(() => {
    listeners.push((toast) => {
      setToasts((state) => [toast, ...state].slice(0, limit))
    })
  }, [])

  const toast = React.useCallback(
    ({
      title,
      description,
      action,
      ...props
    }: Omit<ToasterToast, "id">) => {
      const id = genId()

      const update = (props: ToasterToast) =>
        setToasts((state) =>
          state.map((t) => (t.id === id ? { ...t, ...props } : t))
        )
      const dismiss = () => setToasts((state) => state.filter((t) => t.id !== id))

      const { dismiss: actionDismiss, ...actionProps } = (action as any) || {}

      listeners.forEach((listener) => {
        listener({
          id,
          title,
          description,
          action: (
            <button
              onClick={() => {
                actionDismiss?.()
                dismiss()
              }}
              {...actionProps}
            />
          ),
          open: true,
          onOpenChange: (open) => {
            if (!open) dismiss()
          },
        })
      })

      return {
        id: id,
        dismiss,
        update,
      }
    },
    []
  )

  return {
    toast,
    toasts,
  }
}
