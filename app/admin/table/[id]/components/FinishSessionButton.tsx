'use client'

import { finishSession } from '../actions'
// import { socket } from '@/lib/socket'
import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'

export default function FinishSessionButton({ orderId, tableId }: { orderId: number, tableId: number }) {
    const router = useRouter()

    const handleFinish = async () => {
        if (!confirm('会計を終了し、テーブルをリセットしますか？')) return

        await finishSession(orderId)
        
        // Socket emit removed
        // socket.emit('reset_table', { tableId })
        
        // Refresh admin page
        router.refresh()
    }

    return (
        <button 
            onClick={handleFinish}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
            会計終了 (Finish & Reset)
        </button>
    )
}
