'use client'

import { PostHogProvider } from './PostHogProvider'

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    return <PostHogProvider>{children}</PostHogProvider>
}