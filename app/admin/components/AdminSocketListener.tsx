'use client'

import { useEffect } from 'react'
import { socket } from '@/lib/socket'
import { useRouter } from 'next/navigation'

export default function AdminSocketListener() {
    const router = useRouter()

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }

        socket.emit('join_room', 'admin')

        const handleUpdate = (data: any) => {
            console.log('Received update:', data)
            // Play sound or show toast here if desired
            router.refresh()
        }

        socket.on('new_order', handleUpdate)
        socket.on('refresh_admin', handleUpdate)

        return () => {
            socket.off('new_order', handleUpdate)
            socket.off('refresh_admin', handleUpdate)
        }
    }, [router])

    return null // logical component only
}
